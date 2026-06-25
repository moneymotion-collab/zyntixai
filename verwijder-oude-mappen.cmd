@echo off
echo Verwijder oude fitness-saas en fitai-next-app mappen...
cd /d "%~dp0"

taskkill /F /IM node.exe >nul 2>&1

if exist fitness-saas (
  echo Verwijderen fitness-saas...
  rmdir /s /q fitness-saas
)

if exist fitai-next-app (
  echo Verwijderen fitai-next-app...
  rmdir /s /q fitai-next-app
)

echo Klaar. Alleen de unified app in deze map blijft over.
pause
