@echo off
chcp 65001 >nul
echo PAIOR 구글 시트 헤더 생성
echo.
node server/setHeaders.js
echo.
pause
