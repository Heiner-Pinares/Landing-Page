param(
    [string]$ProjectPath = "C:\inetpub\LandingClaro"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path (Join-Path $ProjectPath "manage.py"))) {
    throw "No se encontro manage.py en $ProjectPath"
}

Set-Location $ProjectPath

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    py -3.12 -m venv .venv
}

& ".venv\Scripts\python.exe" -m pip install --upgrade pip
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt
& ".venv\Scripts\python.exe" manage.py migrate
& ".venv\Scripts\python.exe" manage.py collectstatic --noinput
& ".venv\Scripts\python.exe" manage.py check --deploy

if (-not (Get-NetFirewallRule -DisplayName "Landing Claro HTTP 8007" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule `
        -DisplayName "Landing Claro HTTP 8007" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 8007 `
        -Action Allow
}

Write-Host "Preparacion completada. Continue con IIS y el servicio Waitress segun DEPLOY_WINDOWS.md."
