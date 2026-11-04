import os
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import numpy as np
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
import httpx
from openai import APIStatusError, APITimeoutError, RateLimitError
from pypdf.errors import PyPdfError
from sklearn.feature_extraction.text import TfidfVectorizer

from ai.ml import predict, train
from ai.services.llm import AIConfigurationError, AIServiceError, generate_json
from ai.services.resume_import import extract_resume_text


class MLRegressionTests(SimpleTestCase):
    def test_binary_decision_scores_produce_two_probabilities(self):
        class BinaryClassifier:
            classes_ = np.array(["first", "second"])

            def decision_function(self, vector):
                return np.array([1.0])

        vectorizer = TfidfVectorizer().fit(["candidate resume"])
        pipeline = SimpleNamespace(
            named_steps={
                "classifier": BinaryClassifier(),
                "tfidf": vectorizer,
            }
        )

        results = predict._probabilities(pipeline, "candidate resume")

        self.assertEqual(len(results), 2)
        self.assertAlmostEqual(sum(item["confidence"] for item in results), 1.0)
        self.assertGreater(results[1]["confidence"], results[0]["confidence"])

    @patch(
        "ai.ml.predict.load_category_stats", return_value={"TECH": {"common_skills": ["Python"]}}
    )
    @patch(
        "ai.ml.predict.predict_categories", return_value=[{"category": "TECH", "confidence": 0.1}]
    )
    def test_category_skills_obey_the_confidence_threshold(self, mock_predict, mock_stats):
        with self.assertRaises(predict.ModelUnavailableError):
            predict.category_skills("uncertain role")
        mock_stats.assert_not_called()

    def test_skill_statistics_use_boundaries_support_and_preserve_counts(self):
        texts = [
            "python javascript digital",
            "python",
            "java",
            "java",
        ]
        labels = ["TECH", "TECH", "OTHER", "OTHER"]
        vectorizer = TfidfVectorizer().fit(texts)

        statistics = train._category_statistics(
            texts,
            labels,
            vectorizer,
            vectorizer.transform(texts),
        )

        self.assertIn("javascript", statistics["TECH"]["common_skills"])
        self.assertNotIn("java", statistics["TECH"]["common_skills"])
        self.assertNotIn("git", statistics["TECH"]["common_skills"])
        self.assertEqual(statistics["TECH"]["common_skill_counts"]["python"], 2)
        self.assertGreaterEqual(
            statistics["TECH"]["common_skill_lifts"]["python"],
            1.0,
        )

    def test_small_class_recall_uses_observed_category_names(self):
        report = {"NEW_CATEGORY": {"recall": 0.75}, "COMMON": {"recall": 0.9}}

        result = train._small_class_recall(
            ["NEW_CATEGORY"] + ["SMALL"] * 2 + ["COMMON"] * 97,
            report,
        )

        self.assertEqual(
            result,
            {"NEW_CATEGORY": 0.75, "SMALL": 0.0},
        )

    def test_ats_keywords_include_capitalized_terms_missing_from_training_vocabulary(self):
        vectorizer = TfidfVectorizer().fit(["team communication and planning"])

        matched, missing, percent = predict._keyword_match(
            "Experienced team member",
            "Kubernetes AWS Python .NET C++ role",
            vectorizer,
        )

        self.assertEqual(matched, [])
        self.assertEqual(set(missing), {"Kubernetes", "AWS", "Python", ".NET", "C++"})
        self.assertEqual(percent, 0)

    @patch(
        "ai.ml.predict.predict_categories", return_value=[{"category": "TECH", "confidence": 0.9}]
    )
    def test_strength_ignores_name_and_contact_fields_for_pronouns(self, mock_predict):
        resume = {
            "name": "Ivy Usher",
            "email": "i@example.com",
            "summary": "Worked with US teams on verified project outcomes.",
            "experience": "Built internal tools in 2020.",
            "education": "Bachelor degree",
            "skills": "Python",
        }

        result = predict.resume_strength(
            resume,
            pipeline=object(),
            category_stats={"TECH": {"typical_resume_length": 100}},
        )

        pronouns = next(rule for rule in result["rules"] if rule["rule"] == "first_person_pronouns")
        self.assertEqual(pronouns["score"], 10)

    @patch(
        "ai.ml.predict.predict_categories", return_value=[{"category": "TECH", "confidence": 0.9}]
    )
    def test_strength_flags_uppercase_first_person_i(self, mock_predict):
        resume = {
            "summary": "I developed documented tools.",
            "experience": "Delivered verified projects in 2020.",
            "education": "Bachelor degree",
            "skills": "Python",
        }

        result = predict.resume_strength(
            resume,
            pipeline=object(),
            category_stats={"TECH": {"typical_resume_length": 100}},
        )

        pronouns = next(rule for rule in result["rules"] if rule["rule"] == "first_person_pronouns")
        self.assertEqual(pronouns["score"], 0)

    @patch(
        "ai.ml.predict.predict_categories", return_value=[{"category": "TECH", "confidence": 0.9}]
    )
    def test_strength_accepts_mixed_date_formats_in_either_monotonic_direction(self, mock_predict):
        for date_text in (
            "Built tools 2019.\nDelivered projects 2022.",
            "Built tools Jan 2022.\nDelivered projects 2020.",
            "Built tools 2022.\nDelivered projects 2020.",
        ):
            with self.subTest(date_text=date_text):
                resume = {
                    "summary": "Career summary",
                    "experience": date_text,
                    "education": "Bachelor degree",
                    "skills": "Python",
                }

                result = predict.resume_strength(
                    resume,
                    pipeline=object(),
                    category_stats={"TECH": {"typical_resume_length": 100}},
                )

                dates = next(rule for rule in result["rules"] if rule["rule"] == "date_consistency")
                self.assertEqual(dates["score"], 10)

    def test_model_artifact_cache_uses_the_artifact_modification_time(self):
        with TemporaryDirectory() as directory:
            artifact_directory = Path(directory)
            model_path = artifact_directory / "resume_classifier.joblib"
            model_path.write_bytes(b"first")
            first_mtime = model_path.stat().st_mtime_ns
            predict._load_pipeline.cache_clear()
            with (
                patch.object(predict, "ARTIFACTS_DIR", artifact_directory),
                patch.object(
                    predict.joblib, "load", side_effect=["old-model", "new-model"]
                ) as load,
            ):
                self.assertEqual(predict.load_pipeline(), "old-model")
                os.utime(model_path, ns=(first_mtime + 1000000, first_mtime + 1000000))
                self.assertEqual(predict.load_pipeline(), "new-model")
                self.assertEqual(load.call_count, 2)
            predict._load_pipeline.cache_clear()

    def test_category_statistics_cache_uses_the_file_modification_time(self):
        with TemporaryDirectory() as directory:
            artifact_directory = Path(directory)
            stats_path = artifact_directory / "category_stats.json"
            stats_path.write_text(json.dumps({"first": {}}), encoding="utf-8")
            first_mtime = stats_path.stat().st_mtime_ns
            predict._load_category_stats.cache_clear()
            with patch.object(predict, "ARTIFACTS_DIR", artifact_directory):
                self.assertEqual(predict.load_category_stats(), {"first": {}})
                stats_path.write_text(json.dumps({"second": {}}), encoding="utf-8")
                os.utime(
                    stats_path,
                    ns=(first_mtime + 1000000, first_mtime + 1000000),
                )
                self.assertEqual(predict.load_category_stats(), {"second": {}})
            predict._load_category_stats.cache_clear()


