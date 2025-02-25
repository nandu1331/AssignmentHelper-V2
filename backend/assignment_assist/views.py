from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from .models import Document, APIResponse
from .serializers import DocumentSerializer, QuestionSerializer, AnswerSerializer
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db import transaction

class DocumentList(APIView):

    def get(self, request):
        """
        Retrieve a list of uploaded documents for the logged-in user.
        """
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Upload a new document.
        """
        # Assuming you have authentication set up, the logged-in user is accessible as request.user
        request.data['user'] = request.user.id
        user = request.user
        file_name = request.data.get('name')

        # Check for duplicates
        if Document.objects.filter(user=user, name=file_name).exists():
            return Response({
                "message": "This document has already been uploaded.",
            }, status=status.HTTP_409_CONFLICT)
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentDetail(APIView):

    def get(self, request, pk):
        """
        Get details of a specific document.
        """
        document = get_object_or_404(Document, pk=pk, user=request.user)
        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def delete(self, request, pk):
        """
        Delete a specific document.
        """
        document = get_object_or_404(Document, pk=pk, user=request.user)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DocumentDownload(APIView):
    def get(self, request, pk):
        """
        Download the original PDF of a specific document.
        """
        document = get_object_or_404(Document, pk=pk, user=request.user)
        
        # Check if the file exists
        if not document.answers:
            return Response({'error': 'Answers PDF not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Return the file as a response
        response = FileResponse(document.answers, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{document.name}-Answers"' 
        return response

class QuestionList(APIView):
    def get(self, request, document_id):
        """
        Retrieve a list of questions for a document.
        """
        document = get_object_or_404(Document, pk=document_id, user=request.user)
        questions = APIResponse.objects.filter(document=document)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    def patch(self, request, document_id):
        """
        Update existing questions for a document.
        """
        document = get_object_or_404(Document, pk=document_id, user=request.user)

        # Expecting data in the format:
        # [{"id": 1, "text": "Updated Question 1"}, {"id": 2, "text": "Updated Question 2"}]
        serializer = QuestionSerializer(data=request.data, many=True)
        if serializer.is_valid():
            for question_data in serializer.validated_data:
                question_id = question_data['id']
                question_text = question_data['text']

                try:
                    question = APIResponse.objects.get(document=document, question_id=question_id)
                    question.question = question_text
                    question.save()
                except APIResponse.DoesNotExist:
                    return Response(
                        {'error': f'Question with ID {question_id} not found in document.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .answers_generation_lliama import get_answers_with_llama

class GenerateSingleAnswer(APIView):
    def post(self, request, document_id, question_id):
        """
        Generate an answer for a single question.
        """
        try:
            data = request.data
            question = data.get('question')
            answer_detailing = data.get('answer_detailing')
            marks = data.get('marks')

            if not question or not answer_detailing:
                return Response(
                    {'error': 'Missing "question" or "answer_detailing" in request data.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            answer = get_answers_with_llama([question], answer_detailing, marks)[0] # Get the single answer

            return Response({'question': question, 'answer': answer}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateMultipleAnswers(APIView):
    def get(self, request, document_id):
        """
        Retrieve saved questions and answers for a document.
        """
        try:
            # Fetch the document and validate ownership
            try:
                document = Document.objects.get(id=document_id, user=request.user)
            except Document.DoesNotExist:
                return Response(
                    {'error': 'Document not found or access denied.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Query all APIResponse objects for the document
            responses = APIResponse.objects.filter(document=document).order_by('question_id')

            # Serialize the data
            result = [
                {
                    'question_id': response.question_id,
                    'question': response.question,
                    'answer': response.answer,
                }
                for response in responses
            ]

            return Response({'document_id': document_id, 'responses': result}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, document_id):
        """
        Generate answers for multiple questions.
        """
        try: 
            data = request.data
            questions = data.get('questions')
            answer_detailing = data.get('answer_detailing')
            marks = data.get('marks')

            if not questions or not answer_detailing:
                return Response(
                    {'error': '"questions" must be a list, and "answer_detailing" is required.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch the document and user
            try:
                document = Document.objects.get(id=document_id, user=request.user)
            except Document.DoesNotExist:
                return Response(
                    {'error': 'Document not found or access denied.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            answers = get_answers_with_llama(questions, answer_detailing, marks)
            
            # Use transaction to ensure atomicity
            with transaction.atomic():
                for question in questions:
                    question_id = question.get('id')
                    answer_text = answers.get(question_id, "No answer generated")

                    # Update or create an APIResponse
                    APIResponse.objects.update_or_create(
                        document=document,
                        question_id=question_id,
                        defaults={
                            'question': question.get('text', ''),
                            'answer': answer_text,
                            'user': request.user,
                        }
                    )
            
            # Append answers to the original questions
            for question in questions:
                question_id = question.get('id')
                question['answer'] = answers.get(question_id, "No answer generated")
            
            return Response({'questions': questions, 'answers': answers}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from .question_extraction_pipeline import extract_text_from_pdf, extract_questions

class ExtractQuestions(APIView):
    parser_classes = (MultiPartParser,) # Allow file uploads

    def post(self, request, document_id):
        document = get_object_or_404(Document, pk=document_id, user=request.user)

        # Get the uploaded PDF file
        pdf_file = document.file
        if not pdf_file:
            return Response({'error': 'No document file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Apply your question extraction logic (this should include your filtering)
        questions_with_ids = extract_questions(pdf_file)

        # Create APIResponse entries for each question
        for question_id, question_text in questions_with_ids:
            APIResponse.objects.create(
                document=document,
                question=question_text,
                question_id=question_id
            )

        # Serialize the extracted questions for the response
        questions = APIResponse.objects.filter(document=document)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateQuestions(APIView):
    def patch(self, request, document_id):
        document = get_object_or_404(Document, pk=document_id, user=request.user)
        serializer = QuestionSerializer(data=request.data, many=True) # Use QuestionSerializer
        if serializer.is_valid():
            for question_data in serializer.validated_data:
                question_id = question_data['question_id'] # Access question_id correctly
                question_text = question_data['question'] # Access question correctly

                try:
                    question = APIResponse.objects.get(document=document, question_id=question_id)
                    question.question = question_text
                    question.save()
                except APIResponse.DoesNotExist:
                    return Response({'error': f'Question with ID {question_id} not found in document.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'message': 'Questions updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from fpdf import FPDF

class GenerateQuestionBank(APIView):
    def post(self, request, document_id):
        """
        Generates a question bank PDF for the given document.
        """
        document = get_object_or_404(Document, pk=document_id, user=request.user)
        questions_and_answers = APIResponse.objects.filter(document=document)

        if not questions_and_answers:
            return Response({'error': 'No questions and answers found for this document.'}, status=status.HTTP_404_NOT_FOUND)

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)

        for qa in questions_and_answers:
            pdf.cell(200, 10, txt=f"Q{qa.question_id}. {qa.question}", ln=1)
            pdf.ln(5)  # Add some space between question and answer
            pdf.multi_cell(200, 10, txt=qa.answer)
            pdf.ln(10) # Add more space between questions

        # Create the PDF in memory
        pdf_bytes = pdf.output(dest='S').encode('latin-1') 

        # Return the PDF as a downloadable file
        response = Response(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="question_bank_{document.name}.pdf"'
        return response