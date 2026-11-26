import hashlib
import json
import time
import uuid

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST

from .models import Announcement, TransitionImage
from .services.ai_service import (
    AssistantConnectionError,
    AssistantDisabled,
    AssistantNotConfigured,
    AssistantRateLimited,
    AssistantTimeout,
    AssistantUpstreamError,
    ask_power_automate,
)


SESSION_HISTORY_KEY = 'ai_assistant_history'
SESSION_CONVERSATION_KEY = 'ai_assistant_conversation_id'
SESSION_CLIENT_KEY = 'ai_assistant_client_id'


def landing_page(request):
    announcement = Announcement.objects.last()
    transition_images = TransitionImage.objects.all()
    return render(request, 'landing_page2.html', {
        'announcement': announcement,
        'transition_images': transition_images,
    })


def announcements_history(request):
    announcements = Announcement.objects.order_by('-created_at')
    return render(
        request,
        'announcements_history.html',
        {'announcements': announcements},
    )


def my_view(request):
    announcement = Announcement.objects.last()
    transition_images = TransitionImage.objects.all()
    return render(request, 'conoce_mas.html', {
        'announcement': announcement,
        'transition_images': transition_images,
    })


def find_person(request):
    return render(request, 'buscar_personas.html')


def _error(message, status):
    return JsonResponse({'success': False, 'error': message}, status=status)


def _access_error(request):
    if not settings.AI_ASSISTANT_ENABLED:
        return _error('El asistente se encuentra desactivado.', 503)

    requires_identity = (
        settings.AI_ASSISTANT_REQUIRE_LOGIN
        or bool(settings.AI_ASSISTANT_ALLOWED_GROUPS)
    )
    if requires_identity and not request.user.is_authenticated:
        return _error('Debes iniciar sesión para usar el asistente.', 401)

    if settings.AI_ASSISTANT_ALLOWED_GROUPS:
        has_group = request.user.groups.filter(
            name__in=settings.AI_ASSISTANT_ALLOWED_GROUPS,
        ).exists()
        if not has_group and not request.user.is_superuser:
            return _error('No tienes permiso para usar el asistente.', 403)
    return None


def _conversation_id(request):
    conversation_id = request.session.get(SESSION_CONVERSATION_KEY)
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        request.session[SESSION_CONVERSATION_KEY] = conversation_id
    return conversation_id


def _request_identity(request):
    if request.user.is_authenticated:
        raw_identity = f'user:{request.user.pk}'
    else:
        client_id = request.session.get(SESSION_CLIENT_KEY)
        if not client_id:
            client_id = str(uuid.uuid4())
            request.session[SESSION_CLIENT_KEY] = client_id
        raw_identity = f'session:{client_id}'
    return hashlib.sha256(raw_identity.encode('utf-8')).hexdigest()


def _rate_limit_exceeded(identity):
    bucket = int(time.time() // settings.AI_RATE_LIMIT_WINDOW)
    cache_key = f'ai-rate:{identity}:{bucket}'
    if cache.add(
        cache_key,
        1,
        timeout=settings.AI_RATE_LIMIT_WINDOW + 2,
    ):
        return False
    try:
        requests_in_window = cache.incr(cache_key)
    except ValueError:
        cache.set(
            cache_key,
            1,
            timeout=settings.AI_RATE_LIMIT_WINDOW + 2,
        )
        requests_in_window = 1
    return requests_in_window > settings.AI_RATE_LIMIT_REQUESTS


@require_POST
def ai_chat(request):
    access_error = _access_error(request)
    if access_error:
        return access_error

    if request.content_type != 'application/json':
        return _error('La solicitud debe enviarse en formato JSON.', 400)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return _error('El contenido JSON no es válido.', 400)

    question = payload.get('pregunta') if isinstance(payload, dict) else None
    if not isinstance(question, str) or not question.strip():
        return _error('Escribe una consulta antes de enviarla.', 422)

    question = question.strip()
    if len(question) > settings.AI_MAX_INPUT_LENGTH:
        return _error(
            f'La consulta supera el límite de '
            f'{settings.AI_MAX_INPUT_LENGTH} caracteres.',
            422,
        )

    identity = _request_identity(request)
    if _rate_limit_exceeded(identity):
        return _error(
            'Alcanzaste el límite temporal de consultas. Intenta nuevamente en un minuto.',
            429,
        )

    active_key = f'ai-active:{identity}'
    if not cache.add(
        active_key,
        True,
        timeout=settings.AI_REQUEST_TIMEOUT + 5,
    ):
        return _error('Ya hay una consulta en proceso.', 429)

    history = request.session.get(SESSION_HISTORY_KEY, [])
    try:
        answer = ask_power_automate(question, history)
    except (AssistantDisabled, AssistantNotConfigured):
        return _error('El asistente no está disponible en este momento.', 503)
    except AssistantTimeout:
        return _error(
            'La respuesta demoró demasiado. Intenta nuevamente más tarde.',
            504,
        )
    except AssistantRateLimited:
        return _error(
            'El servicio de inteligencia artificial alcanzó su límite temporal.',
            429,
        )
    except (AssistantConnectionError, AssistantUpstreamError):
        return _error(
            'No fue posible comunicarse con el asistente. El portal continúa operativo.',
            502,
        )
    finally:
        cache.delete(active_key)

    history.extend([
        {'role': 'user', 'content': question},
        {'role': 'assistant', 'content': answer},
    ])
    history = history[-settings.AI_MAX_HISTORY_MESSAGES:]
    request.session[SESSION_HISTORY_KEY] = history

    return JsonResponse({
        'success': True,
        'respuesta': answer,
        'conversation_id': _conversation_id(request),
    })


@require_GET
def ai_chat_history(request):
    access_error = _access_error(request)
    if access_error:
        return access_error
    return JsonResponse({
        'success': True,
        'messages': request.session.get(SESSION_HISTORY_KEY, []),
        'conversation_id': _conversation_id(request),
    })


@require_POST
def ai_chat_clear(request):
    access_error = _access_error(request)
    if access_error:
        return access_error
    request.session[SESSION_HISTORY_KEY] = []
    request.session[SESSION_CONVERSATION_KEY] = str(uuid.uuid4())
    return JsonResponse({
        'success': True,
        'conversation_id': request.session[SESSION_CONVERSATION_KEY],
    })
