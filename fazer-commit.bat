@echo off
chcp 65001 >nul
echo ========================================
echo    UNIDATE - COMMIT E PUSH PARA GITHUB
echo ========================================
echo.

echo [1/7] Verificando se Git está instalado...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Git não está instalado ou não está no PATH!
    pause
    exit /b 1
)
echo Git encontrado!
echo.

echo [2/7] Inicializando repositório Git...
if exist .git (
    echo Repositório Git já existe.
) else (
    git init
    if errorlevel 1 (
        echo ERRO ao inicializar repositório Git!
        pause
        exit /b 1
    )
    echo Repositório Git inicializado com sucesso!
)
echo.

echo [3/7] Adicionando arquivos ao staging...
git add .
if errorlevel 1 (
    echo ERRO ao adicionar arquivos!
    pause
    exit /b 1
)
echo Arquivos adicionados!
echo.

echo [4/7] Verificando se há mudanças para commitar...
git diff --cached --quiet
if errorlevel 1 (
    echo Fazendo commit...
    git commit -m "Organização do projeto: remoção de arquivos duplicados e estruturação correta"
    if errorlevel 1 (
        echo ERRO ao fazer commit!
        pause
        exit /b 1
    )
    echo Commit realizado com sucesso!
) else (
    echo Nenhuma mudança para commitar.
)
echo.

echo [5/7] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/erickmfc/Unidate.com.git
if errorlevel 1 (
    echo ERRO ao configurar remote!
    pause
    exit /b 1
)
echo Remote configurado!
echo.

echo [6/7] Configurando branch main...
git branch -M main 2>nul
echo Branch configurada!
echo.

echo [7/7] Fazendo push para o GitHub...
echo.
echo ATENÇÃO: Você pode precisar fazer autenticação!
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo ========================================
    echo    ERRO NO PUSH
    echo ========================================
    echo.
    echo Possíveis causas:
    echo 1. Repositório remoto já existe com conteúdo diferente
    echo 2. Necessário fazer autenticação no GitHub
    echo 3. Necessário fazer pull primeiro
    echo.
    echo Tentando fazer pull primeiro...
    git pull origin main --allow-unrelated-histories --no-edit
    if errorlevel 1 (
        echo ERRO ao fazer pull. Tente manualmente:
        echo   git pull origin main --allow-unrelated-histories
        echo   git push -u origin main
    ) else (
        echo Pull realizado! Tentando push novamente...
        git push -u origin main
    )
)
echo.

echo ========================================
echo    PROCESSO CONCLUÍDO!
echo ========================================
echo.
pause

