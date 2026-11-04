
from django.http import FileResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.authtoken.models import Token

from .exports import export_docx, export_json, export_pdf, export_txt
from .models import Resume
from .serializers import ResumeSerializer

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = None

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def export_docx(self, request, pk=None):
        resume = self.get_object()
        filename = f"{resume.name.replace(' ', '_')}_Resume.docx"
        return FileResponse(
            export_docx(resume, request.query_params.get("accent_color")),
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        resume = self.get_object()
        filename = f"{resume.name.replace(' ', '_')}_Resume.pdf"
        return FileResponse(
            export_pdf(resume, request.query_params.get("accent_color")),
            as_attachment=True,
            filename=filename,
            content_type='application/pdf',
        )

    @action(detail=True, methods=['get'])
    def export_json(self, request, pk=None):
        resume = self.get_object()
        filename = f"{resume.name.replace(' ', '_')}_Resume.json"
        return FileResponse(
            export_json(resume, request.query_params.get("accent_color")),
            as_attachment=True,
            filename=filename,
            content_type='application/json',
        )

    @action(detail=True, methods=['get'])
    def export_txt(self, request, pk=None):
        resume = self.get_object()
        filename = f"{resume.name.replace(' ', '_')}_Resume.txt"
        return FileResponse(
            export_txt(resume),
            as_attachment=True,
            filename=filename,
            content_type='text/plain; charset=utf-8',
        )


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''
        
        if not username or not password:
            return Response(
                {'error': 'Username and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            })
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@method_decorator(csrf_exempt, name='dispatch')
class SignupView(APIView):
    """User signup endpoint"""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_signup"

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all(isinstance(value, str) for value in (username, email, password)):
            return Response(
                {'error': 'Username, email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = username.strip()
        email = email.strip().lower()
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email and password required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
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
                {'error': " ".join(validation_errors)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=True,
        )
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)


class AccountUpdateView(APIView):
    """Update the signed-in user's username and/or password."""
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''

        if not username and not password:
            return Response(
                {'error': 'Enter a new username or password'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if username and username != user.username:
            if User.objects.filter(username__iexact=username).exclude(pk=user.pk).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = username

        if password:
            if not isinstance(password, str):
                return Response(
                    {'error': 'Password must be a string.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                validate_password(password, user=user)
            except ValidationError as error:
                return Response(
                    {'error': " ".join(error.messages)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(password)

        user.save()
        if password:
            Token.objects.filter(user=user).delete()
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        })


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
        })


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
