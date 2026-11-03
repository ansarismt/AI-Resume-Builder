from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Resume
from .serializers import ResumeSerializer
from .utils import detect_user_type


class ResumeCreateView(generics.CreateAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeDetailView(generics.RetrieveAPIView):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class DetectResumeTypeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        highest_education = request.data.get("highest_education", "")
        years_of_experience = request.data.get("years_of_experience", 0)

        try:
            years = int(years_of_experience or 0)
        except (TypeError, ValueError):
            years = 0

        detected = detect_user_type(highest_education, years)
        return Response({"user_type": detected})
