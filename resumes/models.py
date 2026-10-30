from django.db import models

class Resume(models.Model):
    USER_TYPE_CHOICES = [
        ('school', 'School Student'),
        ('college', 'College Student'),
        ('professional', 'Working Professional'),
    ]

    TEMPLATE_CHOICES = [
        ('template1', 'Template 1'),
        ('template2', 'Template 2'),
        ('template3', 'Template 3'),
        ('template4', 'Template 4'),
        ('template5', 'Template 5'),
        ('template6', 'Template 6'),
        ('template7', 'Template 7'),
        ('template8', 'Template 8'),
        ('template9', 'Template 9'),
        ('template10', 'Template 10'),
        ('template11', 'Template 11'),
        ('template12', 'Template 12'),
        ('template13', 'Template 13'),
        ('template14', 'Template 14'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, default="")
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='college')
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
    template = models.CharField(max_length=10, choices=TEMPLATE_CHOICES, default='template1')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name}'s Resume"


class EmailVerification(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    code = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Verification for {self.user.username}: {self.code}"
