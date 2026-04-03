# Build script for Bioinformatics AutoML Desktop Application
# Run this script to build the complete desktop executable

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Bioinformatics AutoML Studio - Builder" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# Step 1: Build Backend with PyInstaller
Write-Host "[1/4] Building Backend with PyInstaller..." -ForegroundColor Yellow
Set-Location $backendDir

# Install PyInstaller if not present
pip install pyinstaller --quiet

# Build backend
pyinstaller backend.spec --clean --noconfirm

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Build React Frontend
Write-Host "[2/4] Building React Frontend..." -ForegroundColor Yellow
Set-Location $frontendDir

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Package with Electron Builder
Write-Host "[3/4] Packaging with Electron Builder..." -ForegroundColor Yellow

npm run package

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Electron packaging failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Electron package created successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Done
Write-Host "[4/4] Build Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Output Location:" -ForegroundColor White
Write-Host "  $frontendDir\dist" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Look for 'Bioinformatics AutoML Studio Setup.exe' in the dist folder"
Write-Host ""

Set-Location $rootDir
