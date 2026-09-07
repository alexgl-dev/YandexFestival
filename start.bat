@echo off
rem ============================================================
rem  YandexSuperHot - kiosk launcher (see KIOSK.md, in Russian)
rem  Installs deps and builds on first run, starts a local
rem  server and opens the browser in kiosk mode.
rem  Needs Node 22 LTS. Internet is only required for "npm ci".
rem  Messages are ASCII on purpose: cmd.exe garbles UTF-8.
rem ============================================================
setlocal
cd /d "%~dp0"

rem Server port. If 80 is taken (IIS, Skype, etc.) - set 8080 here.
set PORT=80
set URL=http://localhost:%PORT%/

rem --- Node present? ---------------------------------------------------
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found. Install Node 22 LTS from nodejs.org and run again.
  goto :fail
)

rem --- Dependencies ----------------------------------------------------
if not exist "node_modules\" (
  echo [1/3] Installing dependencies, takes a couple of minutes...
  call npm ci
  if errorlevel 1 goto :fail
)

rem --- Build -----------------------------------------------------------
rem After "git pull" rebuild by hand: npm run build
if not exist "dist\index.html" (
  echo [2/3] Building the app...
  call npm run build
  if errorlevel 1 goto :fail
)

rem --- Server ----------------------------------------------------------
echo [3/3] Starting server on %URL%
start "YandexFestival server" /min cmd /c "npm run preview -- --host --port %PORT%"

rem --- Wait until the server answers (up to 30 seconds) ----------------
set /a tries=0
:wait
set /a tries+=1
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri '%URL%' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 goto :ready
if %tries% geq 30 (
  echo Server did not start in 30 seconds. Check the "YandexFestival server" window.
  goto :fail
)
timeout /t 1 >nul
goto :wait

rem --- Browser in kiosk mode -------------------------------------------
:ready
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

rem Separate profile: keeps the staff profile untouched and the video cache between runs.
if defined CHROME (
  start "" "%CHROME%" --kiosk --user-data-dir="%~dp0.kiosk-profile" --noerrdialogs --disable-infobars --disable-session-crashed-bubble --disable-features=TranslateUI --autoplay-policy=no-user-gesture-required --check-for-update-interval=31536000 "%URL%"
) else (
  echo Chrome not found, opening Edge.
  start "" msedge --kiosk --edge-kiosk-type=fullscreen --no-first-run "%URL%"
)
exit /b 0

:fail
echo.
echo Startup failed. See the messages above.
pause
exit /b 1
