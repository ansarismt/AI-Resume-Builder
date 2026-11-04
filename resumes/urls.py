from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet
from .views import AccountUpdateView, CurrentUserView, LoginView, LogoutView, SignupView
from .api_views import DetectResumeTypeView

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet)

urlpatterns = [
    path('resume/detect-type/', DetectResumeTypeView.as_view(), name='resume-detect-type'),
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/account/', AccountUpdateView.as_view(), name='account-update'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
]
