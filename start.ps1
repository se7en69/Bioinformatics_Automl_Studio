# Bioinformatics AutoML - Startup Script
# Run this script to start both backend and frontend

Write-Host "=== Bioinformatics AutoML ===" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d `"$backendPath`" && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting React Frontend on http://localhost:3000..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d `"$frontendPath`" && npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Application starting..." -ForegroundColor Green
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "- Frontend UI: http://localhost:3000" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
