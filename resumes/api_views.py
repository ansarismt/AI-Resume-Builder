from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Resume
from .serializers import ResumeSerializer
from .utils import detect_user_type


class DetectResumeTypeInputSerializer(serializers.Serializer):
    highest_education = serializers.CharField(required=False, allow_blank=True, max_length=100)
    years_of_experience = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=80,
        default=0,
    )

    def validate_years_of_experience(self, value):
        raw_value = self.initial_data.get("years_of_experience", 0)
        if type(raw_value) is not int:
            raise serializers.ValidationError("A whole number between 0 and 80 is required.")
        return value


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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "detect"

    def post(self, request):
        serializer = DetectResumeTypeInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        detected = detect_user_type(
            serializer.validated_data.get("highest_education", ""),
            serializer.validated_data["years_of_experience"],
        )
        return Response({"user_type": detected})