class ResumeImportRegressionTests(SimpleTestCase):
    @patch("ai.services.resume_import.PdfReader")
    def test_pdf_import_uses_default_non_strict_parsing(self, mock_reader):
        mock_reader.return_value.pages = [SimpleNamespace(extract_text=lambda: "Candidate resume")]
        upload = SimpleUploadedFile("resume.pdf", b"pdf bytes")

        result = extract_resume_text(upload)

        self.assertEqual(result, "Candidate resume")
        mock_reader.assert_called_once()
        self.assertNotIn("strict", mock_reader.call_args.kwargs)

    @patch("ai.services.resume_import.PdfReader", side_effect=PyPdfError("invalid"))
    def test_pdf_import_translates_pypdf_errors(self, mock_reader):
        with self.assertRaisesRegex(ValueError, "could not be read"):
            extract_resume_text(SimpleUploadedFile("resume.pdf", b"bad pdf"))

    @patch("ai.services.resume_import.ZipFile")
    @patch("ai.services.resume_import.MAX_DOCX_EXPANDED_SIZE", 8)
    def test_docx_import_bounds_actual_expanded_stream_reads(self, mock_zip_file):
        entry = MagicMock()
        entry.is_dir.return_value = False
        archive = MagicMock()
        archive.__enter__.return_value = archive
        archive.infolist.return_value = [entry]
        stream = MagicMock()
        stream.__enter__.return_value = stream
        stream.read.return_value = b"123456789"
        archive.open.return_value = stream
        mock_zip_file.return_value = archive

        with self.assertRaisesRegex(ValueError, "too much expanded content"):
            extract_resume_text(SimpleUploadedFile("resume.docx", b"zip bytes"))

        stream.read.assert_called_once_with(9)


