@echo off
REM Batch script to kill all Node.js servers and restart the dev server

echo.
echo ========================================
echo Killing all Node.js processes...
echo ========================================
echo.

REM Kill all node processes
taskkill /F /IM node.exe

echo.
echo ========================================
echo Waiting 5 seconds...
echo ========================================
echo.

REM Wait 5 seconds
timeout /t 5 /nobreak

echo.
echo ========================================
echo Restarting dev server...
echo ========================================
echo.

REM Start the dev server
npm run dev

pause
