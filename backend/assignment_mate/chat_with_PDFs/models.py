from django.db import models
from django.contrib.auth.models import User
from ..assignment_assist.models import Document


class PDFChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pdf_document = models.ForeignKey(Document, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-last_activity']

    def __str__(self):
        return f"Chat Session: {self.pdf_document.name} - {self.user.username}"

class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ('USER', 'User'),
        ('AI', 'AI Assistant')
    ]
    
    session = models.ForeignKey(PDFChatSession, on_delete=models.CASCADE)
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_context_relevant = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender}: {self.message[:50]}..."