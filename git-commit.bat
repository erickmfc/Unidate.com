@echo off
echo ========================================
echo    CONFIGURANDO GIT E FAZENDO COMMIT
echo ========================================
echo.

echo [1/6] Inicializando repositório Git...
git init
echo.

echo [2/6] Adicionando arquivos...
git add .
echo.

echo [3/6] Fazendo commit...
git commit -m "Organização do projeto: remoção de arquivos duplicados e estruturação correta"
echo.

echo [4/6] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/erickmfc/Unidate.com.git
echo.

echo [5/6] Configurando branch main...
git branch -M main
echo.

echo [6/6] Fazendo push...
echo NOTA: Se for a primeira vez, pode ser necessário fazer pull primeiro:
echo git pull origin main --allow-unrelated-histories
echo.
git push -u origin main

echo.
echo ========================================
echo    CONCLUIDO!
echo ========================================
pause

