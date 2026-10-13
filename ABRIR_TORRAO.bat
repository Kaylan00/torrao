@echo off
rem Abre o Torrao no PC numa janela do tamanho de um celular.
rem O progresso fica salvo no navegador (separado do celular).
cd /d "%~dp0"

rem liga o servidorzinho local, se ainda nao estiver ligado
powershell -NoProfile -Command "if (-not (Test-NetConnection localhost -Port 8620 -InformationLevel Quiet -WarningAction SilentlyContinue)) { exit 1 }" >nul 2>&1
if errorlevel 1 start "Torrao (servidor - pode minimizar)" /min python tools\servidor.py 8620
timeout /t 2 /nobreak >nul

rem janela de app (sem barra do navegador), tamanho de celular
start "" msedge --app=http://localhost:8620 --window-size=420,880
