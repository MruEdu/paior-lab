@echo off
chcp 65001 >nul
echo ========================================
echo   PAIOR(파이오르) 진단 플랫폼 미리보기
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [1/2] 패키지 설치 중... (--ignore-scripts로 네이티브 빌드 생략)
    call npm install --ignore-scripts
    if errorlevel 1 (
        echo 설치 실패. npm install을 직접 실행해 보세요.
        pause
        exit /b 1
    )
    echo.
)

echo [2/2] 개발 서버 실행 중...
echo.
echo   브라우저에서 http://localhost:5173 접속
echo   (자동으로 열리지 않으면 위 주소를 직접 입력하세요)
echo.
echo   종료하려면 Ctrl+C
echo ========================================

call npm run dev
