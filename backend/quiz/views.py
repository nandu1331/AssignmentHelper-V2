from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Quiz, QuizAttempt, Question
from .serializers import QuizSerializer, QuizAttemptSerializer, QuizAttemptCreateSerializer, QuizAttemptStatisticsSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveAPIView, ListAPIView
from django.shortcuts import get_object_or_404


class SignupView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuizListAPIView(APIView):
    def get(self, request):
        recent_quizzes = Quiz.objects.filter(created_by=request.user).order_by('-created_at')[:5]
        serializer = QuizSerializer(recent_quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class QuizAttemptAPIView(RetrieveAPIView):
  queryset = Quiz.objects.all()
  serializer_class = QuizSerializer
  permission_classes = [IsAuthenticated]

  def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    if not instance.is_active:
      return Response({"detail": "This quiz is no longer available."}, status=status.HTTP_404_NOT_FOUND)
    serializer = self.get_serializer(instance)
    return Response(serializer.data, status=status.HTTP_200_OK)
    

import json
from django.utils import timezone

class SubmitQuizAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        try:
            try:
                attempt = get_object_or_404(QuizAttempt, id=attempt_id, user=request.user)
            except QuizAttempt.DoesNotExist:
                return Response({'error': 'Attempt not found'}, status=status.HTTP_404_NOT_FOUND)

            questions = attempt.quiz.questions.all()

            if not questions:
                return Response({'error': 'This quiz has no questions'}, status=status.HTTP_400_BAD_REQUEST)

            answers = request.data.get('answers', []) # Get answers directly from request.data
            correct_answers = 0
            incorrect_answers = []

            for answer in answers:
                question_index = answer.get('questionIndex')
                selected_option = answer.get('selectedOption')
                if question_index is None or selected_option is None:
                    continue

                try:
                    question = questions[question_index]
                    if question.correct_option == selected_option:
                        correct_answers += 1
                    else:
                        incorrect_answers.append({
                            'question': question.text,
                            'selectedOption': question.options[selected_option],
                            'correctOption': question.options[question.correct_option],
                            'explanation': question.explanation
                        })
                except IndexError:
                    continue

            total_questions = questions.count()
            score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

            attempt.answers = answers
            attempt.score = score
            attempt.completed_at = timezone.now()
            attempt.save()

            serializer = QuizAttemptSerializer(attempt) # Use the standard serializer here
            return Response(serializer.data, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in submit_quiz: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StartQuizView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(pk=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
        
        existing_attempt = QuizAttempt.objects.filter(user = request.user, quiz = quiz, completed_at__isnull=True).first()
        if existing_attempt:
            serializer = QuizAttemptSerializer(existing_attempt)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        attempt = QuizAttempt.objects.create(user = request.user, quiz=quiz)
        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class QuizAttemptListView(ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        return QuizAttempt.objects.filter(quiz_id=quiz_id, user=self.request.user).order_by('-completed_at') #Ordering the attempts from latest to oldest

class QuizResultsAPIView(RetrieveAPIView):  # Existing view for specific attempt result
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        quiz_id = self.kwargs['quiz_id']
        attempt_id = self.kwargs['id']  # Accessing attempt_id from URL
        return get_object_or_404(QuizAttempt, quiz_id=quiz_id, id=attempt_id, user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        incorrect_questions = []
        answers = instance.answers

        questions = instance.quiz.questions.all()

        for answer in answers:
            try:
                question_index = answer.get('questionIndex')
                selected_option = answer.get('selectedOption')

                if question_index is None:
                    continue

                question = questions[question_index]

                if question.correct_option != selected_option:
                    incorrect_questions.append({
                        'question': question.text,
                        'selectedOption': question.options[selected_option],
                        'correctOption': question.options[question.correct_option],
                        'explanation': question.explanation,
                    })
            except IndexError:
                continue

        data = serializer.data
        data['incorrect_questions'] = incorrect_questions
        data['time_taken'] = (instance.completed_at - instance.started_at).total_seconds()
        return Response(data, status=status.HTTP_200_OK)

from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache

class QuizHistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class QuizHistoryAPIView(ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = QuizHistoryPagination

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related('quiz').order_by('-completed_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            cache_key = f'user_stats_{request.user.id}'
            user_stats = cache.get(cache_key)
            if not user_stats:
                user_stats = QuizAttempt.get_user_statistics(request.user)
                cache.set(cache_key, user_stats, 3600)
            statistics_serializer = QuizAttemptStatisticsSerializer(user_stats)
            data = {
                'results': serializer.data,
                'statistics': statistics_serializer.data,
                'num_pages': self.paginator.page.paginator.num_pages
            }
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class GenerateQuizAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = request.data  # DRF automatically parses JSON
            topic = data.get('topic')
            context = data.get('context', '')
            difficulty = data.get('difficulty')
            num_of_questions = data.get('numOfQuestions')

            if not topic:
                return Response({'error': 'Topic is required'}, status=status.HTTP_400_BAD_REQUEST)

            from .quiz_generator import QuizGenerator # Import inside the view to avoid circular imports.

            quiz_generator = QuizGenerator()
            quiz_data = quiz_generator.generate_quiz(topic, context, difficulty, num_of_questions)

            if not quiz_data or 'questions' not in quiz_data:
                return Response({'error': 'Failed to generate quiz, please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            quiz = Quiz.objects.create(
                title=quiz_data['title'],
                topic=topic,
                context=context,
                created_by=request.user,
                difficulty=difficulty,
                num_of_questions=num_of_questions
            )

            for question in quiz_data['questions']:
                Question.objects.create(
                    quiz=quiz,
                    text=question['text'],
                    options=question['options'],
                    correct_option=question['correctOption'],
                    explanation=question.get('explanation', ''),
                )

            serializer = QuizSerializer(quiz) # Serialize the created quiz
            return Response(serializer.data, status=status.HTTP_201_CREATED) # Return 201 Created

        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in generate_quiz: {str(e)}")
            return Response({'error': 'An unexpected error occurred. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)