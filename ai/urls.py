from django.urls import path

from .views import (
    ATSScoreView,
    CoverLetterExportView,
    CoverLetterView,
    GrammarCheckView,
    ImproveBulletsView,
    InterviewQuestionsView,
    JobRoleMatchView,
    LinkedInHeadlineView,
    ModelInfoView,
    ModelStatusView,
    ParseResumeView,
    ResumeStrengthView,
    SkillsSuggestView,
    SummaryView,
    TailorToJobView,
)


urlpatterns = [
    path("parse-resume/", ParseResumeView.as_view(), name="ai-parse-resume"),
    path("summary/", SummaryView.as_view(), name="ai-summary"),
    path("improve-bullets/", ImproveBulletsView.as_view(), name="ai-improve-bullets"),
    path("ats-score/", ATSScoreView.as_view(), name="ai-ats-score"),
    path("job-role-match/", JobRoleMatchView.as_view(), name="ai-job-role-match"),
    path("resume-strength/", ResumeStrengthView.as_view(), name="ai-resume-strength"),
    path("tailor-to-job/", TailorToJobView.as_view(), name="ai-tailor-to-job"),
    path("cover-letter/", CoverLetterView.as_view(), name="ai-cover-letter"),
    path(
        "cover-letter/export/<str:extension>/",
        CoverLetterExportView.as_view(),
        name="ai-cover-letter-export",
    ),
    path("skills-suggest/", SkillsSuggestView.as_view(), name="ai-skills-suggest"),
    path("grammar-check/", GrammarCheckView.as_view(), name="ai-grammar-check"),
    path("interview-questions/", InterviewQuestionsView.as_view(), name="ai-interview-questions"),
    path("linkedin-headline/", LinkedInHeadlineView.as_view(), name="ai-linkedin-headline"),
    path("model-info/", ModelInfoView.as_view(), name="ai-model-info"),
    path("model-status/", ModelStatusView.as_view(), name="ai-model-status"),
]
