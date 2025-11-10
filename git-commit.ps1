# Script para fazer commit e push
Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
git init

Write-Host "`nAdicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host "`nFazendo commit..." -ForegroundColor Yellow
git commit -m "Organização do projeto: remoção de arquivos duplicados e estruturação correta"

Write-Host "`nConfigurando remote..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/erickmfc/Unidate.com.git

Write-Host "`nVerificando branch..." -ForegroundColor Yellow
git branch -M main

Write-Host "`nFazendo push para o repositório..." -ForegroundColor Yellow
Write-Host "NOTA: Se for a primeira vez, você pode precisar fazer: git push -u origin main" -ForegroundColor Cyan
git push -u origin main

Write-Host "`nConcluído!" -ForegroundColor Green

