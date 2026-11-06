import os

from rest_framework import serializers

USER_TYPES = ("school", "college", "professional", "career_changer", "freelancer", "executive")


class ResumeTextInputSerializer(serializers.Serializer):
    text = serializers.CharField(required=False, allow_blank=True, max_length=50000)
    file = serializers.FileField(required=False, allow_empty_file=False)

    def validate_file(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Resume files must be 5 MB or smaller.")
        extension = os.path.splitext(value.name)[1].lower()
        if extension not in {".pdf", ".docx"}:
            raise serializers.ValidationError("Upload a PDF or DOCX file.")
        header = value.read(8)
        value.seek(0)
        if extension == ".pdf" and not header.startswith(b"%PDF-"):
            raise serializers.ValidationError("The uploaded file is not a valid PDF.")
        if extension == ".docx" and not header.startswith(b"PK"):
            raise serializers.ValidationError("The uploaded file is not a valid DOCX.")
        return value

    def validate(self, attrs):
        if not attrs.get("text", "").strip() and not attrs.get("file"):
            raise serializers.ValidationError(
                {"text": "Paste resume text or upload a PDF/DOCX file."}
            )
        return attrs


class ResumePayloadSerializer(serializers.Serializer):
    resume = serializers.DictField()

    def validate_resume(self, value):
        if len(str(value)) > 50000:
            raise serializers.ValidationError("Resume content must be under 50,000 characters.")
        return value


class UserTypeInputSerializer(ResumePayloadSerializer):
    user_type = serializers.ChoiceField(choices=USER_TYPES)
    tone = serializers.CharField(required=False, allow_blank=True, max_length=50)


class JobDescriptionInputSerializer(ResumePayloadSerializer):
    job_description = serializers.CharField(max_length=20000)


class ImproveBulletsInputSerializer(serializers.Serializer):
    bullets = serializers.ListField(
        child=serializers.CharField(max_length=2000),
        min_length=1,
        max_length=20,
    )
    target_role = serializers.CharField(required=False, allow_blank=True, max_length=150)
    section = serializers.ChoiceField(
        choices=(
            "experience",
            "education",
            "skills",
            "projects",
            "internships",
            "achievements",
            "certifications",
        ),
        required=False,
        default="experience",
    )


class TailorInputSerializer(serializers.Serializer):
    resume_id = serializers.IntegerField(min_value=1)
    job_description = serializers.CharField(max_length=20000)


class SkillsInputSerializer(serializers.Serializer):
    target_role = serializers.CharField(max_length=150)
    user_type = serializers.ChoiceField(
        choices=USER_TYPES,
        required=False,
        default="professional",
    )
    resume = serializers.DictField(required=False, default=dict)


class GrammarInputSerializer(ResumePayloadSerializer):
    pass


class InterviewInputSerializer(ResumePayloadSerializer):
    target_role = serializers.CharField(max_length=150)


class LinkedInInputSerializer(ResumePayloadSerializer):
    target_role = serializers.CharField(required=False, allow_blank=True, max_length=150)


class CoverLetterInputSerializer(JobDescriptionInputSerializer):
    pass


class ResumeParseOutputSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    user_type = serializers.ChoiceField(
        choices=USER_TYPES,
        required=False,
    )
    highest_education = serializers.CharField(required=False, allow_blank=True, max_length=100)
    is_studying = serializers.BooleanField(required=False)
    years_of_experience = serializers.IntegerField(required=False, min_value=0)
    skills = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    education = serializers.CharField(required=False, allow_blank=True)
    internships = serializers.CharField(required=False, allow_blank=True)
    achievements = serializers.CharField(required=False, allow_blank=True)
    projects = serializers.CharField(required=False, allow_blank=True)
    certifications = serializers.CharField(required=False, allow_blank=True)
    summary = serializers.CharField(required=False, allow_blank=True)
    title = serializers.CharField(required=False, allow_blank=True, max_length=150)
    headline = serializers.CharField(required=False, allow_blank=True, max_length=220)
    job_title_target = serializers.CharField(required=False, allow_blank=True, max_length=150)
    links = serializers.DictField(required=False)
    location = serializers.CharField(required=False, allow_blank=True, max_length=150)


class SummaryOutputSerializer(serializers.Serializer):
    variants = serializers.ListField(
        child=serializers.CharField(max_length=2000),
        min_length=3,
        max_length=3,
    )


class BulletSuggestionSerializer(serializers.Serializer):
    before = serializers.CharField(max_length=2000)
    after = serializers.CharField(max_length=2500)


class ImproveBulletsOutputSerializer(serializers.Serializer):
    suggestions = BulletSuggestionSerializer(many=True, min_length=1, max_length=20)


class ATSOutputSerializer(serializers.Serializer):
    overall_score = serializers.IntegerField(min_value=0, max_value=100)
    keyword_match_percent = serializers.IntegerField(min_value=0, max_value=100)
    matched_keywords = serializers.ListField(child=serializers.CharField())
    missing_keywords = serializers.ListField(child=serializers.CharField())
    section_completeness = serializers.DictField()
    formatting_warnings = serializers.ListField(child=serializers.CharField())


class TailorOutputSerializer(serializers.Serializer):
    tailored_summary = serializers.CharField(max_length=3000)
    emphasized_bullets = serializers.ListField(
        child=serializers.CharField(max_length=2000), max_length=20
    )
    emphasized_skills = serializers.ListField(
        child=serializers.CharField(max_length=100), max_length=40
    )


class CoverLetterOutputSerializer(serializers.Serializer):
    cover_letter = serializers.CharField(max_length=10000)


class SkillsOutputSerializer(serializers.Serializer):
    skills = serializers.ListField(child=serializers.CharField(max_length=100), max_length=40)
    source = serializers.ChoiceField(choices=("dataset", "ai"))


class GrammarIssueSerializer(serializers.Serializer):
    category = serializers.ChoiceField(
        choices=("spelling", "grammar", "tense", "weak-phrase", "repetition")
    )
    before = serializers.CharField(max_length=1000)
    suggestion = serializers.CharField(max_length=1000)
    explanation = serializers.CharField(max_length=500, required=False, allow_blank=True)


class GrammarOutputSerializer(serializers.Serializer):
    issues = GrammarIssueSerializer(many=True, max_length=100)


class InterviewQuestionSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=1000)
    answer_hint = serializers.CharField(max_length=1500)


class InterviewOutputSerializer(serializers.Serializer):
    questions = InterviewQuestionSerializer(many=True, min_length=8, max_length=8)


class LinkedInOutputSerializer(serializers.Serializer):
    headline = serializers.CharField(max_length=220)
    about = serializers.CharField(max_length=2600)


class CoverLetterExportInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    content = serializers.CharField(max_length=10000)
    format = serializers.ChoiceField(choices=("docx", "pdf"))
