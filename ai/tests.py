from unittest.mock import patch
from io import BytesIO

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.cache import cache
from rest_framework.test import APITestCase
from docx import Document
from docx.oxml.ns import qn

from resumes.models import Resume


class AIEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ai-user", password="safe-test-password")
        self.client.force_authenticate(self.user)
        self.resume_data = {
            "name": "Sample Candidate",
            "email": "sample@example.com",
            "summary": "A verified candidate summary.",
            "skills": "Python, analysis",
            "education": "Bachelor's degree",
            "experience": "Built documented internal tools.",
        }

    @patch("ai.views.generate_json")
    def test_parse_resume_validates_and_returns_structured_data(self, mock_generate):
        mock_generate.return_value = {"name": "Candidate", "email": "person@example.com"}

        response = self.client.post(
            "/api/ai/parse-resume/",
            {"text": "Candidate, person@example.com, Python"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Candidate")

    @patch("ai.views.generate_json")
    def test_parse_resume_normalizes_years_of_experience_safely(self, mock_generate):
        mock_generate.return_value = {
            "name": "Candidate",
            "years_of_experience": "5 years",
        }

        response = self.client.post(
            "/api/ai/parse-resume/",
            {"text": "Candidate has five years of experience."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["years_of_experience"], 5)

    @patch("ai.views.generate_json")
    def test_parse_resume_omits_unparseable_years_without_failing(self, mock_generate):
        mock_generate.return_value = {"years_of_experience": "several years"}

        response = self.client.post(
            "/api/ai/parse-resume/",
            {"text": "Candidate has several years of experience."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("years_of_experience", response.data)

    @patch("ai.views.generate_json")
    def test_parse_resume_discards_bad_fields_and_normalizes_string_lists(self, mock_generate):
        mock_generate.return_value = {
            "email": "N/A",
            "phone": "123456789012345678901",
            "skills": ["Python", "SQL"],
            "summary": ["Experienced", "analyst"],
            "links": ["not", "an", "object"],
        }

        response = self.client.post(
            "/api/ai/parse-resume/",
            {"text": "Candidate resume"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("email", response.data)
        self.assertNotIn("phone", response.data)
        self.assertNotIn("links", response.data)
        self.assertEqual(response.data["skills"], "Python SQL")
        self.assertEqual(response.data["summary"], "Experienced analyst")

    @patch("ai.views.generate_json")
    def test_summary_returns_three_variants(self, mock_generate):
        mock_generate.return_value = {"variants": ["one", "two", "three"]}

        response = self.client.post(
            "/api/ai/summary/",
            {"resume": self.resume_data, "user_type": "professional"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["variants"]), 3)

    @patch("ai.views.generate_json")
    def test_improve_bullets_returns_before_and_after(self, mock_generate):
        mock_generate.return_value = {
            "suggestions": [
                {"before": "Built tools", "after": "Built tools to support [add %] users."}
            ]
        }

        response = self.client.post(
            "/api/ai/improve-bullets/",
            {"bullets": ["Built tools"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["suggestions"][0]["before"], "Built tools")

    @patch("ai.views.generate_json")
    def test_improve_section_uses_a_schema_matching_every_input_line(self, mock_generate):
        mock_generate.return_value = {
            "suggestions": [
                {"before": "BSc in Computing", "after": "Bachelor of Science in Computing"},
                {"before": "2022-2026", "after": "2022-2026"},
            ]
        }

        response = self.client.post(
            "/api/ai/improve-bullets/",
            {
                "section": "education",
                "bullets": ["BSc in Computing", "2022-2026"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["suggestions"]), 2)
        prompt = mock_generate.call_args.args[0]
        schema = mock_generate.call_args.kwargs["response_schema"]
        self.assertIn("Education section", prompt)
        self.assertEqual(schema["properties"]["suggestions"]["minItems"], 2)
        self.assertEqual(schema["properties"]["suggestions"]["maxItems"], 2)

    @patch("ai.views.generate_json")
    def test_improve_section_retries_an_invalid_local_model_response(self, mock_generate):
        mock_generate.side_effect = [
            {"bullets": ["BSc in Computing"]},
            {
                "suggestions": [
                    {"before": "BSc in Computing", "after": "Bachelor of Science in Computing"}
                ]
            },
        ]

        response = self.client.post(
            "/api/ai/improve-bullets/",
            {"section": "education", "bullets": ["BSc in Computing"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_generate.call_count, 2)

    @patch("ai.views.generate_json")
    def test_improve_bullets_prompt_separates_optional_role_guidance(self, mock_generate):
        mock_generate.return_value = {
            "suggestions": [{"before": "Built tools", "after": "Developed tools"}]
        }

        response = self.client.post(
            "/api/ai/improve-bullets/",
            {
                "section": "experience",
                "bullets": ["Built tools"],
                "target_role": "Data analyst",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        prompt = mock_generate.call_args.args[0]
        self.assertIn(
            "Improve each line from the Work Experience section for clarity and professional presentation.",
            prompt,
        )
        self.assertIn(
            "Use 'Data analyst' only to guide emphasis; never add skills or experience.",
            prompt,
        )

    @patch("ai.views.generate_json")
    def test_llm_output_validation_retries_even_without_a_response_schema(self, mock_generate):
        mock_generate.side_effect = [
            {"summary": "wrong output shape"},
            {"variants": ["one", "two", "three"]},
        ]

        response = self.client.post(
            "/api/ai/summary/",
            {"resume": self.resume_data, "user_type": "professional"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_generate.call_count, 2)
        self.assertIn(
            "previous response failed schema validation",
            mock_generate.call_args_list[1].args[0],
        )

    @patch("ai.ml.predict.ats_analysis")
    def test_ats_score_returns_validated_non_llm_report(self, mock_analysis):
        mock_analysis.return_value = {
            "overall_score": 72,
            "keyword_match_percent": 60,
            "matched_keywords": ["python"],
            "missing_keywords": ["planning"],
            "section_completeness": {"skills": True},
            "formatting_warnings": [],
        }

        response = self.client.post(
            "/api/ai/ats-score/",
            {"resume": self.resume_data, "job_description": "Python planning role"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["overall_score"], 72)

    @patch("ai.views.generate_json")
    def test_tailoring_saves_a_new_version(self, mock_generate):
        resume = Resume.objects.create(
            user=self.user,
            name="Sample Candidate",
            email="sample@example.com",
            summary="Original summary",
        )
        mock_generate.return_value = {
            "tailored_summary": "Tailored, verified summary.",
            "emphasized_bullets": ["Built documented internal tools."],
            "emphasized_skills": ["Python"],
        }

        response = self.client.post(
            "/api/ai/tailor-to-job/",
            {"resume_id": resume.pk, "job_description": "Python tools role"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["resume"]["parent"], resume.pk)
        resume.refresh_from_db()
        self.assertEqual(resume.summary, "Original summary")

    @patch("ai.views.generate_json")
    def test_cover_letter_returns_editable_text(self, mock_generate):
        mock_generate.return_value = {"cover_letter": "Dear hiring team,\n\nI am interested."}

        response = self.client.post(
            "/api/ai/cover-letter/",
            {"resume": self.resume_data, "job_description": "Analyst role"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("Dear hiring team", response.data["cover_letter"])

    @patch("ai.views.render_cover_letter", return_value=BytesIO(b"document"))
    def test_cover_letter_export_uses_a_sanitized_filename(self, mock_render):
        response = self.client.post(
            "/api/ai/cover-letter/export/docx/",
            {"name": "தமிழ்", "content": "Dear hiring team.", "format": "docx"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("resume_Cover_Letter.docx", response["Content-Disposition"])
        mock_render.assert_called_once_with("தமிழ்", "Dear hiring team.", "docx")

    def test_cover_letter_pdf_rejects_non_latin_text_with_print_guidance(self):
        response = self.client.post(
            "/api/ai/cover-letter/export/pdf/",
            {"name": "தமிழ்", "content": "Dear தமிழ்", "format": "pdf"},
            format="json",
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("Use the Download PDF button", response.data["error"])

    def test_cover_letter_docx_configures_unicode_font_fallbacks(self):
        response = self.client.post(
            "/api/ai/cover-letter/export/docx/",
            {"name": "தமிழ்", "content": "Dear தமிழ்", "format": "docx"},
            format="json",
        )

        document = Document(BytesIO(b"".join(response.streaming_content)))
        run = document.paragraphs[0].runs[0]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(run.font.name, "Georgia")
        self.assertEqual(run._element.rPr.rFonts.get(qn("w:eastAsia")), "Georgia")
        self.assertEqual(run._element.rPr.rFonts.get(qn("w:cs")), "Georgia")

    @patch.dict(
        "rest_framework.throttling.ScopedRateThrottle.THROTTLE_RATES",
        {"ai_llm": "20/hour", "ai_local": "25/hour"},
    )
    def test_local_llm_and_export_endpoints_use_independent_throttling(self):
        cache.clear()
        self.addCleanup(cache.clear)
        report = {
            "overall_score": 72,
            "keyword_match_percent": 60,
            "matched_keywords": ["python"],
            "missing_keywords": ["planning"],
            "section_completeness": {"skills": True},
            "formatting_warnings": [],
        }
        with (
            patch("ai.ml.predict.ats_analysis", return_value=report),
            patch(
                "ai.views.generate_json",
                return_value={"variants": ["one", "two", "three"]},
            ),
            patch(
                "ai.views.render_cover_letter",
                side_effect=lambda *args: BytesIO(b"document"),
            ),
        ):
            for _ in range(25):
                local_response = self.client.post(
                    "/api/ai/ats-score/",
                    {
                        "resume": self.resume_data,
                        "job_description": "Python planning role",
                    },
                    format="json",
                )
                self.assertEqual(local_response.status_code, 200)
            self.assertEqual(
                self.client.post(
                    "/api/ai/ats-score/",
                    {
                        "resume": self.resume_data,
                        "job_description": "Python planning role",
                    },
                    format="json",
                ).status_code,
                429,
            )

            for _ in range(20):
                llm_response = self.client.post(
                    "/api/ai/summary/",
                    {"resume": self.resume_data, "user_type": "professional"},
                    format="json",
                )
                self.assertEqual(llm_response.status_code, 200)
            self.assertEqual(
                self.client.post(
                    "/api/ai/summary/",
                    {"resume": self.resume_data, "user_type": "professional"},
                    format="json",
                ).status_code,
                429,
            )

            for _ in range(30):
                export_response = self.client.post(
                    "/api/ai/cover-letter/export/docx/",
                    {"name": "Candidate", "content": "Letter", "format": "docx"},
                    format="json",
                )
                self.assertEqual(export_response.status_code, 200)

    @patch("ai.ml.predict.category_skills")
    @patch("ai.views.generate_json")
    def test_skills_falls_back_to_mocked_llm_without_dataset(self, mock_generate, mock_skills):
        from ai.ml.predict import ModelUnavailableError

        mock_skills.side_effect = ModelUnavailableError("No confident category match.")
        mock_generate.return_value = {"skills": ["Python"], "source": "ai"}

        response = self.client.post(
            "/api/ai/skills-suggest/",
            {"target_role": "Data analyst"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["source"], "ai")

    @patch("ai.views.generate_json")
    def test_grammar_check_returns_typed_issues(self, mock_generate):
        mock_generate.return_value = {
            "issues": [
                {
                    "category": "grammar",
                    "before": "I manages projects.",
                    "suggestion": "Managed projects.",
                    "explanation": "Use consistent tense.",
                }
            ]
        }

        response = self.client.post(
            "/api/ai/grammar-check/",
            {"resume": self.resume_data},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["issues"][0]["category"], "grammar")

    @patch("ai.views.generate_json")
    def test_interview_questions_returns_eight_questions(self, mock_generate):
        mock_generate.return_value = {
            "questions": [
                {"question": f"Question {index}", "answer_hint": "Use verified experience."}
                for index in range(8)
            ]
        }

        response = self.client.post(
            "/api/ai/interview-questions/",
            {"resume": self.resume_data, "target_role": "Analyst"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["questions"]), 8)

    @patch("ai.views.generate_json")
    def test_linkedin_headline_returns_headline_and_about(self, mock_generate):
        mock_generate.return_value = {"headline": "Analyst | Python", "about": "Verified summary."}

        response = self.client.post(
            "/api/ai/linkedin-headline/",
            {"resume": self.resume_data},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["headline"], "Analyst | Python")

    @patch("ai.ml.predict.job_role_matches")
    def test_job_role_match_returns_model_suggestions(self, mock_match):
        mock_match.return_value = {
            "suggestions": [{"category": "INFORMATION-TECHNOLOGY", "confidence": 0.8}],
            "note": "General dataset-based suggestions.",
        }

        response = self.client.post(
            "/api/ai/job-role-match/",
            {"resume": self.resume_data, "user_type": "professional"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["suggestions"][0]["category"], "INFORMATION-TECHNOLOGY")

    @patch("ai.ml.predict.resume_strength")
    def test_resume_strength_returns_per_rule_feedback(self, mock_strength):
        mock_strength.return_value = {"score": 70, "category": "TECH", "rules": []}

        response = self.client.post(
            "/api/ai/resume-strength/",
            {"resume": self.resume_data},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 70)

    @patch("ai.views.generate_json")
    def test_unconfigured_ai_returns_a_clean_service_error(self, mock_generate):
        from ai.services.llm import AIConfigurationError

        mock_generate.side_effect = AIConfigurationError("Set the LLM settings.")

        response = self.client.post(
            "/api/ai/summary/",
            {"resume": self.resume_data, "user_type": "college"},
            format="json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["error"], "AI not configured")

    def test_ai_endpoint_requires_authentication(self):
        self.client.force_authenticate(None)

        response = self.client.post("/api/ai/summary/", {}, format="json")

        self.assertEqual(response.status_code, 401)

    @patch("ai.views.generate_json")
    def test_parse_resume_accepts_a_docx_upload(self, mock_generate):
        document = Document()
        document.add_paragraph("Candidate resume: Python engineer.")
        file_buffer = BytesIO()
        document.save(file_buffer)
        mock_generate.return_value = {"name": "Candidate"}

        response = self.client.post(
            "/api/ai/parse-resume/",
            {
                "file": SimpleUploadedFile(
                    "resume.docx",
                    file_buffer.getvalue(),
                    content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Candidate")


class ModelInfoTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="staff",
            password="safe-test-password",
            is_staff=True,
        )

    @patch("ai.ml.predict.load_model_info")
    def test_model_info_is_limited_to_staff(self, mock_info):
        mock_info.return_value = {"trained_at": "2026-01-01", "labels": ["TEACHER"]}
        self.client.force_authenticate(self.staff)

        response = self.client.get("/api/ai/model-info/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["labels"], ["TEACHER"])

    @patch("ai.ml.predict.load_model_info")
    def test_model_info_returns_a_clear_missing_model_response(self, mock_info):
        from ai.ml.predict import ModelUnavailableError

        mock_info.side_effect = ModelUnavailableError("Model metrics are unavailable.")
        self.client.force_authenticate(self.staff)

        response = self.client.get("/api/ai/model-info/")

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.data["available"])

    @patch("ai.ml.predict.load_model_info")
    def test_model_status_returns_public_training_metrics_to_signed_in_users(self, mock_info):
        user = User.objects.create_user(username="candidate")
        mock_info.return_value = {
            "trained_at": "2026-01-01",
            "labels": ["TEACHER", "ACCOUNTANT"],
            "selected_model": "LinearSVC",
            "dataset_rows_used": 100,
            "test_accuracy": 0.8,
            "test_macro_f1": 0.7,
            "classification_report": {"private": "details"},
        }
        self.client.force_authenticate(user)

        response = self.client.get("/api/ai/model-status/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["category_count"], 2)
        self.assertNotIn("classification_report", response.data)

    @patch("ai.ml.predict.load_model_info")
    def test_model_status_requires_authentication_and_reports_missing_model(self, mock_info):
        from ai.ml.predict import ModelUnavailableError

        mock_info.side_effect = ModelUnavailableError("Train the local model.")

        response = self.client.get("/api/ai/model-status/")

        self.assertEqual(response.status_code, 401)

        self.client.force_authenticate(User.objects.create_user(username="candidate"))
        response = self.client.get("/api/ai/model-status/")

        self.assertEqual(response.status_code, 503)
        self.assertFalse(response.data["available"])
