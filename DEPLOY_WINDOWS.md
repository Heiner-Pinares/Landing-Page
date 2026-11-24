# Despliegue en Windows Server

## Arquitectura objetivo

- URL para usuarios: `http://172.19.194.219:8007`
- IIS: puerto público `8007`
- Waitress: `127.0.0.1:8008`, accesible solo desde el servidor
- IIS sirve `/static/` y `/media/`; el resto se reenvía a Waitress

## 1. Requisitos del servidor

Instalar:

- Python 3.12 de 64 bits
- IIS con la característica **Static Content**
- IIS URL Rewrite
- IIS Application Request Routing (ARR), con **Enable Proxy** activado
- NSSM, disponible en el `PATH`, para registrar Waitress como servicio

## 2. Variables de entorno

Después de copiar el proyecto a `C:\inetpub\LandingClaro`, generar una clave
distinta a la del entorno anterior:

```powershell
[byte[]]$secretBytes = 1..64 | ForEach-Object { Get-Random -Maximum 256 }
$secret = [Convert]::ToBase64String($secretBytes)
[Environment]::SetEnvironmentVariable("DJANGO_SECRET_KEY", $secret, "Machine")
[Environment]::SetEnvironmentVariable("DJANGO_DEBUG", "False", "Machine")
[Environment]::SetEnvironmentVariable("DJANGO_ALLOWED_HOSTS", "172.19.194.219", "Machine")
[Environment]::SetEnvironmentVariable("DJANGO_CSRF_TRUSTED_ORIGINS", "http://172.19.194.219:8007", "Machine")
[Environment]::SetEnvironmentVariable("WAITRESS_HOST", "127.0.0.1", "Machine")
[Environment]::SetEnvironmentVariable("WAITRESS_PORT", "8008", "Machine")
```

Abrir una consola nueva después de definirlas.

La base `db.sqlite3` y la carpeta `media` están excluidas de Git porque contienen
datos de producción. Restaurarlas desde un respaldo seguro dentro de
`C:\inetpub\LandingClaro` antes de continuar. No copiar el entorno `venv` de
otro equipo; el siguiente paso crea uno nuevo.

## 3. Preparar el proyecto

Desde una consola nueva de PowerShell como administrador:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
cd C:\inetpub\LandingClaro
.\deployment\configure_server.ps1 -ProjectPath "C:\inetpub\LandingClaro"
```

El script crea `.venv`, instala las dependencias, ejecuta las migraciones,
reúne los archivos estáticos, valida Django y abre el puerto TCP 8007.

## 4. Registrar Waitress como servicio

Desde PowerShell como administrador:

```powershell
nssm install LandingClaroWaitress "C:\inetpub\LandingClaro\.venv\Scripts\python.exe" "C:\inetpub\LandingClaro\deployment\waitress_server.py"
nssm set LandingClaroWaitress AppDirectory "C:\inetpub\LandingClaro"
nssm set LandingClaroWaitress Start SERVICE_AUTO_START
nssm set LandingClaroWaitress AppStdout "C:\inetpub\LandingClaro\logs\waitress.log"
nssm set LandingClaroWaitress AppStderr "C:\inetpub\LandingClaro\logs\waitress-error.log"
New-Item -ItemType Directory -Force "C:\inetpub\LandingClaro\logs"
nssm start LandingClaroWaitress
```

La cuenta utilizada por el servicio necesita permisos de modificación sobre
`db.sqlite3`, `media` y `logs`.

## 5. Configurar IIS

1. Crear un Application Pool llamado `LandingClaro` con **No Managed Code**.
2. Crear un sitio llamado `LandingClaro`.
3. Usar como ruta física `C:\inetpub\LandingClaro`.
4. Configurar el binding HTTP con IP `172.19.194.219` y puerto `8007`.
5. Asignar el Application Pool `LandingClaro`.
6. Conceder lectura a `IIS_IUSRS` sobre `staticfiles` y `media`.
7. Confirmar en ARR que **Enable Proxy** esté activado.

El archivo `web.config` incluido publica los archivos estáticos y reenvía las
rutas de Django a Waitress.

## 6. Verificación

```powershell
Invoke-WebRequest http://127.0.0.1:8008/ -UseBasicParsing
Invoke-WebRequest http://172.19.194.219:8007/ -UseBasicParsing
Invoke-WebRequest http://172.19.194.219:8007/admin/ -UseBasicParsing
```

Comprobar también la portada, un anuncio, una imagen del carrusel, el historial
y el acceso al panel administrativo.

## Datos que deben respaldarse

Antes de cada despliegue guardar una copia de:

- `db.sqlite3`
- `media/`

Estos elementos no se publican en Git. Deben transferirse de forma separada y
no deben sustituirse durante una actualización de código sin haber confirmado
previamente el respaldo.
