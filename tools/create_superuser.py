import os, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from django.contrib.auth.models import User

USERNAME = 'vdart'
PASSWORD = 'vdaty@123'
EMAIL = 'vdart@example.com'

u = User.objects.filter(username=USERNAME).first()
if u:
    u.is_staff = True
    u.is_superuser = True
    u.is_active = True
    u.email = EMAIL
    u.set_password(PASSWORD)
    u.save()
    print(f'updated {USERNAME}')
else:
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print(f'created {USERNAME}')
