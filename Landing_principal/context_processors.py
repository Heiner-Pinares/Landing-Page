from django.conf import settings


def ai_assistant(request):
    """Expose only safe feature flags to templates."""
    return {
        'ai_assistant_enabled': settings.AI_ASSISTANT_ENABLED,
        'ai_max_input_length': settings.AI_MAX_INPUT_LENGTH,
    }
