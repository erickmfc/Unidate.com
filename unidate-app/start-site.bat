@echo off
echo ========================================
echo    UNIDATE - INICIANDO SERVIDOR
echo ========================================
echo.

echo [1/3] Navegando para o diretorio correto...
cd /d "%~dp0"
echo Diretorio atual: %CD%
echo.

echo [2/3] Verificando se package.json existe...
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Certifique-se de estar no diretorio unidate-app
    pause
    exit /b 1
)
echo package.json encontrado!
echo.

echo [3/3] Iniciando servidor React...
echo.
echo ========================================
echo    SERVIDOR INICIANDO...
echo    URL: http://localhost:3000
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm start