def _completion(content='{"ok": true}', finish_reason="stop"):
    return SimpleNamespace(
        choices=[
            SimpleNamespace(
                finish_reason=finish_reason,
                message=SimpleNamespace(content=content),
            )
        ]
    )


def _status_error(error_type, status_code, message):
    response = httpx.Response(
        status_code,
        request=httpx.Request("POST", "https://api.example.test/v1/chat/completions"),
    )
    return error_type(message, response=response, body=None)


class LLMServiceRegressionTests(SimpleTestCase):
    @override_settings(
        LLM_PROVIDER="openai",
        LLM_API_KEY="test-key",
        LLM_MODEL="test-model",
        LLM_TEMPERATURE="",
        LLM_MAX_TOKENS=512,
    )
    @patch("ai.services.llm.OpenAI")
    def test_schema_mode_applies_to_both_providers_and_omits_empty_temperature(
        self,
        mock_openai,
    ):
        client = MagicMock()
        client.chat.completions.create.return_value = _completion()
        mock_openai.return_value = client
        schema = {
            "type": "object",
            "properties": {"ok": {"type": "boolean"}},
            "required": ["ok"],
            "additionalProperties": False,
        }

        generate_json("Return JSON", {}, response_schema=schema)

        options = client.chat.completions.create.call_args.kwargs
        self.assertEqual(options["response_format"]["type"], "json_schema")
        self.assertTrue(options["response_format"]["json_schema"]["strict"])
        self.assertNotIn("temperature", options)

        with override_settings(LLM_PROVIDER="openai-compatible"):
            with patch.dict(os.environ, {"LLM_BASE_URL": "http://localhost:1234/v1"}):
                client.chat.completions.create.reset_mock()
                client.chat.completions.create.return_value = _completion()
                generate_json("Return JSON", {}, response_schema=schema)

        options = client.chat.completions.create.call_args.kwargs
        self.assertEqual(options["response_format"]["type"], "json_schema")
        self.assertTrue(options["response_format"]["json_schema"]["strict"])
        self.assertEqual(options["max_tokens"], 512)

    @override_settings(
        LLM_PROVIDER="openai-compatible",
        LLM_API_KEY="",
        LLM_MODEL="local-model",
        LLM_TEMPERATURE="",
        LLM_MAX_TOKENS=512,
    )
    @patch.dict(os.environ, {"LLM_BASE_URL": "http://localhost:1234/v1"})
    @patch("ai.services.llm.OpenAI")
    def test_local_compatible_endpoint_can_run_without_an_api_key(
        self,
        mock_openai,
    ):
        client = MagicMock()
        client.chat.completions.create.return_value = _completion()
        mock_openai.return_value = client

        generate_json("Return JSON", {})

        mock_openai.assert_called_once()
        self.assertEqual(mock_openai.call_args.kwargs["api_key"], "local")
        self.assertEqual(
            client.chat.completions.create.call_args.kwargs["max_tokens"],
            512,
        )

    @override_settings(
        LLM_PROVIDER="openai-compatible",
        LLM_API_KEY="",
        LLM_MODEL="remote-model",
    )
    @patch.dict(os.environ, {"LLM_BASE_URL": "https://api.example.test/v1"})
    @patch("ai.services.llm.OpenAI")
    def test_remote_compatible_endpoint_still_requires_an_api_key(
        self,
        mock_openai,
    ):
        with self.assertRaises(AIConfigurationError):
            generate_json("Return JSON", {})
        mock_openai.assert_not_called()

    @override_settings(
        LLM_PROVIDER="openai-compatible",
        LLM_API_KEY="test-key",
        LLM_MODEL="local-model",
        LLM_TEMPERATURE="0.4",
        LLM_MAX_TOKENS=512,
    )
    @patch.dict(os.environ, {"LLM_BASE_URL": "http://127.0.0.1:1234/v1"})
    @patch("ai.services.llm.OpenAI")
    def test_temperature_parameter_is_retried_without_temperature_on_400(
        self,
        mock_openai,
    ):
        error = _status_error(
            APIStatusError,
            400,
            "temperature is unsupported",
        )
        client = MagicMock()
        client.chat.completions.create.side_effect = [error, _completion()]
        mock_openai.return_value = client

        self.assertEqual(generate_json("Return JSON", {}), {"ok": True})

        self.assertEqual(client.chat.completions.create.call_count, 2)
        self.assertIn(
            "temperature",
            client.chat.completions.create.call_args_list[0].kwargs,
        )
        self.assertNotIn(
            "temperature",
            client.chat.completions.create.call_args_list[1].kwargs,
        )

    @override_settings(
        LLM_PROVIDER="openai",
        LLM_API_KEY="test-key",
        LLM_MODEL="test-model",
        LLM_TEMPERATURE="",
        LLM_MAX_TOKENS=512,
    )
    @patch("ai.services.llm.OpenAI")
    def test_token_truncation_returns_a_clear_service_error(self, mock_openai):
        client = MagicMock()
        client.chat.completions.create.return_value = _completion(
            content='{"ok":',
            finish_reason="length",
        )
        mock_openai.return_value = client

        with self.assertRaisesRegex(AIServiceError, "token limit"):
            generate_json("Return JSON", {})

    @override_settings(
        LLM_PROVIDER="openai",
        LLM_API_KEY="test-key",
        LLM_MODEL="test-model",
        LLM_TEMPERATURE="",
    )
    @patch("ai.services.llm.OpenAI")
    def test_unauthorized_errors_are_logged_without_prompt_or_resume_data(
        self,
        mock_openai,
    ):
        client = MagicMock()
        client.chat.completions.create.side_effect = _status_error(
            APIStatusError,
            401,
            "unauthorized",
        )
        mock_openai.return_value = client

        with self.assertLogs("ai.services.llm", level="WARNING") as captured:
            with self.assertRaisesRegex(AIServiceError, "credentials"):
                generate_json(
                    "PRIVATE PROMPT",
                    {"resume": "PRIVATE RESUME"},
                )

        self.assertIn(
            "provider=openai model=test-model status=401 error=APIStatusError",
            captured.output[0],
        )
        self.assertNotIn("PRIVATE", captured.output[0])

    @override_settings(
        LLM_PROVIDER="openai",
        LLM_API_KEY="test-key",
        LLM_MODEL="test-model",
        LLM_TEMPERATURE="",
    )
    @patch("ai.services.llm.OpenAI")
    def test_rate_limit_errors_have_a_distinct_message(self, mock_openai):
        client = MagicMock()
        client.chat.completions.create.side_effect = _status_error(
            RateLimitError,
            429,
            "rate limited",
        )
        mock_openai.return_value = client

        with self.assertRaisesRegex(AIServiceError, "rate limit"):
            generate_json("Return JSON", {})

    @override_settings(
        LLM_PROVIDER="openai",
        LLM_API_KEY="test-key",
        LLM_MODEL="test-model",
        LLM_TEMPERATURE="",
    )
    @patch("ai.services.llm.time.sleep")
    @patch("ai.services.llm.OpenAI")
    def test_timeout_and_server_errors_have_distinct_messages(
        self,
        mock_openai,
        mock_sleep,
    ):
        client = MagicMock()
        timeout = APITimeoutError(
            request=httpx.Request("POST", "https://api.example.test/v1/chat/completions")
        )
        client.chat.completions.create.side_effect = [timeout, timeout, timeout]
        mock_openai.return_value = client

        with self.assertRaisesRegex(AIServiceError, "timed out"):
            generate_json("Return JSON", {})

        client.chat.completions.create.side_effect = [
            _status_error(APIStatusError, 503, "unavailable"),
            _status_error(APIStatusError, 503, "unavailable"),
            _status_error(APIStatusError, 503, "unavailable"),
        ]
        with self.assertRaisesRegex(AIServiceError, "temporarily unavailable"):
            generate_json("Return JSON", {})
        self.assertEqual(mock_sleep.call_count, 4)
