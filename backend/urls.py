"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import JsonResponse
from resumes.api_views import ResumeCreateView, ResumeDetailView, DetectResumeTypeView


def home_view(request):
    """Root URL handler - returns API info"""
    return JsonResponse({
        'message': 'Welcome to Inkwell API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
        }
    })


urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('resume/create/', ResumeCreateView.as_view(), name='root-resume-create'),
    path('resume/<int:pk>/', ResumeDetailView.as_view(), name='root-resume-detail'),
    path('resume/detect-type/', DetectResumeTypeView.as_view(), name='root-resume-detect-type'),
    path('api/', include('resumes.urls')),
]
