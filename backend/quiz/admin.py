from django.contrib import admin
from .models import Quiz, Question, QuizAttempt

admin.site.register(Quiz)
admin.site.register(QuizAttempt)
admin.site.register(Question)