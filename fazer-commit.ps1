# UniDate - Script para fazer commit e push
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    UNIDATE - COMMIT E PUSH PARA GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
Write-Host "[1/7] Verificando se Git está instalado..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Git não está instalado ou não está no PATH!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host ""

# Inicializar repositório
Write-Host "[2/7] Inicializando repositório Git..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "Repositório Git já existe." -ForegroundColor Green
} else {
    try {
        git init | Out-Null
        Write-Host "Repositório Git inicializado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "ERRO ao inicializar repositório Git!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
Write-Host ""

# Adicionar arquivos
Write-Host "[3/7] Adicionando arquivos ao staging..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "Arquivos adicionados!" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao adicionar arquivos!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host ""

# Verificar mudanças
Write-Host "[4/7] Verificando se há mudanças para commitar..." -ForegroundColor Yellow
$hasChanges = git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fazendo commit..." -ForegroundColor Yellow
    try {
        git commit -m "Organização do projeto: remoção de arquivos duplicados e estruturação correta"
        Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "ERRO ao fazer commit!" -ForegroundColor Red
        Read-Host "Pressione Enter para sair"
        exit 1
    }
} else {
    Write-Host "Nenhuma mudança para commitar." -ForegroundColor Yellow
}
Write-Host ""

# Configurar remote
Write-Host "[5/7] Configurando remote..." -ForegroundColor Yellow
try {
    git remote remove origin 2>$null
    git remote add origin https://github.com/erickmfc/Unidate.com.git
    Write-Host "Remote configurado!" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao configurar remote!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host ""

# Configurar branch
Write-Host "[6/7] Configurando branch main..." -ForegroundColor Yellow
git branch -M main 2>$null
Write-Host "Branch configurada!" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "[7/7] Fazendo push para o GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "ATENÇÃO: Você pode precisar fazer autenticação!" -ForegroundColor Cyan
Write-Host ""
try {
    git push -u origin main
    Write-Host ""
    Write-Host "Push realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "    ERRO NO PUSH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "1. Repositório remoto já existe com conteúdo diferente" -ForegroundColor Yellow
    Write-Host "2. Necessário fazer autenticação no GitHub" -ForegroundColor Yellow
    Write-Host "3. Necessário fazer pull primeiro" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tentando fazer pull primeiro..." -ForegroundColor Yellow
    try {
        git pull origin main --allow-unrelated-histories --no-edit
        Write-Host "Pull realizado! Tentando push novamente..." -ForegroundColor Green
        git push -u origin main
    } catch {
        Write-Host "ERRO ao fazer pull. Tente manualmente:" -ForegroundColor Red
        Write-Host "  git pull origin main --allow-unrelated-histories" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    PROCESSO CONCLUÍDO!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

