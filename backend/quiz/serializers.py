from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Quiz, Question, QuizAttempt

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):  # For representing users
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password') # Add other fields if needed
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'options', 'correct_option', 'explanation')

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True) # Nest questions

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'topic', 'context', 'time_limit', 'created_by', 'is_active', 'difficulty', 'questions')

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    class Meta:
        model = QuizAttempt
        fields = ('id', 'quiz', 'user', 'score', 'answers', 'started_at', 'completed_at')

class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('quiz', 'answers') # Only allow quiz and answers to be set on creation

class QuizAttemptStatisticsSerializer(serializers.Serializer):
    total_attempts = serializers.IntegerField()
    average_score = serializers.FloatField()
    highest_score = serializers.FloatField()