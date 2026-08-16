@echo off
REM Builds CustomYTools.zip containing only the files needed to load/publish the extension.
REM Includes: /scripts, /src (except src/css/app.css), config.json, manifest.json, popup.html, version.json

setlocal

set "ROOT=%~dp0"
set "ZIP_NAME=CustomYTools.zip"
set "ZIP_PATH=%ROOT%%ZIP_NAME%"
set "STAGING_DIR=%TEMP%\CustomYTools_build_%RANDOM%"

if exist "%ZIP_PATH%" del /f /q "%ZIP_PATH%"

mkdir "%STAGING_DIR%"

xcopy /e /i /q "%ROOT%scripts" "%STAGING_DIR%\scripts" >nul
xcopy /e /i /q "%ROOT%src" "%STAGING_DIR%\src" >nul

if exist "%STAGING_DIR%\src\css\app.css" del /f /q "%STAGING_DIR%\src\css\app.css"

copy /y "%ROOT%config.json" "%STAGING_DIR%\" >nul
copy /y "%ROOT%manifest.json" "%STAGING_DIR%\" >nul
copy /y "%ROOT%popup.html" "%STAGING_DIR%\" >nul
copy /y "%ROOT%version.json" "%STAGING_DIR%\" >nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%STAGING_DIR%\*' -DestinationPath '%ZIP_PATH%' -CompressionLevel Optimal"

rmdir /s /q "%STAGING_DIR%"

echo Built %ZIP_NAME%

endlocal
