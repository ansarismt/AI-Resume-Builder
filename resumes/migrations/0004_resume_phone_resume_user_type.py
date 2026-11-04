from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("resumes", "0003_emailverification"),
    ]

    operations = [
        migrations.AddField(
            model_name="resume",
            name="phone",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.AddField(
            model_name="resume",
            name="user_type",
            field=models.CharField(
                choices=[
                    ("school", "School Student"),
                    ("college", "College Student"),
                    ("professional", "Working Professional"),
                ],
                default="college",
                max_length=20,
            ),
        ),
    ]
