#!/usr/bin/env python
"""
Create or sync the local Django admin account.

Environment variables:
    ADMIN_USERNAME: admin username (default: admin)
    ADMIN_EMAIL: admin email (default: admin@analytical.engine)
    ADMIN_PASSWORD: admin password (default: Admin@123456)
"""

import os
import sys

import django
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User  # noqa: E402


def create_admin() -> bool:
    admin_username = os.getenv("ADMIN_USERNAME", "admin")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@analytical.engine")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@123456")

    if len(admin_password) < 8:
        print("Password must be at least 8 characters long.")
        return False

    try:
        user = User.objects.filter(username=admin_username).first()

        if user:
            user.email = admin_email
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.set_password(admin_password)
            user.save()
            print("Admin account updated successfully.")
        else:
            User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password,
            )
            print("Admin account created successfully.")

        print(f"Username: {admin_username}")
        print(f"Email: {admin_email}")
        print("Password: [hidden]")
        print("Admin URL: http://127.0.0.1:8000/admin/")
        return True
    except Exception as exc:
        print(f"Failed to create or sync admin account: {exc}")
        return False


if __name__ == "__main__":
    raise SystemExit(0 if create_admin() else 1)
