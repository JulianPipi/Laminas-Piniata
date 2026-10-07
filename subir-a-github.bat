@echo off
title Laminas Piniata - Subir cambios a GitHub
cls

echo ========================================================
echo       SUBIENDO CAMBIOS A GITHUB - LAMINAS PINIATA
echo ========================================================
echo.
echo [1/3] Preparando fotos y archivos modificados...
git add -A

echo.
echo [2/3] Registrando cambios...
set "commit_msg="
set /p "commit_msg=Escriba que cambio (o presione ENTER directo): "

if "%commit_msg%"=="" set "commit_msg=actualizacion de imagenes y catalogo"

git commit -m "%commit_msg%"

echo.
echo [3/3] Subiendo a GitHub...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  LISTO: Los cambios se subieron correctamente a GitHub!
    echo  En 1 o 2 minutos estaran visibles en tu pagina web.
    echo ========================================================
) else (
    echo ========================================================
    echo  ATENCION: Hubo un problema al subir a GitHub.
    echo  Revisa la conexion a internet o el mensaje de arriba.
    echo ========================================================
)
echo.
pause
