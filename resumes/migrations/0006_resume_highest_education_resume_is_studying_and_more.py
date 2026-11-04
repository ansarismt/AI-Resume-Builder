from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("resumes", "0005_alter_resume_template"),
    ]

    operations = [
        migrations.AddField(
            model_name="resume",
            name="highest_education",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="resume",
            name="is_studying",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="resume",
            name="years_of_experience",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
