import json
import re
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity


ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
CONFIDENCE_THRESHOLD = 0.25
_RESUME_FIELDS = (
    "name",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "internships",
    "certifications",
    "achievements",
)


class ModelUnavailableError(Exception):
    pass


@lru_cache(maxsize=1)
def _load_pipeline(modified_at):
    model_path = ARTIFACTS_DIR / "resume_classifier.joblib"
    return joblib.load(model_path)


def load_pipeline():
    model_path = ARTIFACTS_DIR / "resume_classifier.joblib"
    if not model_path.is_file():
        raise ModelUnavailableError(
            "The resume ML model is not trained. Run `python manage.py train_model`."
        )
    return _load_pipeline(model_path.stat().st_mtime_ns)


load_pipeline.cache_clear = _load_pipeline.cache_clear


@lru_cache(maxsize=1)
def _load_category_stats(modified_at):
    path = ARTIFACTS_DIR / "category_stats.json"
    return json.loads(path.read_text(encoding="utf-8"))


def load_category_stats():
    path = ARTIFACTS_DIR / "category_stats.json"
    if not path.is_file():
        raise ModelUnavailableError(
            "Resume category statistics are unavailable. Run `python manage.py train_model`."
        )
    return _load_category_stats(path.stat().st_mtime_ns)


load_category_stats.cache_clear = _load_category_stats.cache_clear


def load_model_info():
    path = ARTIFACTS_DIR / "metrics.json"
    if not path.is_file():
        raise ModelUnavailableError(
            "Model metrics are unavailable. Run `python manage.py train_model`."
        )
    return json.loads(path.read_text(encoding="utf-8"))


def resume_to_text(resume):
    parts = []
    for key in _RESUME_FIELDS:
        value = resume.get(key, "")
        if isinstance(value, list):
            value = " ".join(str(item) for item in value)
        if isinstance(value, str) and value.strip():
            parts.append(value.strip())
    return "\n".join(parts)


def _probabilities(pipeline, text):
    classifier = pipeline.named_steps["classifier"]
    vectorizer = pipeline.named_steps["tfidf"]
    vector = vectorizer.transform([text])
    classes = classifier.classes_
    if hasattr(classifier, "predict_proba"):
        scores = classifier.predict_proba(vector)[0]
    else:
        raw_scores = classifier.decision_function(vector)
        if raw_scores.ndim == 1:
            raw_scores = np.column_stack((-raw_scores, raw_scores))
        raw_scores = np.asarray(raw_scores)[0]
        shifted = raw_scores - raw_scores.max()
        exponentials = np.exp(shifted)
        scores = exponentials / exponentials.sum()
    return [
        {"category": str(classes[index]), "confidence": float(scores[index])}
        for index in range(len(classes))
    ]


def predict_categories(text, pipeline=None):
    active_pipeline = pipeline or load_pipeline()
    return sorted(
        _probabilities(active_pipeline, text),
        key=lambda item: item["confidence"],
        reverse=True,
    )


def job_role_matches(resume, user_type="professional"):
    text = resume_to_text(resume)
    if not text.strip():
        return {
            "suggestions": [],
            "note": "Add resume details to get suggested fields.",
        }
    predictions = predict_categories(text)
    suggestions = [
        prediction
        for prediction in predictions[:3]
        if prediction["confidence"] >= CONFIDENCE_THRESHOLD
    ]
    note = "Suggestions are based on a general resume dataset, not a definitive verdict."
    if user_type in {"school", "college"}:
        note += " The training dataset is mostly professional resumes, so student results may be less reliable."
    return {"suggestions": suggestions, "note": note}


def category_skills(target_role):
    matches = predict_categories(target_role)
    if not matches or matches[0]["confidence"] < CONFIDENCE_THRESHOLD:
        raise ModelUnavailableError(
            "The target role did not match a resume category with sufficient confidence."
        )
    stats = load_category_stats()
    category = matches[0]["category"]
    return stats.get(category, {}).get("common_skills", [])


def _required_sections(user_type):
    if user_type == "school":
        return ("summary", "education", "skills", "achievements")
    if user_type == "college":
        return ("summary", "education", "skills", "projects", "internships")
    return ("summary", "experience", "skills", "education")


def _keyword_match(resume_text, job_description, vectorizer):
    jd_vector = vectorizer.transform([job_description])
    feature_names = vectorizer.get_feature_names_out()
    weights = jd_vector.toarray()[0]
    ranked_indices = weights.argsort()[::-1]
    keywords = [
        str(feature_names[index])
        for index in ranked_indices
        if weights[index] > 0
    ]
    domain_terms = re.findall(
        r"(?<!\w)(?:\.NET|[A-Za-z][A-Za-z0-9]*(?:[.+#/-][A-Za-z0-9+#.-]*)*)(?!\w)",
        job_description,
        re.IGNORECASE,
    )
    seen = {keyword.casefold() for keyword in keywords}
    for term in domain_terms:
        normalized = term.casefold().strip(".")
        if (
            len(normalized) < 2
            or normalized in ENGLISH_STOP_WORDS
            or not (
                term.isupper()
                or term[0].isupper()
                or re.search(r"\d|[.+#/-]", term)
            )
            or normalized in seen
        ):
            continue
        keywords.append(term)
        seen.add(normalized)
    keywords = keywords[:20]
    resume_lower = resume_text.lower()
    matched = []
    for keyword in keywords:
        escaped_keyword = re.escape(keyword).replace(r"\ ", r"\s+")
        if re.search(rf"(?<!\w){escaped_keyword}(?!\w)", resume_lower, re.IGNORECASE):
            matched.append(keyword)
    missing = [keyword for keyword in keywords if keyword not in matched]
    percent = round(100 * len(matched) / len(keywords)) if keywords else 0
    return matched, missing, percent


