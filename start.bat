@echo off
echo === Bioinformatics AutoML ===
echo.
echo Starting Backend Server...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Application starting...
echo - Backend API: http://localhost:8000
echo - Frontend UI: http://localhost:3000  
echo - API Docs: http://localhost:8000/docs
echo.
pause
