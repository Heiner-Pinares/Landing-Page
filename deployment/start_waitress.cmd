@echo off
setlocal

set "PROJECT_DIR=%~dp0.."
set "PYTHON_EXE=%PROJECT_DIR%\.venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
    echo ERROR: No se encontro el entorno virtual en "%PROJECT_DIR%\.venv".
    exit /b 1
)

cd /d "%PROJECT_DIR%"
"%PYTHON_EXE%" "%PROJECT_DIR%\deployment\waitress_server.py"
