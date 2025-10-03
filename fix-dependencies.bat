@echo off
chcp 65001 >nul
echo Fixing StudySphere Dependencies
echo.

REM 現在のnode_modulesをクリア
echo Clearing node_modules...
if exist "node_modules" rmdir /S /Q "node_modules"

REM package-lock.jsonを削除
echo Removing package-lock.json...
if exist "package-lock.json" del "package-lock.json"

REM 依存関係を再インストール
echo Reinstalling dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

REM 重要な依存関係を確認
echo Verifying critical dependencies...
node -e "try { require('tailwindcss'); console.log('✓ tailwindcss'); } catch(e) { console.log('✗ tailwindcss missing'); process.exit(1); }"
if %errorlevel% neq 0 (
    echo Installing tailwindcss manually...
    call npm install tailwindcss@latest
)

node -e "try { require('postcss'); console.log('✓ postcss'); } catch(e) { console.log('✗ postcss missing'); process.exit(1); }"
if %errorlevel% neq 0 (
    echo Installing postcss manually...
    call npm install postcss@latest
)

node -e "try { require('autoprefixer'); console.log('✓ autoprefixer'); } catch(e) { console.log('✗ autoprefixer missing'); process.exit(1); }"
if %errorlevel% neq 0 (
    echo Installing autoprefixer manually...
    call npm install autoprefixer@latest
)

echo.
echo Dependencies fixed! You can now run build-conohawing.bat
echo.
pause
