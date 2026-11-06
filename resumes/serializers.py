import re

from rest_framework import serializers

from .export_styles import ALLOWED_COLORS
from .models import Resume
from .utils import detect_user_type


ALLOWED_ACCENT_COLORS = {f"#{color}" for color in ALLOWED_COLORS}


class ResumeSerializer(serializers.ModelSerializer):
    detected_user_type = serializers.SerializerMethodField(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Resume.objects.none(),
        required=False,
        allow_null=True,
        error_messages={"does_not_exist": "Invalid parent resume."},
    )

    def get_detected_user_type(self, obj):
        return detect_user_type(obj.highest_education, obj.years_of_experience)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["parent"].queryset = Resume.objects.filter(user=request.user)

    def validate_accent_color(self, value):
        if value == "":
            return value
        normalized = value.upper()
        if not re.fullmatch(r"#[0-9A-F]{6}", normalized) or normalized not in ALLOWED_ACCENT_COLORS:
            raise serializers.ValidationError("Choose one of the supported resume accent colors.")
        return normalized

    def validate_links(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Links must be an object.")
        allowed_keys = {"linkedin", "github", "portfolio"}
        if any(key not in allowed_keys for key in value):
            raise serializers.ValidationError(
                "Links may only include linkedin, github, and portfolio."
            )
        normalized = {}
        for key, link in value.items():
            if not isinstance(link, str):
                raise serializers.ValidationError("Each link must be a string.")
            link = link.strip()
            if len(link) > 200:
                raise serializers.ValidationError("Each link must be at most 200 characters.")
            normalized[key] = link
        return normalized

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        highest_education = attrs.get(
            "highest_education", getattr(instance, "highest_education", "")
        )
        years_of_experience = attrs.get(
            "years_of_experience",
            getattr(instance, "years_of_experience", 0),
        )
        user_type = (
            attrs.get("user_type")
            or getattr(instance, "user_type", "")
            or detect_user_type(
                highest_education,
                years_of_experience,
            )
        )
        certifications = attrs.get("certifications", getattr(instance, "certifications", ""))
        projects = attrs.get("projects", getattr(instance, "projects", ""))
        internships = attrs.get("internships", getattr(instance, "internships", ""))

        if user_type == "school":
            attrs["experience"] = ""
            attrs["years_of_experience"] = 0

        if user_type in {"professional", "executive"} and int(years_of_experience or 0) <= 0:
            raise serializers.ValidationError(
                {"years_of_experience": "This resume type needs more than 0 years of experience."}
            )

        if user_type == "school":
            attrs["certifications"] = certifications

        if user_type == "college":
            attrs["projects"] = projects
            attrs["internships"] = internships

        attrs["user_type"] = user_type
        return attrs

    class Meta:
        model = Resume
        fields = "__all__"
        read_only_fields = ("user",)
