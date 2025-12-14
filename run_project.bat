@echo off
echo ==========================================
echo   LearnPath AI - Automated Startup Script
echo ==========================================

cd /d "%~dp0"

echo [1/3] Verifying Python Environment...
if not exist "backend\venv_new" (
    echo Creating virtual environment...
    python -m venv backend\venv_new
)

echo [2/3] Running Project Setup ^(Models ^& Data^)...
call backend\venv_new\Scripts\python backend\setup_full.py
if %errorlevel% neq 0 (
    echo Setup failed!
    pause
    exit /b %errorlevel%
)

echo [3/3] Starting Application...
cd "pathway learning ml model"
echo Installing dependencies (if needed)...
call npm install
echo Starting Development Server...
npm run dev

pause
