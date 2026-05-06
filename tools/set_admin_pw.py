import os, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from django.contrib.auth.models import User
u = User.objects.filter(username='admin').first()
if not u:
    print('no admin user')
else:
    u.set_password('adminpass')
    u.save()
    print('password-set')
