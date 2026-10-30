#!/usr/bin/env python
"""
Create or sync the local Django admin account.

Environment variables:
    ADMIN_USERNAME: admin username
    ADMIN_EMAIL: admin email
    ADMIN_PASSWORD: admin password (if omitted, it is prompted interactively)
"""

import getpass
import os
import sys

import django
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User  # noqa: E402


def create_admin() -> bool:
    admin_username = os.getenv("ADMIN_USERNAME", "").strip()
    admin_email = os.getenv("ADMIN_EMAIL", "").strip()
    admin_password = os.getenv("ADMIN_PASSWORD") or getpass.getpass("Admin password: ")

    if not admin_username or not admin_email:
        print("Set ADMIN_USERNAME and ADMIN_EMAIL before creating an admin account.")
        return False
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
