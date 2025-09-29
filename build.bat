@echo off
chcp 65001 >nul
echo StudySphere ConoHaWing 503エラー修正スクリプト
echo.

REM 環境変数設定
set REACT_APP_API_URL=https://backend.studysphere.ayatori-inc.co.jp
set NODE_ENV=production

echo API URL: %REACT_APP_API_URL%
echo.

REM ビルド実行
echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: npm run build failed
    pause
    exit /b 1
)

REM .htaccessファイルをコピー
echo Copying .htaccess file...
copy "..\production_build\configs\conohawing\.htaccess" "build\.htaccess" /Y
echo .htaccess copied

echo.
echo 503エラー修正完了！
echo.
echo 次の手順:
echo 1. buildフォルダの内容をConoHaWingのpublic_htmlにアップロード
echo 2. https://studysphere.ayatori-inc.co.jp/ でアクセステスト
echo 3. 動作確認後、必要に応じて.htaccessを段階的に機能追加
echo.
echo 現在の設定:
echo - 最小限のリライト設定のみ
echo - React Router対応
echo - エラーを避けるためシンプルな構成
echo.
echo 問題が解決したら、以下のコマンドで機能を追加できます:
echo update-conohawing.bat
echo.
pause
