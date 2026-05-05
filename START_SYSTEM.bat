@echo off
REM Script para iniciar backend e frontend no Windows

echo Iniciando sistema Meus Remédios...

REM 1. Banco de dados
echo.
echo 1. Executando schema do banco de dados...
mysql -u root < database\schema.sql

REM 2. Backend
echo.
echo 2. Abrindo backend...
cd backend
call npm install
start cmd /k "cd /d %~dp0backend && npm start"

REM 3. Frontend
echo.
echo 3. Abrindo frontend...
cd ..\frontend
call npm install
start cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Sistema iniciado. Verifique os terminais abertos para backend e frontend.
pause
