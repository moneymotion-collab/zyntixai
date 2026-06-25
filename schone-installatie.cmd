@echo off
echo ========================================
echo Schone npm install - FITAI (unified app)
echo ========================================
cd /d "%~dp0 

taskkill /F /IM node.exe
taskkill /F /IM npm.exe
taskkill /F /IM node.exe
taskkill /F /IM npm.exe

echo Stop node processen...
taskkill /F /IM node.exe >nul 2>&1

echo Verwijder kapotte node_modules (kan 5-10 min duren)...
if exist node_modules rmdir /s /q node_modules

echo Verwijder package-lock...
if exist package-lock.json del /f package-lock.json

echo Installeer opnieuw...
call npm install --no-audit --no-fund

if exist node_modules\next\package.json (
  echo.
  echo GELUKT - installatie compleet
  echo Start nu met: npm run dev
  echo Open: http://localhost:3000
) else (
  echo.
  echo MISLUKT - node_modules is nog niet compleet
)

pause
