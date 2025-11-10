@echo off

REM Relaunch self in persistent console window when not marked as :run (handles double-click)
if /I not "%~1"==":run" (
    start "StudySphere Frontend" "%ComSpec%" /k "%~f0" :run
    exit /b
)
shift

chcp 65001 >nul
setlocal enabledelayedexpansion

REM Ensure working directory is this script's directory
cd /d "%~dp0"

echo ========================================
echo StudySphere Frontend Startup
echo ========================================
echo [INFO] Starting frontend development server...
echo.

REM Node.jsが利用可能かチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not available. Please install Node.js first.
    pause
    exit /b 1
)

REM npmが利用可能かチェック
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not available. Please install npm first.
    pause
    exit /b 1
)

REM 依存関係がインストールされているかチェック
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
)

REM 環境変数を設定（開発環境では127.0.0.1:5050を使用）
set REACT_APP_API_URL=http://127.0.0.1:5050
set NODE_ENV=development

echo [INFO] Starting React development server...
echo [INFO] Frontend will be available at: http://localhost:3000
echo [INFO] Backend API URL: %REACT_APP_API_URL%
echo.

REM React開発サーバーを起動
npm start

pause
