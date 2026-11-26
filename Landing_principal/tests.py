import json
from unittest.mock import Mock, patch

import requests
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from .services.ai_service import (
    AssistantTimeout,
    ask_power_automate,
    build_structured_question,
)


AI_SETTINGS = {
    'AI_ASSISTANT_ENABLED': True,
    'POWER_AUTOMATE_URL': 'https://power-automate.invalid/signed-secret',
    'AI_REQUEST_TIMEOUT': 90,
    'AI_MAX_INPUT_LENGTH': 4000,
    'AI_MAX_HISTORY_MESSAGES': 10,
    'AI_RATE_LIMIT_REQUESTS': 10,
    'AI_RATE_LIMIT_WINDOW': 60,
    'AI_ASSISTANT_REQUIRE_LOGIN': False,
    'AI_ASSISTANT_ALLOWED_GROUPS': [],
}


@override_settings(**AI_SETTINGS)
class AssistantEndpointTests(TestCase):
    def setUp(self):
        cache.clear()

    @patch('Landing_principal.views.ask_power_automate')
    def test_chat_returns_plain_text_answer_as_json(self, mocked_ask):
        mocked_ask.return_value = 'Respuesta con tildes: facturación.'

        response = self.client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': '¿Para qué sirve el portal?'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['success'])
        self.assertEqual(
            response.json()['respuesta'],
            'Respuesta con tildes: facturación.',
        )
        self.assertTrue(response.json()['conversation_id'])

    @patch('Landing_principal.views.ask_power_automate')
    def test_history_is_isolated_by_browser_session(self, mocked_ask):
        mocked_ask.return_value = 'Contenido de la primera sesión.'
        first_client = Client()
        second_client = Client()
        first_client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'Primera pregunta'}),
            content_type='application/json',
        )

        first_history = first_client.get(reverse('ai_chat_history')).json()
        second_history = second_client.get(reverse('ai_chat_history')).json()

        self.assertEqual(len(first_history['messages']), 2)
        self.assertEqual(second_history['messages'], [])

    @patch('Landing_principal.views.ask_power_automate')
    def test_clear_starts_a_new_conversation(self, mocked_ask):
        mocked_ask.return_value = 'Respuesta.'
        self.client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'Consulta'}),
            content_type='application/json',
        )
        old_id = self.client.get(reverse('ai_chat_history')).json()[
            'conversation_id'
        ]

        cleared = self.client.post(
            reverse('ai_chat_clear'),
            data='{}',
            content_type='application/json',
        ).json()
        history = self.client.get(reverse('ai_chat_history')).json()

        self.assertNotEqual(cleared['conversation_id'], old_id)
        self.assertEqual(history['messages'], [])

    @override_settings(AI_MAX_INPUT_LENGTH=5)
    def test_input_length_is_validated_before_upstream_call(self):
        response = self.client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'demasiado largo'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 422)

    def test_invalid_json_is_rejected(self):
        response = self.client.post(
            reverse('ai_chat'),
            data='{invalido',
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 400)

    @override_settings(AI_ASSISTANT_ENABLED=False)
    def test_disabled_assistant_is_hidden_and_unavailable(self):
        page = self.client.get(reverse('landing_page'))
        endpoint = self.client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'Hola'}),
            content_type='application/json',
        )

        self.assertNotContains(page, 'id="ai-assistant"')
        self.assertEqual(endpoint.status_code, 503)

    @override_settings(AI_ASSISTANT_REQUIRE_LOGIN=True)
    def test_authentication_can_be_required(self):
        response = self.client.get(reverse('ai_chat_history'))
        self.assertEqual(response.status_code, 401)

    @override_settings(AI_RATE_LIMIT_REQUESTS=1)
    @patch('Landing_principal.views.ask_power_automate')
    def test_rate_limit_blocks_additional_calls(self, mocked_ask):
        mocked_ask.return_value = 'Respuesta.'
        payload = json.dumps({'pregunta': 'Consulta'})

        first = self.client.post(
            reverse('ai_chat'), data=payload, content_type='application/json'
        )
        second = self.client.post(
            reverse('ai_chat'), data=payload, content_type='application/json'
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 429)
        self.assertEqual(mocked_ask.call_count, 1)

    @patch('Landing_principal.views.ask_power_automate')
    def test_timeout_is_mapped_without_internal_details(self, mocked_ask):
        mocked_ask.side_effect = AssistantTimeout
        response = self.client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'Consulta'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 504)
        self.assertNotIn('power-automate', response.content.decode())

    def test_csrf_is_required_for_post(self):
        csrf_client = Client(enforce_csrf_checks=True)
        response = csrf_client.post(
            reverse('ai_chat'),
            data=json.dumps({'pregunta': 'Consulta'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 403)

    def test_enabled_page_exposes_only_internal_endpoints(self):
        response = self.client.get(reverse('landing_page'))
        content = response.content.decode('utf-8')

        self.assertContains(response, 'id="ai-assistant"')
        self.assertIn('/api/ai/chat/', content)
        self.assertNotIn(AI_SETTINGS['POWER_AUTOMATE_URL'], content)
        self.assertNotIn('copilotstudio.microsoft.com', content)


@override_settings(**AI_SETTINGS)
class AssistantServiceTests(TestCase):
    @patch('Landing_principal.services.ai_service.requests.post')
    def test_service_uses_backend_secret_and_plain_text_response(self, post):
        post.return_value = Mock(status_code=200, text='Respuesta UTF-8: Perú')

        result = ask_power_automate('Pregunta actual', [])

        self.assertEqual(result, 'Respuesta UTF-8: Perú')
        post.assert_called_once()
        self.assertEqual(
            post.call_args.args[0],
            AI_SETTINGS['POWER_AUTOMATE_URL'],
        )
        self.assertEqual(post.call_args.kwargs['timeout'], 90)
        self.assertIn('pregunta', post.call_args.kwargs['json'])

    @patch('Landing_principal.services.ai_service.requests.post')
    def test_service_does_not_retry_after_timeout(self, post):
        post.side_effect = requests.Timeout

        with self.assertRaises(AssistantTimeout):
            ask_power_automate('Pregunta', [])

        self.assertEqual(post.call_count, 1)

    @override_settings(AI_MAX_HISTORY_MESSAGES=2)
    def test_structured_question_limits_history_and_adds_portal_context(self):
        prompt = build_structured_question('Consulta actual', [
            {'role': 'user', 'content': 'Mensaje antiguo'},
            {'role': 'assistant', 'content': 'Respuesta reciente'},
            {'role': 'user', 'content': 'Pregunta reciente'},
        ])

        self.assertNotIn('Mensaje antiguo', prompt)
        self.assertIn('Respuesta reciente', prompt)
        self.assertIn('Pregunta reciente', prompt)
        self.assertIn('Gerencia de Facturación', prompt)
        self.assertIn('Consulta actual', prompt)
