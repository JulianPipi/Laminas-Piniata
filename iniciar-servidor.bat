@echo off
chcp 65001 > nul
title Laminas Piniata - Gestor de Catálogo con Guardado Automático

echo ========================================================
echo       🎂 LAMINAS PINIATA — GESTOR DE CATÁLOGO 🎂
echo ========================================================
echo.
echo [1/2] Iniciando servidor local en http://localhost:3000 ...
echo [2/2] Abriendo el panel de administración en tu navegador ...
echo.
echo TIP: Dejá esta ventana abierta mientras agregues productos.
echo Al guardar productos o carpetas, se guardarán solos en el proyecto.
echo.

timeout /t 1 /nobreak > nul
start "" "http://localhost:3000/admin.html"

node tools/admin-server.js

pause
