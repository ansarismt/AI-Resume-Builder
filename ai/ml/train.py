import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import chi2
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.naive_bayes import ComplementNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.utils.class_weight import compute_sample_weight


ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "data" / "Resume.csv"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

SKILL_TERMS = (
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "excel",
    "power bi",
    "tableau",
    "react",
    "django",
    "aws",
    "azure",
    "machine learning",
    "data analysis",
    "project management",
    "communication",
    "leadership",
    "sales",
    "marketing",
    "accounting",
    "financial analysis",
    "customer service",
    "html",
    "css",
    "node.js",
    "c++",
    "c#",
    "linux",
    "git",
    "docker",
    "kubernetes",
    "networking",
    "cybersecurity",
    "human resources",
    "recruiting",
    "research",
    "teaching",
    "public relations",
    "writing",
    "graphic design",
    "autocad",
    "quality assurance",
    "supply chain",
    "operations",
    "negotiation",
    "forecasting",
    "budgeting",
    "healthcare",
    "clinical",
    "food safety",
    "aviation",
    "logistics",
    "consulting",
    "agile",
    "scrum",
)

SECTION_HEADINGS = {
    "summary": ("summary", "profile", "objective", "career objective"),
    "experience": ("experience", "work experience", "employment", "professional experience"),
    "education": ("education", "academic background", "qualifications"),
    "skills": ("skills", "technical skills", "core competencies"),
    "projects": ("projects", "selected projects"),
    "certifications": ("certifications", "licenses", "certificates"),
}


class BalancedComplementNB(ComplementNB):
    def fit(self, X, y, sample_weight=None):
        balanced_weights = (
            compute_sample_weight("balanced", y) if sample_weight is None else sample_weight
        )
        return super().fit(X, y, sample_weight=balanced_weights)


