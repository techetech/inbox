@echo off
title SecureEmail Platform - Server Manager
echo 🛑 SecureEmail Platform - Server Manager
echo =====================================

echo.
echo Current server status:
echo.

REM Check if ports are in use
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔴 Backend server appears to be running on port 3000
    set BACKEND_RUNNING=1
) else (
    echo ✅ Port 3000 is free ^(Backend not running^)
    set BACKEND_RUNNING=0
)

netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo 🔴 Frontend server appears to be running on port 3001
    set FRONTEND_RUNNING=1
) else (
    echo ✅ Port 3001 is free ^(Frontend not running^)
    set FRONTEND_RUNNING=0
)

echo.

if %BACKEND_RUNNING%==0 if %FRONTEND_RUNNING%==0 (
    echo 🎉 No servers appear to be running!
    echo.
    pause
    exit /b 0
)

echo 🛑 Server Management Options:
echo.
echo [1] Kill all Node.js processes ^(stops both servers^)
echo [2] Kill backend only ^(port 3000^)
echo [3] Kill frontend only ^(port 3001^)
echo [4] Show detailed process info
echo [5] Exit without changes
echo.
choice /c 12345 /n /m "Select option (1/2/3/4/5): "

if errorlevel 5 goto EXIT
if errorlevel 4 goto SHOW_PROCESSES
if errorlevel 3 goto KILL_FRONTEND
if errorlevel 2 goto KILL_BACKEND
if errorlevel 1 goto KILL_ALL

:KILL_ALL
echo.
echo 🛑 Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 >nul
echo ✅ All Node.js processes terminated
goto CHECK_FINAL

:KILL_BACKEND
echo.
echo 🛑 Killing backend server (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 2 >nul
echo ✅ Backend server processes terminated
goto CHECK_FINAL

:KILL_FRONTEND
echo.
echo 🛑 Killing frontend server (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
timeout /t 2 >nul
echo ✅ Frontend server processes terminated
goto CHECK_FINAL

:SHOW_PROCESSES
echo.
echo 📊 Current Node.js processes:
tasklist | findstr node.exe
echo.
echo 🌐 Network connections:
netstat -ano | findstr -E ":300[01]"
echo.
pause
goto EXIT

:CHECK_FINAL
echo.
echo 🔍 Final status check:
timeout /t 1 >nul

netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 still in use
) else (
    echo ✅ Port 3000 is now free
)

netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3001 still in use
) else (
    echo ✅ Port 3001 is now free
)

echo.
echo 🎉 Server shutdown complete!

:EXIT
echo.
pause
