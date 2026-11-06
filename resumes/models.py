from django.conf import settings
from django.db import models

from .export_styles import TEMPLATE_CATALOG


class Resume(models.Model):
    USER_TYPE_CHOICES = [
        ("school", "School Student"),
        ("college", "College Student"),
        ("professional", "Working Professional"),
        ("career_changer", "Career Changer"),
        ("freelancer", "Freelancer / Consultant"),
        ("executive", "Senior Leader / Executive"),
    ]

    TEMPLATE_CHOICES = [(template["id"], template["name"]) for template in TEMPLATE_CATALOG]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default="")
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default="college")
    highest_education = models.CharField(max_length=100, blank=True, default="")
    is_studying = models.BooleanField(default=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    skills = models.TextField(blank=True, default="")
    experience = models.TextField(blank=True, default="")
    education = models.TextField(blank=True, default="")
    internships = models.TextField(blank=True, default="")
    achievements = models.TextField(blank=True, default="")
    projects = models.TextField(blank=True, default="")
    certifications = models.TextField(blank=True, default="")
    summary = models.TextField(blank=True, default="")
    template = models.CharField(max_length=10, choices=TEMPLATE_CHOICES, default="template1")
    title = models.CharField(max_length=150, blank=True, default="")
    headline = models.CharField(max_length=120, blank=True, default="")
    job_title_target = models.CharField(max_length=150, blank=True, default="")
    accent_color = models.CharField(max_length=7, blank=True, default="")
    links = models.JSONField(blank=True, default=dict)
    location = models.CharField(max_length=150, blank=True, default="")
    is_archived = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes",
        null=True,
        blank=True,
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        related_name="versions",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name}'s Resume"
