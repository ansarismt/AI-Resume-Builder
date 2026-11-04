@echo off
REM AI Resume Builder - Windows development startup

cd /d "%~dp0"

echo.
echo ========================================
echo  AI Resume Builder - Development Startup
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python was not found. Install Python 3.11 or newer and add it to PATH.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js was not found. Install Node.js 20.19+ or 22.12+ and add it to PATH.
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm was not found. Reinstall Node.js with npm included.
    pause
    exit /b 1
)

if not exist ".env" (
    if not exist ".env.example" (
        echo ERROR: .env.example was not found; cannot create the local environment file.
        pause
        exit /b 1
    )
    copy /Y ".env.example" ".env" >nul
    if errorlevel 1 (
        echo ERROR: Could not create .env from .env.example.
        pause
        exit /b 1
    )
    echo Created .env from .env.example.
)

REM Create the virtual environment when it is missing or incomplete.
if not exist ".venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Could not create the Python virtual environment.
        pause
        exit /b 1
    )
)

REM Reinstall backend dependencies when the requirements file changes.
for /f %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 requirements.txt).Hash"') do set "REQ_HASH=%%H"
set "INSTALL_PYTHON=0"
if not exist ".venv\.req.hash" set "INSTALL_PYTHON=1"
if exist ".venv\.req.hash" (
    for /f %%H in (.venv\.req.hash) do if not "%%H"=="%REQ_HASH%" set "INSTALL_PYTHON=1"
)
if "%INSTALL_PYTHON%"=="1" (
    echo Installing Python dependencies...
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Python dependency installation failed.
        pause
        exit /b 1
    )
    >.venv\.req.hash echo %REQ_HASH%
)

REM Reinstall Node dependencies when the lock file changes.
for /f %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 package-lock.json).Hash"') do set "NODE_HASH=%%H"
set "INSTALL_NODE=0"
if not exist "node_modules\.lock.hash" set "INSTALL_NODE=1"
if exist "node_modules\.lock.hash" (
    for /f %%H in (node_modules\.lock.hash) do if not "%%H"=="%NODE_HASH%" set "INSTALL_NODE=1"
)
if "%INSTALL_NODE%"=="1" (
    echo Installing Node dependencies...
    call npm ci
    if errorlevel 1 (
        echo ERROR: Node dependency installation failed.
        pause
        exit /b 1
    )
    >node_modules\.lock.hash echo %NODE_HASH%
)

echo Applying database migrations...
.venv\Scripts\python.exe manage.py migrate
if errorlevel 1 (
    echo ERROR: Django migrations failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Servers are starting...
echo.
echo Opening two terminal windows:
echo   1. Django Backend (http://127.0.0.1:8000)
echo   2. Vite Frontend (http://127.0.0.1:8080)
echo.
echo Press Ctrl+C in each terminal to stop servers
echo ========================================
echo.

REM Start Django server
start "AI Resume Builder API" cmd /k "cd /d ""%cd%"" && .venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

REM Wait a moment for Django to start
timeout /t 3 /nobreak

REM Start React dev server
start "AI Resume Builder Frontend" cmd /k "cd /d ""%cd%"" && npm run dev"

echo.
echo Both servers are starting. Check the opened windows.
echo Application: http://127.0.0.1:8080
pause
