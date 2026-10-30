from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet
from .views import AccountUpdateView, LoginView, SignupView, VerifyView
from .api_views import ResumeCreateView, ResumeDetailView, DetectResumeTypeView

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet)

urlpatterns = [
    path('resume/create/', ResumeCreateView.as_view(), name='resume-create'),
    path('resume/create', ResumeCreateView.as_view(), name='resume-create-no-slash'),
    path('resume/<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('resume/<int:pk>', ResumeDetailView.as_view(), name='resume-detail-no-slash'),
    path('resume/detect-type/', DetectResumeTypeView.as_view(), name='resume-detect-type'),
    path('resume/detect-type', DetectResumeTypeView.as_view(), name='resume-detect-type-no-slash'),
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/account/', AccountUpdateView.as_view(), name='account-update'),
    path('auth/verify/', VerifyView.as_view(), name='verify'),
]
