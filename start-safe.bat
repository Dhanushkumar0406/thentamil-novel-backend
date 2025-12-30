@echo off
echo Checking if backend is already running on port 4000...

netstat -ano | findstr ":4000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo ✅ Backend already running!
    echo Port 4000 is in use
    echo ================================
    echo.
    echo To stop the backend, press Ctrl+C in the running terminal
    echo Or use: npm run stop
    echo.
    pause
    exit /b 0
) else (
    echo ✅ Port 4000 is free. Starting backend...
    echo.
    npm run start:dev
)
