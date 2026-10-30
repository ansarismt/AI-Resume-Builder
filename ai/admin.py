from django.contrib import admin

from .models import AIUsage


@admin.register(AIUsage)
class AIUsageAdmin(admin.ModelAdmin):
    list_display = ("user", "endpoint", "created_at")
    list_filter = ("endpoint", "created_at")
    readonly_fields = ("user", "endpoint", "created_at")
