from django.conf import settings
from django.db import models


class AIUsage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    endpoint = models.CharField(max_length=40, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
