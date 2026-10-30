@echo off
REM AI Resume Builder - Windows development startup

cd /d "%~dp0"

echo.
echo ========================================
echo  AI Resume Builder - Development Startup
echo ========================================
echo.

REM Check if .venv exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Check/install backend dependencies inside the local virtual environment
.venv\Scripts\python.exe -m pip show django >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    .venv\Scripts\python.exe -m pip install -r requirements.txt
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

echo.
echo ========================================
echo Servers are starting...
echo.
echo Opening two terminal windows:
echo   1. Django Backend (http://127.0.0.1:8000)
echo   2. Vite Frontend (http://localhost:8080)
echo.
echo Press Ctrl+C in each terminal to stop servers
echo ========================================
echo.

REM Start Django server
start "AI Resume Builder API" cmd /k "cd /d ""%cd%"" && .venv\Scripts\python.exe manage.py runserver"

REM Wait a moment for Django to start
timeout /t 3 /nobreak

REM Start React dev server
start "AI Resume Builder Frontend" cmd /k "cd /d ""%cd%"" && npm run dev"

echo.
echo Both servers are starting. Check the opened windows.
echo Application: http://localhost:8080
pause
