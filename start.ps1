# UniDate - Script para iniciar o servidor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    UNIDATE - INICIANDO SERVIDOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Navegando para o diretório correto..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\Unidate.com-main\unidate-app"
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Verificando se package.json existe..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório correto" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "package.json encontrado!" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Iniciando servidor React..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SERVIDOR INICIANDO..." -ForegroundColor Cyan
Write-Host "    URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar o servidor
npm start

