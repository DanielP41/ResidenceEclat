# ==============================================
# Residencia Eclat - Auto-Restart Services
# Mantiene backend y frontend siempre activos
# ==============================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

$backendJob = $null
$frontendJob = $null

function Start-Backend {
    Write-Host "[BACKEND] Iniciando..." -ForegroundColor Cyan
    return Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        npm run dev
    } -ArgumentList $BACKEND
}

function Start-Frontend {
    Write-Host "[FRONTEND] Iniciando..." -ForegroundColor Magenta
    return Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        $env:NODE_OPTIONS = '--max-old-space-size=4096'
        npx next dev
    } -ArgumentList $FRONTEND
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "   ECLAT - Monitor de Servicios Activo" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "   Presiona CTRL+C para detener todo." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

# Matar cualquier proceso node previo
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

$backendJob  = Start-Backend
$frontendJob = Start-Frontend

# Loop de monitoreo
while ($true) {
    Start-Sleep -Seconds 15

    # Verificar backend
    if ($backendJob.State -ne 'Running') {
        Write-Host "[BACKEND] Caido! Reiniciando..." -ForegroundColor Red
        Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
        $backendJob = Start-Backend
    }

    # Verificar frontend
    if ($frontendJob.State -ne 'Running') {
        Write-Host "[FRONTEND] Caido! Reiniciando..." -ForegroundColor Red
        Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
        $frontendJob = Start-Frontend
    }

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Servicios OK - Backend: $($backendJob.State) | Frontend: $($frontendJob.State)" -ForegroundColor DarkGray
}
