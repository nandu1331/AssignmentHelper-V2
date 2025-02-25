from rest_framework import serializers
from .models import Document, APIResponse

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id','name', 'file', 'uploaded_at', 'preview', 'user')  # Include 'file' in the list

class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='question_id') # Use 'question_id' from your model
    text = serializers.CharField(source='question')
    class Meta:
        model = APIResponse
        fields = ['id', 'text'] 
        read_only_fields = ['answer'] # Answer is not modifiable from this endpoint


class AnswerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='question_id')
    text = serializers.CharField(source='question')
    answer = serializers.CharField()  # Include the answer field

    class Meta:
        model = APIResponse
        fields = ['id', 'text', 'answer']


