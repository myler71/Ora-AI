@echo off
title Ora AI — Clinical Workspace Launcher
echo ===================================================
echo           Starting Ora AI Dental Platform
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"

echo [1/3] Starting AI Service (Port 8000)...
start "Ora AI — Python AI Microservice" cmd /k "cd /d ""%ROOT_DIR%ai-service"" && python api.py"

echo [2/3] Starting Backend API (Port 5000)...
start "Ora AI — Express Backend API" cmd /k "cd /d ""%ROOT_DIR%back"" && npm run dev"

echo [3/3] Starting Frontend App (Port 5173)...
start "Ora AI — React Frontend" cmd /k "cd /d ""%ROOT_DIR%front"" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening Ora AI in default browser...
start http://localhost:5173

echo ===================================================
echo All services launched!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:5000
echo - AI Service: http://localhost:8000
echo ===================================================
pause
