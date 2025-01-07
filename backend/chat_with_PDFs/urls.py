from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.pdf_chat_home, name='pdf_chat_home'),
    path('create/', views.create_chat_session, name='create_chat_session'),
    path('<int:session_id>/', views.chat_session, name='chat_session'),
    path('<int:session_id>/end/', views.end_chat_session, name='end_chat_session'),
    path('<int:session_id>/send/', views.send_message, name='send_message'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)