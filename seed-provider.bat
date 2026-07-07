@echo off
echo ========================================
echo Service Provider Seed Data Setup
echo ========================================
echo.

REM Check if DATABASE_URL is set in .env
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file with EXPO_PUBLIC_NEON_DATABASE_URL
    pause
    exit /b 1
)

REM Extract database URL from .env
for /f "tokens=2 delims==" %%a in ('findstr /r "EXPO_PUBLIC_NEON_DATABASE_URL" .env') do set DATABASE_URL=%%a

if "%DATABASE_URL%"=="" (
    echo ERROR: EXPO_PUBLIC_NEON_DATABASE_URL not found in .env file!
    pause
    exit /b 1
)

echo Database URL found!
echo.

REM Run the seed migration
echo Running service provider seed data...
echo.

psql "%DATABASE_URL%" -f supabase\migrations\20260620000000_010_service_provider_complete_seed.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seed data failed to apply!
    echo.
    echo Make sure:
    echo 1. PostgreSQL client (psql) is installed
    echo 2. Your database connection is working
    echo 3. Previous migrations have been run
    pause
    exit /b 1
)

echo.
echo ========================================
echo Seed Data Applied Successfully!
echo ========================================
echo.
echo You can now log in with:
echo   Email: provider@test.com
echo   Password: password123
echo.
echo The service provider workspace now has:
echo   - Complete profile with skills
echo   - 3 Pending job requests
echo   - 2 Active jobs
echo   - 3 Completed jobs with reviews
echo   - Notifications
echo.
pause
