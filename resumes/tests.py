from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import SimpleTestCase, override_settings
from django.urls import Resolver404, resolve
from django.utils import timezone
import json
from datetime import timedelta
from io import BytesIO
from docx import Document
from pypdf import PdfReader
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .exports import TEMPLATE_COLORS
from .models import Resume


class CanonicalResumeRouteTests(SimpleTestCase):
    def test_removed_duplicate_resume_routes_are_unresolvable(self):
        for path in (
            "/resume/create/",
            "/resume/1/",
            "/resume/detect-type/",
            "/api/resume/create/",
            "/api/resume/1/",
            "/api/resumes/1/parse_resume/",
        ):
            with self.subTest(path=path):
                with self.assertRaises(Resolver404):
                    resolve(path)

    def test_detect_type_uses_the_canonical_api_route(self):
        match = resolve("/api/resume/detect-type/")

        self.assertEqual(match.url_name, "resume-detect-type")


class ResumeOwnershipTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="resume-owner", password="test-pass-123")
        self.other_user = User.objects.create_user(
            username="resume-other", password="test-pass-456"
        )
        self.owned_resume = Resume.objects.create(
            user=self.owner,
            name="Owner",
            email="owner@example.com",
        )
        self.other_resume = Resume.objects.create(
            user=self.other_user,
            name="Other",
            email="other@example.com",
        )

    def test_resume_list_requires_authentication(self):
        response = self.client.get("/api/resumes/")

        self.assertEqual(response.status_code, 401)

    def test_resume_list_only_returns_the_signed_in_users_resumes(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get("/api/resumes/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [self.owned_resume.pk])

    def test_resume_detail_does_not_expose_another_users_resume(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get(f"/api/resumes/{self.other_resume.pk}/")

        self.assertEqual(response.status_code, 404)

    def test_resume_creation_assigns_the_signed_in_user(self):
        self.client.force_authenticate(self.other_user)

        response = self.client.post(
            "/api/resumes/",
            {"name": "New", "email": "new@example.com", "user": self.owner.pk},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Resume.objects.get(pk=response.data["id"]).user_id,
            self.other_user.pk,
        )

    def test_current_user_requires_authentication(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 401)

    def test_current_user_returns_authenticated_user_details(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user_id"], self.owner.pk)
        self.assertEqual(response.data["username"], self.owner.username)
        self.assertEqual(response.data["email"], self.owner.email)
        self.assertFalse(response.data["is_staff"])

    def test_pdf_export_returns_a_pdf_for_the_signed_in_users_resume(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get(f"/api/resumes/{self.owned_resume.pk}/export_pdf/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue(b"".join(response.streaming_content).startswith(b"%PDF-"))

    def test_pdf_export_includes_preview_content_and_selected_accent(self):
        self.client.force_authenticate(self.owner)
        self.owned_resume.summary = "A dependable analyst."
        self.owned_resume.job_title_target = "Finance"
        self.owned_resume.save()

        response = self.client.get(
            f"/api/resumes/{self.owned_resume.pk}/export_pdf/?accent_color=%232F5D8A"
        )

        pdf = b"".join(response.streaming_content)
        pages = PdfReader(BytesIO(pdf)).pages
        text = "\n".join(page.extract_text() or "" for page in pages)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(pages), 1)
        self.assertIn("Owner", text)
        self.assertIn("Finance", text)
        self.assertIn("CAREER OBJECTIVE", text)
        self.assertIn("A dependable analyst.", text)

    def test_docx_export_returns_a_docx_for_the_signed_in_users_resume(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get(f"/api/resumes/{self.owned_resume.pk}/export_docx/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response["Content-Type"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
        self.assertTrue(b"".join(response.streaming_content).startswith(b"PK"))

    def test_docx_export_includes_preview_content_and_selected_accent(self):
        self.client.force_authenticate(self.owner)
        self.owned_resume.template = "template20"
        self.owned_resume.summary = "A dependable analyst."
        self.owned_resume.job_title_target = "Finance"
        self.owned_resume.save()

        response = self.client.get(
            f"/api/resumes/{self.owned_resume.pk}/export_docx/?accent_color=%232F5D8A"
        )

        document = Document(BytesIO(b"".join(response.streaming_content)))
        text = "\n".join(paragraph.text for paragraph in document.paragraphs)
        text += "\n" + "\n".join(
            paragraph.text
            for table in document.tables
            for row in table.rows
            for cell in row.cells
            for paragraph in cell.paragraphs
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Owner", text)
        self.assertIn("Finance", text)
        self.assertIn("CAREER OBJECTIVE", text)
        self.assertIn("A dependable analyst.", text)
        self.assertEqual(len(document.tables), 2)
        self.assertNotIn("owner@example.com", "\n".join(
            paragraph.text for paragraph in document.tables[1].cell(0, 0).paragraphs
        ))
        self.assertEqual(document.tables[1].cell(0, 0).paragraphs[0].text, "Owner")
        self.assertIn("owner@example.com", "\n".join(
            paragraph.text for paragraph in document.tables[1].cell(0, 1).paragraphs
        ))

    def test_docx_sidebar_and_split_layouts_keep_main_column_wider(self):
        self.client.force_authenticate(self.owner)
        for template in ("template7", "template11"):
            resume = Resume.objects.create(
                user=self.owner,
                name="Template Test",
                email="t@example.com",
                template=template,
                summary="Dependable analyst.",
            )
            with self.subTest(template=template):
                response = self.client.get(f"/api/resumes/{resume.pk}/export_docx/")
                document = Document(BytesIO(b"".join(response.streaming_content)))
                widths = [column.width for column in document.tables[0].columns]

                self.assertEqual(response.status_code, 200)
                self.assertGreater(widths[0], widths[1])

    def test_json_export_excludes_the_user_relation(self):
        self.client.force_authenticate(self.owner)

        response = self.client.get(f"/api/resumes/{self.owned_resume.pk}/export_json/")

        self.assertEqual(response.status_code, 200)
        exported = json.loads(b"".join(response.streaming_content))
        self.assertEqual(exported["id"], self.owned_resume.pk)
        self.assertNotIn("user", exported)

    def test_txt_export_returns_resume_content_as_utf8_plain_text(self):
        self.client.force_authenticate(self.owner)
        self.owned_resume.summary = "A dependable analyst."
        self.owned_resume.job_title_target = "Finance"
        self.owned_resume.save()

        response = self.client.get(f"/api/resumes/{self.owned_resume.pk}/export_txt/")

        content = b"".join(response.streaming_content)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response["Content-Type"].startswith("text/plain"))
        self.assertIn(b"Owner", content)
        self.assertIn(b"owner@example.com", content)
        self.assertIn(b"Finance", content)
        self.assertIn(b"CAREER OBJECTIVE", content)
        self.assertIn(b"A dependable analyst.", content)


class ResumeTemplateTests(APITestCase):
    TEMPLATE_IDS = [f"template{number}" for number in range(1, 21)]

    def setUp(self):
        self.user = User.objects.create_user(username="template-user", password="test-pass-123")
        self.client.force_authenticate(self.user)

    def test_model_offers_exactly_twenty_templates(self):
        choices = [value for value, _label in Resume.TEMPLATE_CHOICES]

        self.assertEqual(choices, self.TEMPLATE_IDS)

    def test_every_template_has_an_export_accent_colour(self):
        self.assertEqual(sorted(TEMPLATE_COLORS), sorted(self.TEMPLATE_IDS))

    def test_all_twenty_templates_can_be_saved(self):
        for template in self.TEMPLATE_IDS:
            with self.subTest(template=template):
                response = self.client.post(
                    "/api/resumes/",
                    {"name": "Template Test", "email": "t@example.com", "template": template},
                    format="json",
                )

                self.assertEqual(response.status_code, 201)
                self.assertEqual(response.data["template"], template)

    def test_unknown_template_is_rejected(self):
        response = self.client.post(
            "/api/resumes/",
            {"name": "Template Test", "email": "t@example.com", "template": "template21"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_pdf_and_docx_exports_work_for_every_template(self):
        for template in self.TEMPLATE_IDS:
            resume = Resume.objects.create(
                user=self.user,
                name="Template Test",
                email="t@example.com",
                template=template,
                summary="Dependable analyst.",
            )
            for export in ("export_pdf", "export_docx"):
                with self.subTest(template=template, export=export):
                    response = self.client.get(f"/api/resumes/{resume.pk}/{export}/")

                    self.assertEqual(response.status_code, 200)
                    if export == "export_pdf":
                        pdf = b"".join(response.streaming_content)
                        self.assertEqual(len(PdfReader(BytesIO(pdf)).pages), 1)


class AuthenticationSecurityTests(APITestCase):
    def setUp(self):
        cache.clear()

    def test_login_is_rate_limited(self):
        with override_settings(
            REST_FRAMEWORK={
                "DEFAULT_AUTHENTICATION_CLASSES": [
                    "backend.authentication.ExpiringTokenAuthentication"
                ],
                "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
                "DEFAULT_THROTTLE_RATES": {"auth_login": "10/hour"},
            }
        ):
            responses = [
                self.client.post(
                    "/api/auth/login/",
                    {"username": "missing-user", "password": "wrong"},
                    format="json",
                )
                for _ in range(11)
            ]

        self.assertEqual(responses[-1].status_code, 429)

    def test_signup_rejects_weak_password_and_invalid_email(self):
        weak_password = self.client.post(
            "/api/auth/signup/",
            {"username": "new-user", "email": "new@example.com", "password": "weak"},
            format="json",
        )
        invalid_email = self.client.post(
            "/api/auth/signup/",
            {
                "username": "new-user",
                "email": "not-an-email",
                "password": "Strong-Password-928!",
            },
            format="json",
        )

        self.assertEqual(weak_password.status_code, 400)
        self.assertEqual(invalid_email.status_code, 400)

    def test_signup_rejects_case_insensitive_duplicate_email(self):
        User.objects.create_user(
            username="existing-user",
            email="person@example.com",
            password="P@ssword-2231",
        )

        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": "new-user",
                "email": "PERSON@EXAMPLE.COM",
                "password": "Strong-Password-928!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_signup_trims_username_and_normalizes_email(self):
        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": " new-user ",
                "email": " New.User@Example.COM ",
                "password": "Strong-Password-928!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(pk=response.data["user_id"])
        self.assertEqual(user.username, "new-user")
        self.assertEqual(user.email, "new.user@example.com")

    def test_login_issues_new_token_after_password_change(self):
        user = User.objects.create_user(username="account-user", password="Initial-Password-123!")
        old_token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {old_token.key}")

        response = self.client.put(
            "/api/auth/account/",
            {"password": "Different-Password-928!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data["token"], old_token.key)
        self.assertFalse(Token.objects.filter(key=old_token.key).exists())
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {old_token.key}")
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_logout_invalidates_token(self):
        user = User.objects.create_user(username="logout-user", password="P@ssword-2231")
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post("/api/auth/logout/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Token.objects.filter(pk=token.pk).exists())
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_expired_token_is_rejected_and_deleted(self):
        user = User.objects.create_user(username="expired-user", password="P@ssword-2231")
        token = Token.objects.create(user=user)
        Token.objects.filter(pk=token.pk).update(created=timezone.now() - timedelta(days=15))
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 401)
        self.assertFalse(Token.objects.filter(pk=token.pk).exists())

    def test_deleting_user_deletes_resumes(self):
        user = User.objects.create_user(username="delete-user", password="P@ssword-2231")
        resume = Resume.objects.create(user=user, name="Private", email="private@example.com")

        user.delete()

        self.assertFalse(Resume.objects.filter(pk=resume.pk).exists())


class DetectResumeTypeInputTests(APITestCase):
    def test_invalid_detect_type_payloads_return_400(self):
        for payload in (
            {"highest_education": []},
            {"highest_education": {"degree": "BSc"}},
            {"years_of_experience": "3"},
            {"years_of_experience": 81},
            {"years_of_experience": -1},
        ):
            with self.subTest(payload=payload):
                response = self.client.post(
                    "/api/resume/detect-type/",
                    payload,
                    format="json",
                )
                self.assertEqual(response.status_code, 400)

    def test_detect_type_accepts_valid_payload_without_authentication(self):
        response = self.client.post(
            "/api/resume/detect-type/",
            {"highest_education": "Bachelor's degree", "years_of_experience": 0},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
