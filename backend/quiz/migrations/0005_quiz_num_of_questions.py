# Generated by Django 5.1.4 on 2025-01-11 15:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quiz', '0004_alter_quizattempt_completed_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='quiz',
            name='num_of_questions',
            field=models.IntegerField(default=5),
        ),
    ]
