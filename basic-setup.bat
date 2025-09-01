@echo off
echo ============================================
echo   SecureEmail Platform - One-Click Setup
echo ============================================
echo.

echo [1/4] Checking Requirements...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo Please install from: https://nodejs.org/
    pause
    exit
)
echo SUCCESS: Node.js is available

echo.
echo [2/4] Installing Dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Backend install failed
        pause
        exit
    )
    echo SUCCESS: Backend dependencies installed
) else (
    echo SUCCESS: Backend dependencies already installed
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    if %errorlevel% neq 0 (
        cd ..
        echo ERROR: Frontend install failed
        pause
        exit
    )
    cd ..
    echo SUCCESS: Frontend dependencies installed
) else (
    echo SUCCESS: Frontend dependencies already installed
)

echo.
echo Choose startup mode:
echo [1] Development Mode (Fast, with hot reload)
echo [2] Production Mode (Build first, optimized)
echo.
choice /c 12 /n /m "Select mode (1 or 2): "

if errorlevel 2 goto PRODUCTION_MODE
if errorlevel 1 goto DEVELOPMENT_MODE

:PRODUCTION_MODE
echo.
echo [3/4] Building for Production...
echo Building backend (TypeScript compilation)...
echo This may take up to 60 seconds...

REM Create timeout protection
(
    echo Building with timeout protection...
    timeout /t 60 /nobreak >nul & taskkill /f /im tsc.exe /im node.exe >nul 2>&1
) | start /min cmd /c

npm run build
set BUILD_RESULT=%errorlevel%

REM Kill timeout protection
taskkill /f /im timeout.exe >nul 2>&1

if %BUILD_RESULT% neq 0 (
    echo WARNING: Backend build had issues, switching to dev mode...
    timeout /t 2 >nul
    goto DEVELOPMENT_MODE
)
echo SUCCESS: Backend built successfully

echo Building frontend (Production bundle)...
cd frontend
npm run build
set FRONTEND_BUILD_RESULT=%errorlevel%
cd ..
if %FRONTEND_BUILD_RESULT% neq 0 (
    echo WARNING: Frontend build had issues, switching to dev mode...
    timeout /t 2 >nul
    goto DEVELOPMENT_MODE
)
echo SUCCESS: Frontend built successfully

echo Starting production servers...
start "SecureEmail Backend" cmd /c "title Backend Server (Production) && echo Backend Production Server && echo Running on http://localhost:3000 && echo Using compiled files from dist/ && echo. && npm start"
goto START_FRONTEND

:DEVELOPMENT_MODE
echo.
echo [3/4] Starting Development Servers...
echo Starting backend server (Development)...
start "SecureEmail Backend" cmd /c "title Backend Server (Development) && echo Backend starting on http://localhost:3000 && npm run dev"

:START_FRONTEND
echo Waiting for backend...
timeout /t 6 >nul

echo Starting frontend server...
start "SecureEmail Frontend" cmd /c "title Frontend Server && echo Frontend starting on http://localhost:3001 && cd frontend && npm run dev"

echo Waiting for frontend...
timeout /t 8 >nul

echo.
echo [4/4] Opening Application...
echo Opening browser...
start http://localhost:3001

echo.
echo ============================================
echo   SUCCESS! SecureEmail Platform Running
echo ============================================
echo.
echo URLs:
echo   Application: http://localhost:3001
echo   API Server:  http://localhost:3000
echo.
echo Login Credentials:
echo   Email:    admin@localhost
echo   Password: admin123
echo.
echo Service Windows:
echo   - "SecureEmail Backend" - Backend logs
echo   - "SecureEmail Frontend" - Frontend logs
echo.
echo To Stop: Close the service windows above
echo.
echo ENJOY YOUR SECURE EMAIL PLATFORM!
echo.
pause
