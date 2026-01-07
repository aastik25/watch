@echo off
echo.
echo 🛡️  ThreatWatch Network Capture Agent
echo ======================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  This script requires Administrator privileges.
    echo    Please run Command Prompt as Administrator.
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ Error: .env file not found
    echo.
    echo Please create a .env file with:
    echo   VITE_SUPABASE_URL=your_supabase_url
    echo   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    echo.
    echo You can copy from the parent directory:
    echo   copy ..\.env .env
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo 🚀 Starting capture agent...
echo.
node index.js
