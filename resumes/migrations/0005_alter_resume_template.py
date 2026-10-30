from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resumes', '0004_resume_phone_resume_user_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='resume',
            name='template',
            field=models.CharField(
                choices=[
                    ('template1', 'Template 1'),
                    ('template2', 'Template 2'),
                    ('template3', 'Template 3'),
                    ('template4', 'Template 4'),
                    ('template5', 'Template 5'),
                    ('template6', 'Template 6'),
                    ('template7', 'Template 7'),
                    ('template8', 'Template 8'),
                    ('template9', 'Template 9'),
                    ('template10', 'Template 10'),
                    ('template11', 'Template 11'),
                    ('template12', 'Template 12'),
                    ('template13', 'Template 13'),
                    ('template14', 'Template 14'),
                ],
                default='template1',
                max_length=10,
            ),
        ),
    ]
