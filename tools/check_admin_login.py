import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django  # noqa: E402

django.setup()

from django.contrib.auth import authenticate  # noqa: E402

username = os.getenv("ADMIN_USERNAME", "admin")
password = os.getenv("ADMIN_PASSWORD", "Admin@123456")
user = authenticate(username=username, password=password)

print({"authenticated": bool(user), "username": getattr(user, "username", None)})
