from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ExpiringTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        ttl_days = getattr(settings, "TOKEN_TTL_DAYS", 14)
        if token.created < timezone.now() - timedelta(days=ttl_days):
            token.delete()
            raise AuthenticationFailed("Token has expired.")
        return user, token
