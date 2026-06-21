@echo off
echo Clearing Metro bundler cache and restarting...
echo.

REM Kill any existing Metro processes on port 8081
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :8081') DO TaskKill /F /PID %%P 2>nul

echo Waiting for port to be released...
timeout /t 2 /nobreak >nul

echo Starting Expo with cleared cache...
npx expo start --clear --web
