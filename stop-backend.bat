@echo off
echo Stopping backend on port 4000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') do (
    echo Found process: %%a
    taskkill /PID %%a /F
    echo ✅ Backend stopped successfully!
    goto :done
)

echo ⚠️ No backend process found on port 4000
:done
pause
