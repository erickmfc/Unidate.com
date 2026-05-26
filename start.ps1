# UniDate - Script para iniciar os servidores
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    UNIDATE - INICIANDO SERVIDORES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Iniciando backend SQLite Express..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList "-NoExit -Command & { Set-Location '$scriptPath\Unidate.com-main\unidate-server'; npm start }"
Write-Host ""

Write-Host "[2/3] Navegando para o diretório do frontend..." -ForegroundColor Yellow
Set-Location "$scriptPath\Unidate.com-main\unidate-app"
Write-Host ""

Write-Host "[3/3] Iniciando servidor React..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    URL Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "    URL Backend (SQLite): http://localhost:3001" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm start

