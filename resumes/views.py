from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import FileResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .exports import export_docx, export_json, export_pdf, export_txt, safe_filename
from .export_styles import UnsupportedPdfLanguageError
from .models import Resume
from .serializers import ResumeSerializer

User = get_user_model()


class ResumePagination(PageNumberPagination):
    page_size = 50


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ResumePagination

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def export_docx(self, request, pk=None):
        resume = self.get_object()
        filename = f"{safe_filename(resume.name, 'Resume')}.docx"
        return FileResponse(
            export_docx(resume, request.query_params.get("accent_color")),
            as_attachment=True,
            filename=filename,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        resume = self.get_object()
        filename = f"{safe_filename(resume.name, 'Resume')}.pdf"
        try:
            pdf = export_pdf(resume, request.query_params.get("accent_color"))
        except UnsupportedPdfLanguageError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=filename,
            content_type="application/pdf",
        )

    @action(detail=True, methods=["get"])
    def export_json(self, request, pk=None):
        resume = self.get_object()
        filename = f"{safe_filename(resume.name, 'Resume')}.json"
        return FileResponse(
            export_json(resume, request.query_params.get("accent_color")),
            as_attachment=True,
            filename=filename,
            content_type="application/json",
        )

    @action(detail=True, methods=["get"])
    def export_txt(self, request, pk=None):
        resume = self.get_object()
        filename = f"{safe_filename(resume.name, 'Resume')}.txt"
        return FileResponse(
            export_txt(resume),
            as_attachment=True,
            filename=filename,
            content_type="text/plain; charset=utf-8",
        )


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not isinstance(username, str) or not isinstance(password, str):
            return Response(
                {"error": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = username.strip()
        if not username or not password:
            return Response(
                {"error": "Username and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class SignupView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_signup"

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        if not all(isinstance(value, str) for value in (username, email, password)):
            return Response(
                {"error": "Username, email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = username.strip()
        email = email.strip().lower()
        if not username or not email or not password:
            return Response(
                {"error": "Username, email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        candidate = User(username=username, email=email)
        validation_errors = []
        try:
            validate_email(email)
        except ValidationError as error:
            validation_errors.extend(error.messages)
        try:
            validate_password(password, user=candidate)
        except ValidationError as error:
            validation_errors.extend(error.messages)
        if validation_errors:
            return Response(
                {"error": " ".join(validation_errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=True,
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            },
            status=status.HTTP_201_CREATED,
        )


class AccountUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        if not isinstance(username, str) or not isinstance(password, str):
            return Response(
                {"error": "Username and password must be strings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = username.strip()
        if not username and not password:
            return Response(
                {"error": "Enter a new username or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if username and username != user.username:
            if User.objects.filter(username__iexact=username).exclude(pk=user.pk).exists():
                return Response(
                    {"error": "Username already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = username

        if password:
            try:
                validate_password(password, user=user)
            except ValidationError as error:
                return Response(
                    {"error": " ".join(error.messages)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(password)

        user.save()
        if password:
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
        else:
            token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        )
