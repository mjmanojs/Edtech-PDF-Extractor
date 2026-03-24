@echo off
title Install EdTech PDF Extractor Extension
color 0B

echo ==============================================================
echo       EdTech PDF Extractor - Quick Install Helper
echo ==============================================================
echo.
echo Modern web browsers intentionally block "1-click" background
echo installations of extensions to prevent malware and viruses. 
echo.
echo Because I built this custom extension just for you, we just 
echo have to place it into your browser manually one time.
echo.
echo Please follow these 2 quick steps:
echo 1. The Chrome Extensions page will open. Ensure the 
echo    "Developer mode" toggle (top-right corner) is ON.
echo 2. A folder will open containing your extension files. 
echo    Simply DRAG AND DROP the entire "extension" folder 
echo    into the Chrome Extensions page!
echo.
echo Press any key when you are ready to open the windows...
pause >nul

echo.
echo Opening Chrome Extensions page...
start chrome "chrome://extensions/"

echo Opening the extension folder...
explorer "c:\Manoj\Projects\PDF extractor"

echo.
echo After dragging the folder, you can close this window.
pause
