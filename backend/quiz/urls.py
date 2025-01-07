from django.urls import path
from . import views

urlpatterns = [
    path('quizzes/', views.QuizListAPIView.as_view(), name='quiz-list'), 
    path('start/<int:quiz_id>/', views.StartQuizView.as_view(), name='quiz-start'),
    path('attempt/<int:pk>/', views.QuizAttemptAPIView.as_view(), name='attempt_quiz'),
    path('submit/<int:attempt_id>/', views.SubmitQuizAPIView.as_view(), name='submit_quiz'),
    path('results/<int:quiz_id>/', views.QuizAttemptListView.as_view(), name='quiz-attempt-list'), # List of attempts
    path('results/<int:quiz_id>/<int:id>/', views.QuizResultsAPIView.as_view(), name='quiz-result-detail'), # Specific attempt results
    path('history/', views.QuizHistoryAPIView.as_view(), name='quiz_history'),
    path('generate/', views.GenerateQuizAPIView.as_view(), name='generate_quiz'),
]