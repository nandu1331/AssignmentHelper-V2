from django.urls import path
from . import views

urlpatterns = [
    path('documents/', views.DocumentList.as_view(), name='document-list'),
    path('documents/<int:pk>/', views.DocumentDetail.as_view(), name='document-detail'),
    path('documents/<int:pk>/download/', views.DocumentDownload.as_view(), name='document-download'),
    path('documents/<int:document_id>/questions/', views.QuestionList.as_view(), name="question-list"),
    path('documents/<int:document_id>/questions/<int:question_id>/answer/', views.GenerateSingleAnswer.as_view(), name='generate-single-answer'),
    path('documents/<int:document_id>/questions/answers/', views.GenerateMultipleAnswers.as_view(), name='generate-multiple-answers'), 
    path('documents/<int:document_id>/extract_questions/', views.ExtractQuestions.as_view(), name='extract-questions'),
    path('documents/<int:document_id>/update_questions/', views.UpdateQuestions.as_view(), name='update_questions'),
    path('documents/<int:document_id>/generate_question_bank/', views.GenerateQuestionBank.as_view(), name='generate-question-bank'),
]
