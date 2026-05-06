import os
import sys
import pathlib
import django
import json

# Ensure project root is on sys.path when running from tools/
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.contrib.auth.models import User

users = list(User.objects.values('username', 'is_superuser', 'is_staff', 'is_active'))
print(json.dumps(users))
