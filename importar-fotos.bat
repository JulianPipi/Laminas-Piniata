@echo off
chcp 65001 > nul
title Importador Masivo de Carpetas — Laminas Piniata

echo ======================================================
echo  📁 IMPORTADOR MASIVO DE CARPETAS - LAMINAS PINIATA
echo ======================================================
echo.

if "%~1"=="" (
    node tools/importar-carpetas.js
) else (
    node tools/importar-carpetas.js "%~1"
)

echo.
pause
