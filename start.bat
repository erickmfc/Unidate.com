@echo off
echo ========================================
echo    UNIDATE - INICIANDO BANCO E SERVIDORES
echo ========================================
echo.

echo [1/3] Iniciando backend SQLite Express em segundo plano...
start cmd /k "echo INICIANDO BACKEND SQLITE... && cd /d "%~dp0Unidate.com-main\unidate-server" && npm start"
echo.

echo [2/3] Navegando para o diretorio do frontend...
cd /d "%~dp0Unidate.com-main\unidate-app"
echo.

echo [3/3] Iniciando servidor React...
echo ========================================
echo    URL do Frontend: http://localhost:3000
echo    URL do Backend (SQLite): http://localhost:3001
echo ========================================
echo.

npm start

