from .models import PDFChatSession, ChatMessage
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from assignment_assist.models import Document
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import json
import os


@login_required
def pdf_chat_home(request):
    """Display user's PDF chat sessions and option to start new ones."""
    active_sessions = PDFChatSession.objects.filter(
        user=request.user,
        is_active=True
    ).select_related('pdf_document')
    
    documents = Document.objects.filter(user=request.user)
    
    return render(request, 'core/home.html', {
        'active_sessions': active_sessions,
        'documents': documents
    })

@login_required
def create_chat_session(request):
    """Create a new PDF chat session."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        
        if not document_id:
            return JsonResponse({'error': 'Document ID is required'}, status=400)
        
        # Get the document and verify ownership
        document = get_object_or_404(Document, id=document_id, user=request.user)
        
        # Create new chat session
        session = PDFChatSession.objects.create(
            user=request.user,
            pdf_document=document,
            is_active=True
        )
        
        # Return the redirect URL using the URL pattern name
        return JsonResponse({
            'session_id': session.id,
            'redirect_url': request.build_absolute_uri(
                reverse('chat_session', kwargs={'session_id': session.id})
            )
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def chat_session(request, session_id):
    """Handle individual chat sessions."""
    session = get_object_or_404(PDFChatSession, id=session_id, user=request.user)
    messages = ChatMessage.objects.filter(session=session)
    
    return render(request, 'core/session.html', {
        'session': session,
        'messages': messages,
        'document': session.pdf_document
    })

@login_required
def send_message(request, session_id):
    """Handle sending and receiving chat messages."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        session = get_object_or_404(PDFChatSession, id=session_id, user=request.user)
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Store user message
        ChatMessage.objects.create(
            session=session,
            sender='USER',
            message=user_message
        )
        
        # Process message with LLaMa
        try:
            ai_response, is_relevant = process_with_llama(user_message, session)
            # Convert bool to int for JSON serialization
            is_relevant_int = 1 if is_relevant else 0
        except Exception as llama_error:
            print(f"LLaMA processing error: {str(llama_error)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            ai_response = "I apologize, but I encountered an error processing your message. Please try again."
            is_relevant_int = 0
        
        # Store AI response
        ai_message = ChatMessage.objects.create(
            session=session,
            sender='AI',
            message=ai_response,
            is_context_relevant=bool(is_relevant_int)  # Convert back to bool for database
        )
        
        return JsonResponse({
            'response': ai_response,
            'is_relevant': is_relevant_int,  # Send as int
            'timestamp': ai_message.timestamp.isoformat()
        })
        
    except Exception as e:
        print(f"Detailed error in send_message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500)

from .llama_integration import process_with_llama

@login_required
def send_message(request, session_id):
    """Handle sending and receiving chat messages."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        session = get_object_or_404(PDFChatSession, id=session_id, user=request.user)
        print(f"PDF document path: {session.pdf_document.file.path}")
        print(f"PDF document exists: {os.path.exists(session.pdf_document.file.path)}")
        
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Store user message
        ChatMessage.objects.create(
            session=session,
            sender='USER',
            message=user_message
        )
        
        try:
            # Process message with LLaMa
            ai_response, is_relevant = process_with_llama(user_message, session)
            # Convert bool to int for JSON serialization
            is_relevant_int = 1 if is_relevant else 0
        except Exception as llama_error:
            print(f"LLaMA processing error: {str(llama_error)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            ai_response = "I apologize, but I encountered an error processing your message. Please try again."
            is_relevant_int = 0
        
        # Store AI response
        ai_message = ChatMessage.objects.create(
            session=session,
            sender='AI',
            message=ai_response,
            is_context_relevant=bool(is_relevant_int)
        )
        
        # Ensure all values are JSON serializable
        response_data = {
            'response': str(ai_response),  # Convert to string to ensure serializable
            'is_relevant': int(is_relevant_int),  # Use integer instead of boolean
            'timestamp': ai_message.timestamp.isoformat()  # Convert datetime to ISO format string
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"Detailed error in send_message: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500)
    
@login_required
def end_chat_session(request, session_id):
    if request.method == 'POST':
        session = get_object_or_404(PDFChatSession, id=session_id, user=request.user)
        session.is_active = False
        session.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)