from rest_framework import serializers
from .models import Resume
from .utils import detect_user_type

class ResumeSerializer(serializers.ModelSerializer):
    detected_user_type = serializers.SerializerMethodField(read_only=True)

    def get_detected_user_type(self, obj):
        return detect_user_type(obj.highest_education, obj.years_of_experience)

    def validate_parent(self, parent):
        request = self.context.get("request")
        if parent and request and parent.user_id != request.user.pk:
            raise serializers.ValidationError(
                "The selected parent resume is unavailable."
            )
        return parent

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        highest_education = attrs.get("highest_education", getattr(instance, "highest_education", ""))
        years_of_experience = attrs.get(
            "years_of_experience",
            getattr(instance, "years_of_experience", 0),
        )
        user_type = attrs.get("user_type") or getattr(instance, "user_type", "") or detect_user_type(
            highest_education,
            years_of_experience,
        )
        experience = attrs.get("experience", getattr(instance, "experience", ""))
        certifications = attrs.get("certifications", getattr(instance, "certifications", ""))
        projects = attrs.get("projects", getattr(instance, "projects", ""))
        internships = attrs.get("internships", getattr(instance, "internships", ""))

        if user_type == "school":
            attrs["experience"] = ""
            attrs["years_of_experience"] = 0

        if user_type == "professional" and int(years_of_experience or 0) <= 0:
            raise serializers.ValidationError(
                {"years_of_experience": "Working professionals must have more than 0 years of experience."}
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
        fields = '__all__'
        read_only_fields = ("user",)