def ats_analysis(resume, job_description, pipeline=None):
    pipeline = pipeline or load_pipeline()
    vectorizer = pipeline.named_steps["tfidf"]
    resume_text = resume_to_text(resume)
    job_text = job_description.strip()
    if not resume_text or not job_text:
        raise ValueError("Resume and job description text are required.")

    vectors = vectorizer.transform([resume_text, job_text])
    similarity = float(cosine_similarity(vectors[0], vectors[1])[0][0])
    matched, missing, keyword_percent = _keyword_match(resume_text, job_text, vectorizer)
    user_type = resume.get("user_type", "professional")
    sections = {
        section: bool(str(resume.get(section, "")).strip())
        for section in _required_sections(user_type)
    }
    completeness = round(100 * sum(sections.values()) / len(sections))
    overall = round(
        0.45 * similarity * 100
        + 0.4 * keyword_percent
        + 0.15 * completeness
    )
    warnings = []
    if not resume.get("email") and not resume.get("phone"):
        warnings.append("Add at least one contact method.")
    if not resume.get("summary"):
        warnings.append("Add a concise summary or objective.")
    if len(resume_text) < 400:
        warnings.append("Resume content may be too brief for effective screening.")
    if len(resume_text) > 12000:
        warnings.append("Resume content may be too long; consider prioritizing relevant details.")

    return {
        "overall_score": max(0, min(100, overall)),
        "keyword_match_percent": keyword_percent,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "section_completeness": sections,
        "formatting_warnings": warnings,
    }


_ACTION_VERBS = {
    "achieved", "analyzed", "built", "created", "delivered", "designed", "developed",
    "directed", "improved", "implemented", "increased", "launched", "led", "managed",
    "optimized", "organized", "reduced", "resolved", "streamlined",
}
_FIRST_PERSON = re.compile(
    r"\bI\b|(?i:\b(?:me|my|mine|we|our|ours)\b)"
)
_DATE_PATTERN = re.compile(
    r"\b(?:19|20)\d{2}\b",
)


def resume_strength(resume, pipeline=None, category_stats=None):
    pipeline = pipeline or load_pipeline()
    resume_text = resume_to_text(resume)
    if not resume_text.strip():
        raise ValueError("Resume content is required.")

    predictions = predict_categories(resume_text, pipeline)
    category = predictions[0]["category"] if predictions else ""
    stats = (category_stats or load_category_stats()).get(category, {})
    norm = stats.get("typical_resume_length", 0)
    sections = _required_sections(resume.get("user_type", "professional"))
    completed = sum(bool(str(resume.get(section, "")).strip()) for section in sections)
    section_score = round(30 * completed / len(sections))

    bullet_candidates = [
        line.strip(" •-\t")
        for value in (resume.get("experience", ""), resume.get("projects", ""))
        for line in str(value).splitlines()
        if line.strip()
    ]
    if not bullet_candidates:
        bullet_candidates = [
            line.strip(" •-\t")
            for value in (resume.get("experience", ""), resume.get("projects", ""))
            for line in re.split(r"(?<=[.!?])\s+", str(value))
            if line.strip()
        ]
    quality = [
        len(bullet) >= 30
        and any(bullet.lower().startswith(verb) for verb in _ACTION_VERBS)
        and bool(re.search(r"\d", bullet))
        for bullet in bullet_candidates
    ]
    bullet_score = round(25 * sum(quality) / len(quality)) if quality else 0

    if norm:
        ratio = len(resume_text) / norm
        length_score = 15 if 0.5 <= ratio <= 1.8 else (8 if 0.3 <= ratio <= 2.5 else 3)
    else:
        length_score = 0
    has_contact = bool(resume.get("email") or resume.get("phone"))
    contact_score = 10 if has_contact else 0
    voice_text = resume_to_text(
        {
            key: value
            for key, value in resume.items()
            if key not in {"name", "email", "phone", "location", "links"}
        }
    )
    no_first_person = not _FIRST_PERSON.search(voice_text)
    pronoun_score = 10 if no_first_person else 0
    dates = [int(year) for year in _DATE_PATTERN.findall(resume_text)]
    consistent_dates = (
        len(dates) < 2
        or dates == sorted(dates)
        or dates == sorted(dates, reverse=True)
    )
    date_score = 10 if consistent_dates else 0

    rules = [
        {"rule": "section_completeness", "score": section_score, "max_score": 30,
         "feedback": f"{completed} of {len(sections)} recommended sections are complete."},
        {"rule": "bullet_quality", "score": bullet_score, "max_score": 25,
         "feedback": "Use clear action verbs and add measurable results when factual."},
        {"rule": "resume_length", "score": length_score, "max_score": 15,
         "feedback": "Resume length is compared with the predicted role category."},
        {"rule": "contact_information", "score": contact_score, "max_score": 10,
         "feedback": "Include a reachable email address or phone number." if not has_contact else "Contact information is present."},
        {"rule": "first_person_pronouns", "score": pronoun_score, "max_score": 10,
         "feedback": "Use concise resume phrasing without first-person pronouns." if not no_first_person else "No first-person pronouns found."},
        {"rule": "date_consistency", "score": date_score, "max_score": 10,
         "feedback": "Check that date ranges are consistently ordered." if not consistent_dates else "No inconsistent date order was detected."},
    ]
    return {
        "score": sum(rule["score"] for rule in rules),
        "category": category,
        "rules": rules,
    }
