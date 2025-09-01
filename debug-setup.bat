@echo off
title SecureEmail Debug Setup
echo.
echo SecureEmail Platform - Debug Setup
echo ==================================
echo.

echo DEBUG: Starting script...

REM Check if running from correct directory
echo DEBUG: Checking directory...
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory
    pause
    exit /b 1
)
echo DEBUG: Directory check passed

echo.
echo DEBUG: Starting Step 1...

REM Check Node.js
echo DEBUG: Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo SUCCESS: Node.js: %NODE_VERSION%

echo DEBUG: Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo SUCCESS: npm: %NPM_VERSION%

echo.
echo DEBUG: Step 1 completed, starting Step 2...

REM Check dependencies
echo DEBUG: Checking backend dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Backend dependencies failed
        pause
        exit /b 1
    )
    echo SUCCESS: Backend dependencies installed
) else (
    echo SUCCESS: Backend dependencies already exist
)

echo DEBUG: Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    set INSTALL_RESULT=%errorlevel%
    cd ..
    if %INSTALL_RESULT% neq 0 (
        echo ERROR: Frontend dependencies failed
        pause
        exit /b 1
    )
    echo SUCCESS: Frontend dependencies installed
) else (
    echo SUCCESS: Frontend dependencies already exist
)

echo.
echo DEBUG: Step 2 completed, starting services...

echo DEBUG: Checking ports...
netstat -an | find "3000" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 in use
)

netstat -an | find "3001" | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 in use
)

echo.
echo DEBUG: Starting backend...
start "Backend" cmd /c "title Backend && npm run dev"

echo DEBUG: Waiting for backend...
timeout /t 5 /nobreak >nul

echo DEBUG: Starting frontend...
start "Frontend" cmd /c "title Frontend && cd frontend && npm run dev"

echo DEBUG: Waiting for frontend...
timeout /t 5 /nobreak >nul

echo.
echo DEBUG: Opening browser...
start http://localhost:3001

echo.
echo SUCCESS: Setup completed!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo Login: admin@localhost / admin123
echo.

pause
