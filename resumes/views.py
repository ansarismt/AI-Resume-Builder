import json
from io import BytesIO
from django.http import FileResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from openai import OpenAI
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

from .models import Resume
from .serializers import ResumeSerializer

client = OpenAI(api_key="YOUR_API_KEY")


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    # Allow public access in development to make frontend saving easy
    permission_classes = [permissions.AllowAny]

    # 🔥 NEW: AI parsing endpoint
    @action(detail=False, methods=['post'])
    def parse_resume(self, request):
        user_input = request.data.get("text", "")

        prompt = f"""
Extract the following details from the text and return ONLY JSON:

- full_name
- email
- skills (array)
- experience
- education
- internships (array)
- projects (array)
- certifications (array)
- achievements (array)
- professional_summary

If any field is missing, return empty string or empty array.

Text:
\"\"\"
{user_input}
\"\"\"
"""

        response = client.chat.completions.create(
            model="gpt-5.3",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"}
        )

        data = response.choices[0].message.content

        try:
            parsed_data = json.loads(data)
        except:
            return Response({"error": "Invalid AI response", "raw": data})

        return Response(parsed_data)

    # 📄 NEW: Export resume as DOCX
    @action(detail=True, methods=['get'])
    def export_docx(self, request, pk=None):
        """Export resume as DOCX file"""
        resume = self.get_object()
        # helper to safely handle None fields
        def _has(text):
            return bool((text or "").strip())
        # Create document
        doc = Document()
        
        # Add header with name and contact
        header = doc.add_paragraph()
        header_run = header.add_run(resume.name)
        header_run.font.size = Pt(24)
        header_run.font.bold = True
        header.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Contact info
        contact_bits = [resume.email]
        if getattr(resume, "phone", ""):
            contact_bits.append(resume.phone)
        contact = doc.add_paragraph(" | ".join(filter(None, contact_bits)))
        contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact_run = contact.runs[0]
        contact_run.font.size = Pt(10)
        
        # Add spacing
        doc.add_paragraph()
        
        if resume.user_type == "school":
            ordered_sections = [
                ("Career Objective", resume.summary),
                ("Education", resume.education),
                ("Skills", resume.skills),
                ("Achievements / Activities", resume.achievements),
            ]
        elif resume.user_type == "college":
            ordered_sections = [
                ("Career Objective", resume.summary),
                ("Education", resume.education),
                ("Skills", resume.skills),
                ("Projects", resume.projects),
                ("Internships", resume.internships),
                ("Certifications", resume.certifications),
                ("Achievements", resume.achievements),
            ]
        else:
            ordered_sections = [
                ("Professional Summary", resume.summary),
                ("Experience", resume.experience),
                ("Skills", resume.skills),
                ("Certifications", resume.certifications),
                ("Education", resume.education),
                ("Projects", resume.projects),
            ]

        for heading, value in ordered_sections:
            if _has(value):
                doc.add_heading(heading, level=2)
                doc.add_paragraph(value or "")
                doc.add_paragraph()
        
        # Save to bytes
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        
        # Return as file download
        filename = f"{resume.name.replace(' ', '_')}_Resume.docx"
        return FileResponse(
            buffer,
            as_attachment=True,
            filename=filename,
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
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


class SignupView(APIView):
    """User signup endpoint"""
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response(
                {'error': 'Username, email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
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


class VerifyView(APIView):
    """Legacy verification endpoint no longer required"""
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        return Response(
            {'message': 'Verification is no longer required. Please sign in directly.'},
            status=status.HTTP_410_GONE,
        )
