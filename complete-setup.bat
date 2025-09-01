@echo off
echo ============================================
echo   SecureEmail Platform - Complete Setup
echo ============================================
echo.
echo This script will setup your SecureEmail Platform
echo Choose the appropriate mode for your needs
echo.

echo [1/5] Checking Requirements...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo.
    echo Please install Node.js first:
    echo   1. Go to https://nodejs.org/
    echo   2. Download and install the LTS version
    echo   3. Restart this script
    echo.
    pause
    exit
)
echo SUCCESS: Node.js is available

echo.
echo [2/5] Installing Dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Backend dependencies failed
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
        echo ERROR: Frontend dependencies failed
        pause
        exit
    )
    cd ..
    echo SUCCESS: Frontend dependencies installed
) else (
    echo SUCCESS: Frontend dependencies already installed
)

echo.
echo [3/5] Choose Setup Mode...
echo.
echo Available modes:
echo [1] Development Mode
echo     - Fast startup (no build required)
echo     - Hot reload for code changes
echo     - Best for development and testing
echo.
echo [2] Production Mode  
echo     - Builds optimized code first
echo     - Better performance
echo     - Best for deployment and sharing
echo.
choice /c 12 /n /m "Select mode (1=Development, 2=Production): "

if errorlevel 2 goto PRODUCTION_MODE
if errorlevel 1 goto DEVELOPMENT_MODE

:PRODUCTION_MODE
echo.
echo [4/5] Building for Production...
echo.
echo Building backend (TypeScript to JavaScript)...
npm run build
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Backend build failed!
    echo This might be due to TypeScript compilation issues.
    echo.
    echo Falling back to Development Mode...
    timeout /t 3 >nul
    goto DEVELOPMENT_MODE
)
echo SUCCESS: Backend compiled to dist/ folder

echo Building frontend (Production bundle)...
cd frontend
npm run build
set FRONTEND_BUILD_RESULT=%errorlevel%
cd ..
if %FRONTEND_BUILD_RESULT% neq 0 (
    echo.
    echo WARNING: Frontend build failed!
    echo Falling back to Development Mode...
    timeout /t 3 >nul
    goto DEVELOPMENT_MODE
)
echo SUCCESS: Frontend built to frontend/dist/ folder

echo.
echo [5/5] Starting Production Services...
echo Starting backend server (Production)...
start "Backend (Production)" cmd /c "title Backend - Production Mode && echo ================================== && echo   SecureEmail Backend (Production) && echo   Running on: http://localhost:3000 && echo   Built files from: dist/ && echo ================================== && echo. && npm start"

timeout /t 6 >nul

echo Starting frontend server (Production)...
start "Frontend (Production)" cmd /c "title Frontend - Production Mode && echo ================================== && echo   SecureEmail Frontend (Production) && echo   Running on: http://localhost:3001 && echo   Built files from: frontend/dist/ && echo ================================== && echo. && cd frontend && npm run preview"

goto FINISH_SETUP

:DEVELOPMENT_MODE
echo.
echo [4/5] Starting Development Services...
echo.
echo Starting backend server (Development)...
start "Backend (Development)" cmd /c "title Backend - Development Mode && echo ================================== && echo   SecureEmail Backend (Development) && echo   Running on: http://localhost:3000 && echo   TypeScript compiled on-the-fly && echo ================================== && echo. && npm run dev"

timeout /t 6 >nul

echo Starting frontend server (Development)...
start "Frontend (Development)" cmd /c "title Frontend - Development Mode && echo ================================== && echo   SecureEmail Frontend (Development) && echo   Running on: http://localhost:3001 && echo   Hot reload enabled && echo ================================== && echo. && cd frontend && npm run dev"

:FINISH_SETUP
echo.
echo [5/5] Finalizing Setup...
echo Waiting for services to initialize...
timeout /t 10 >nul

echo Opening application in browser...
start http://localhost:3001

echo.
echo ============================================
echo   SUCCESS! SecureEmail Platform Ready
echo ============================================
echo.
echo Access Your Platform:
echo   Web Application: http://localhost:3001
echo   API Server:      http://localhost:3000
echo.
echo Default Login Credentials:
echo   Email:    admin@localhost
echo   Password: admin123
echo.
echo WARNING: Change default credentials in production!
echo.
echo Service Management:
echo   View Logs: Check the service windows
echo   Stop Services: Close the service windows
echo   Restart: Run this script again
echo.
echo File Locations:
if exist "dist" (
    echo   Backend Build: dist/ folder
)
if exist "frontend\dist" (
    echo   Frontend Build: frontend/dist/ folder
)
echo   Source Code: src/ and frontend/src/
echo.
echo ENJOY YOUR SECURE EMAIL PLATFORM!
echo.

pause
