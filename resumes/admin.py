from django.contrib import admin
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "email",
        "user_type",
        "highest_education",
        "years_of_experience",
        "template",
        "created_at",
    )
    list_filter = ("user_type", "is_studying", "template", "created_at")
    search_fields = ("name", "email", "phone", "highest_education")
    readonly_fields = ("created_at",)

    fieldsets = (
        ("Personal Information", {"fields": ("name", "email", "phone")}),
        (
            "Type Detection",
            {"fields": ("user_type", "highest_education", "is_studying", "years_of_experience")},
        ),
        ("Professional Summary & Skills", {"fields": ("summary", "skills")}),
        ("Experience & Education", {"fields": ("experience", "education", "internships")}),
        ("Projects & Achievements", {"fields": ("projects", "achievements", "certifications")}),
        ("Settings", {"fields": ("template", "created_at")}),
    )