def clean_resume(value):
    text = str(value or "").lower()
    text = re.sub(r"<[^>]*>", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b", " ", text)
    text = re.sub(r"(?<!\w)(?:\+?\d[\d().\-\s]{7,}\d)(?!\w)", " ", text)
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def _section_order(text):
    found = []
    for section, headings in SECTION_HEADINGS.items():
        positions = [
            match.start()
            for heading in headings
            if (match := re.search(rf"(?:^|\n)\s*{re.escape(heading)}\s*:?\s*(?:\n|$)", text, re.I))
        ]
        if positions:
            found.append((min(positions), section))
    return [section for _, section in sorted(found)]


def _category_statistics(texts, labels, vectorizer, matrix):
    feature_names = vectorizer.get_feature_names_out()
    all_keywords = {}
    skill_statistics = {}
    section_statistics = {}
    length_statistics = {}
    skill_frequency_statistics = {}
    skill_lift_statistics = {}
    total_text_count = len(texts)
    global_skill_counts = {}
    for term in SKILL_TERMS:
        escaped_term = re.escape(term).replace(" ", r"\s+")
        pattern = re.compile(
            r"(?<![A-Za-z0-9])" + escaped_term + r"(?![A-Za-z0-9])",
            re.I,
        )
        global_skill_counts[term] = sum(bool(pattern.search(text)) for text in texts)

    for category in sorted(set(labels)):
        category_mask = np.asarray(labels) == category
        scores, _ = chi2(matrix, category_mask.astype(int))
        scores = np.nan_to_num(scores, nan=0.0, posinf=0.0)
        top_indices = np.argsort(scores)[-30:][::-1]
        all_keywords[category] = [str(feature_names[index]) for index in top_indices]

        category_text = [texts[index] for index, included in enumerate(category_mask) if included]
        counts = Counter()
        for term in SKILL_TERMS:
            escaped_term = re.escape(term).replace(" ", r"\s+")
            pattern = re.compile(
                r"(?<![A-Za-z0-9])" + escaped_term + r"(?![A-Za-z0-9])",
                re.I,
            )
            count = sum(bool(pattern.search(text)) for text in category_text)
            if count and count / len(category_text) >= 0.05:
                counts[term] = count
        lifts = {
            term: (count / len(category_text)) / (global_skill_counts[term] / total_text_count)
            for term, count in counts.items()
            if global_skill_counts[term]
        }
        ranked_skills = sorted(
            counts,
            key=lambda term: (lifts[term], counts[term], term),
            reverse=True,
        )[:20]
        skill_statistics[category] = ranked_skills
        skill_frequency_statistics[category] = {term: counts[term] for term in ranked_skills}
        skill_lift_statistics[category] = {term: round(lifts[term], 4) for term in ranked_skills}

        orders = Counter(
            tuple(order) for order in (_section_order(text) for text in category_text) if order
        )
        section_statistics[category] = list(orders.most_common(1)[0][0]) if orders else []
        length_statistics[category] = int(np.median([len(text) for text in category_text]))

    return {
        category: {
            "top_keywords": all_keywords[category],
            "common_skills": skill_statistics[category],
            "common_skill_counts": skill_frequency_statistics[category],
            "common_skill_lifts": skill_lift_statistics[category],
            "typical_section_order": section_statistics[category],
            "typical_resume_length": length_statistics[category],
        }
        for category in sorted(all_keywords)
    }


def _small_class_recall(test_labels, report):
    smallest_categories = sorted(
        Counter(test_labels).items(),
        key=lambda item: (item[1], item[0]),
    )[:2]
    return {
        category: report.get(category, {}).get("recall", 0.0) for category, _ in smallest_categories
    }


def train_model(data_path=DATA_PATH, artifacts_dir=ARTIFACTS_DIR):
    data_path = Path(data_path)
    artifacts_dir = Path(artifacts_dir)
    if not data_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {data_path}. Place Resume/Resume.csv at data/Resume.csv."
        )

    dataframe = pd.read_csv(data_path, usecols=["Resume_str", "Category"])
    dataframe["clean_text"] = dataframe["Resume_str"].map(clean_resume)
    dataframe = dataframe.dropna(subset=["Category"])
    dataframe = dataframe[dataframe["clean_text"].str.len() >= 200]
    if dataframe.empty:
        raise ValueError("No resume rows remain after cleaning and minimum-length filtering.")

    texts = dataframe["clean_text"].tolist()
    labels = dataframe["Category"].astype(str).tolist()
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels,
    )
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        max_features=50000,
        stop_words="english",
    )
    candidates = {
        "LogisticRegression": LogisticRegression(
            class_weight="balanced",
            max_iter=1500,
            random_state=42,
        ),
        "LinearSVC": LinearSVC(class_weight="balanced", random_state=42),
        "ComplementNB": BalancedComplementNB(),
    }
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = {}
    for name, classifier in candidates.items():
        pipeline = Pipeline(
            [
                ("tfidf", vectorizer),
                ("classifier", classifier),
            ]
        )
        result = cross_validate(
            pipeline,
            train_texts,
            train_labels,
            cv=folds,
            scoring={"accuracy": "accuracy", "f1_macro": "f1_macro"},
            n_jobs=1,
        )
        scores[name] = {
            "accuracy": float(result["test_accuracy"].mean()),
            "macro_f1": float(result["test_f1_macro"].mean()),
        }

    best_name = max(scores, key=lambda name: scores[name]["macro_f1"])
    best_classifier = candidates[best_name]
    if isinstance(best_classifier, LinearSVC):
        best_classifier = CalibratedClassifierCV(
            estimator=best_classifier,
            method="sigmoid",
            cv=5,
        )
    best_pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                    max_features=50000,
                    stop_words="english",
                ),
            ),
            ("classifier", best_classifier),
        ]
    )
    if isinstance(best_pipeline.named_steps["classifier"], BalancedComplementNB):
        balanced_weights = compute_sample_weight("balanced", train_labels)
        best_pipeline.fit(
            train_texts,
            train_labels,
            classifier__sample_weight=balanced_weights,
        )
    else:
        best_pipeline.fit(train_texts, train_labels)

    predicted = best_pipeline.predict(test_texts)
    report = classification_report(
        test_labels,
        predicted,
        labels=best_pipeline.classes_,
        output_dict=True,
        zero_division=0,
    )
    metrics = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_rows_used": len(texts),
        "labels": [str(label) for label in best_pipeline.classes_],
        "selected_model": best_name,
        "cross_validation": scores,
        "test_accuracy": float(accuracy_score(test_labels, predicted)),
        "test_macro_f1": float(f1_score(test_labels, predicted, average="macro")),
        "classification_report": report,
        "small_class_recall": _small_class_recall(test_labels, report),
    }

    stats_vectorizer = best_pipeline.named_steps["tfidf"]
    stats_matrix = stats_vectorizer.transform(texts)
    category_stats = _category_statistics(
        texts,
        labels,
        stats_vectorizer,
        stats_matrix,
    )

    artifacts_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_pipeline, artifacts_dir / "resume_classifier.joblib")
    (artifacts_dir / "metrics.json").write_text(
        json.dumps(metrics, indent=2),
        encoding="utf-8",
    )
    (artifacts_dir / "labels.json").write_text(
        json.dumps(metrics["labels"], indent=2),
        encoding="utf-8",
    )
    (artifacts_dir / "category_stats.json").write_text(
        json.dumps(category_stats, indent=2),
        encoding="utf-8",
    )

    print(f"Selected model: {best_name}")
    print(f"Test accuracy: {metrics['test_accuracy']:.4f}")
    print(f"Test macro-F1: {metrics['test_macro_f1']:.4f}")
    print(classification_report(test_labels, predicted, zero_division=0))
    for category, recall in metrics["small_class_recall"].items():
        print(f"{category} recall: {recall:.4f}")
    return metrics
