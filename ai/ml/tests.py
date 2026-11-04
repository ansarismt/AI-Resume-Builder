import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from . import predict


def fixture_pipeline():
    texts = [
        "python software developer builds web applications and APIs",
        "software engineer writes python services and maintains databases",
        "teacher prepares lessons and supports classroom learning",
        "educator teaches students and plans academic instruction",
    ]
    labels = ["INFORMATION-TECHNOLOGY", "INFORMATION-TECHNOLOGY", "TEACHER", "TEACHER"]
    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            ("classifier", LogisticRegression(random_state=0)),
        ]
    )
    pipeline.fit(texts, labels)
    return pipeline


class PredictionTests(SimpleTestCase):
    def test_tiny_fixture_model_returns_ranked_categories(self):
        result = predict.predict_categories(
            "python software engineering APIs",
            pipeline=fixture_pipeline(),
        )

        self.assertEqual(result[0]["category"], "INFORMATION-TECHNOLOGY")
        self.assertGreaterEqual(result[0]["confidence"], result[1]["confidence"])

    def test_model_missing_has_a_clear_error(self):
        predict.load_pipeline.cache_clear()
        try:
            with tempfile.TemporaryDirectory() as directory:
                with patch.object(predict, "ARTIFACTS_DIR", Path(directory)):
                    with self.assertRaisesRegex(
                        predict.ModelUnavailableError,
                        "python manage.py train_model",
                    ):
                        predict.load_pipeline()
        finally:
            predict.load_pipeline.cache_clear()

    def test_ats_analysis_uses_keyword_match_and_completeness(self):
        report = predict.ats_analysis(
            {
                "user_type": "professional",
                "summary": "Python software developer",
                "experience": "Built software APIs",
                "skills": "Python",
                "education": "Computer science",
                "email": "candidate@example.com",
            },
            "Python software developer builds APIs",
            pipeline=fixture_pipeline(),
        )

        self.assertGreater(report["keyword_match_percent"], 0)
        self.assertTrue(report["section_completeness"]["experience"])
        self.assertGreaterEqual(report["overall_score"], 0)

    def test_ats_keyword_match_does_not_match_partial_words(self):
        vectorizer = TfidfVectorizer(vocabulary={"java": 0})
        vectorizer.fit(["java"])

        matched, missing, percent = predict._keyword_match(
            "Experienced JavaScript developer",
            "Java developer",
            vectorizer,
        )

        self.assertEqual(matched, [])
        self.assertEqual(missing, ["java"])
        self.assertEqual(percent, 0)

        matched, missing, percent = predict._keyword_match(
            "Experienced Java developer",
            "Java developer",
            vectorizer,
        )

        self.assertEqual(matched, ["java"])
        self.assertEqual(missing, [])
        self.assertEqual(percent, 100)

    def test_resume_strength_returns_feedback_for_each_rule(self):
        report = predict.resume_strength(
            {
                "user_type": "professional",
                "name": "Candidate",
                "email": "candidate@example.com",
                "summary": "Software engineer",
                "experience": "Built services serving 100 users.",
                "skills": "Python",
                "education": "Computer science",
            },
            pipeline=fixture_pipeline(),
            category_stats={"INFORMATION-TECHNOLOGY": {"typical_resume_length": 100}},
        )

        self.assertEqual(report["score"], sum(rule["score"] for rule in report["rules"]))
        self.assertEqual(len(report["rules"]), 6)
