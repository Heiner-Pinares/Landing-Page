# Asistente IA corporativo

## Arquitectura

El navegador se comunica solamente con los endpoints internos de Django. Django
construye el contexto autorizado, incorpora el historial limitado de la sesión
y envía un `POST` al flujo existente de Power Automate con el contrato:

```json
{"pregunta": "contexto, historial y consulta actual"}
```

Power Automate devuelve texto UTF-8 y Django lo transforma en JSON para la
interfaz. La URL firmada no se envía al navegador, no se registra y no está en
el repositorio.

## Configuración

Definir las variables en el entorno del proceso que ejecuta Django:

```dotenv
POWER_AUTOMATE_URL=
AI_ASSISTANT_ENABLED=true
AI_REQUEST_TIMEOUT=90
AI_MAX_INPUT_LENGTH=4000
AI_MAX_HISTORY_MESSAGES=10
AI_RATE_LIMIT_REQUESTS=10
AI_RATE_LIMIT_WINDOW=60
AI_ASSISTANT_REQUIRE_LOGIN=false
AI_ASSISTANT_ALLOWED_GROUPS=
```

`POWER_AUTOMATE_URL` debe completarla manualmente el responsable autorizado.
Debe tratarse como una credencial y no copiarse en HTML, JavaScript,
documentación, capturas, logs ni commits.

El portal actual utiliza sesiones Django, pero no dispone de un inicio de sesión
corporativo para el público general. Mientras
`AI_ASSISTANT_REQUIRE_LOGIN=false`, cada conversación queda aislada por la
sesión del navegador. Para exigir usuarios autenticados, definirla como `true`.
Opcionalmente, `AI_ASSISTANT_ALLOWED_GROUPS` acepta nombres de grupos Django
separados por comas; los superusuarios también tienen acceso.

## Endpoints internos

- `POST /api/ai/chat/`: valida y envía una pregunta.
- `GET /api/ai/chat/history/`: recupera el historial de la sesión.
- `POST /api/ai/chat/clear/`: inicia una conversación nueva.

Los endpoints `POST` tienen protección CSRF. Las entradas están limitadas, se
aplica un límite de consumo por usuario/sesión y solo se permite una solicitud
simultánea por identidad. No hay reintentos automáticos.

## Validación antes de producción

El desencadenador HTTP de Power Automate configurado como **Cualquiera** fue
aceptado solamente para la prueba de concepto. Antes de habilitarlo en
producción, Seguridad TI debe autorizar expresamente ese mecanismo o el flujo
debe adoptar una autenticación corporativa aprobada. También debe definirse si
el portal exigirá inicio de sesión y qué grupos tendrán acceso.

El asistente es solo de consulta y orientación: no tiene acceso directo a bases
de datos, no ejecuta SQL, comandos ni cambios sobre registros del portal.

## Pruebas sin consumir AI Builder

Las pruebas sustituyen la llamada HTTP por mocks:

```powershell
python manage.py test Landing_principal
```

Para una validación manual autorizada, habilitar el asistente, configurar la URL
en el entorno, reiniciar el proceso de Django y enviar una consulta breve. En
las herramientas del navegador debe verse solo `/api/ai/chat/`, nunca la URL de
Power Automate.

## Desactivar o revertir

La desactivación inmediata no requiere cambiar código:

```powershell
[Environment]::SetEnvironmentVariable("AI_ASSISTANT_ENABLED", "false", "Machine")
```

Luego reiniciar el servicio de Django. El botón y panel dejan de renderizarse y
los endpoints devuelven `503`; el resto del portal continúa funcionando.

Para revertir el código, restaurar mediante Git los archivos indicados en el
commit de esta integración. No es necesario revertir migraciones: esta versión
no crea ni modifica tablas.
