@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM TrustNest Mesh Chat — Local WiFi Server Launcher (Windows)
REM Double-click this .bat file to start
REM ─────────────────────────────────────────────────────────────────────────────

cd /d "%~dp0.."

echo.
echo  ████████████████████████████████████████████████████
echo  ██  TrustNest MESH CHAT — Local WiFi Server       ██
echo  ████████████████████████████████████████████████████
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
  set LOCAL_IP=%%a
  goto :gotip
)
:gotip
set LOCAL_IP=%LOCAL_IP: =%

set PORT=3333

echo  Share this URL with everyone on your WiFi network:
echo.
echo     http://%LOCAL_IP%:%PORT%/mesh-chat
echo.
echo  Steps for iPhone users:
echo   1. Connect to the same WiFi as this laptop
echo   2. Open Safari
echo   3. Type the URL above
echo   4. Enter your name and start chatting
echo.
echo  Starting server... (keep this window open)
echo.

set PORT=%PORT%
npm run dev

pause
