"""Production WSGI entry point for the Windows service."""

import os

from waitress import serve

from Landing_claro.wsgi import application


if __name__ == '__main__':
    serve(
        application,
        host=os.getenv('WAITRESS_HOST', '127.0.0.1'),
        port=int(os.getenv('WAITRESS_PORT', '8008')),
        threads=int(os.getenv('WAITRESS_THREADS', '8')),
        channel_timeout=int(os.getenv('WAITRESS_CHANNEL_TIMEOUT', '120')),
    )
