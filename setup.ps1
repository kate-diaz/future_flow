# Setup script for Future Flow on Windows PowerShell
# Usage: run from repo root with: powershell -ExecutionPolicy Bypass -File .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "[2/6] Ensuring .env exists..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example. Update values as needed." -ForegroundColor Yellow
    }
    else {
        @(
            "DATABASE_URL='postgresql://<user>:<password>@<host>/<db>?sslmode=require'",
            "PORT=3000",
            "NODE_ENV=development",
            "SESSION_SECRET=your-secret-key-here"
        ) | Set-Content -Path ".env" -Encoding ASCII
        Write-Host "Created placeholder .env. Please update credentials." -ForegroundColor Yellow
    }
}
else {
    Write-Host ".env already present. Skipping." -ForegroundColor Green
}

Write-Host "[3/5] (Optional) Seed the database..." -ForegroundColor Cyan
if (Test-Path "server/seed.ts") {
    $seedChoice = Read-Host "Run seed script now? (y/N)"
    if ($seedChoice -match '^(y|Y)') {
        npx tsx server/seed.ts
    }
    else {
        Write-Host "Skipping seed." -ForegroundColor Yellow
    }
} else {
    Write-Host "No seed script found; skipping." -ForegroundColor Yellow
}

Write-Host "[4/5] Building client (optional for prod)..." -ForegroundColor Cyan
$buildChoice = Read-Host "Run npm run build? (y/N)"
if ($buildChoice -match '^(y|Y)') {
    npm run build
}
else {
    Write-Host "Skipping build." -ForegroundColor Yellow
}

Write-Host "[5/5] Starting dev server..." -ForegroundColor Cyan
npm run dev
