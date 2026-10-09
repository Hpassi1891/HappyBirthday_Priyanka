@echo off
rem Starts a tiny local web server for the birthday site and opens it in your browser.
cd /d "%~dp0"
echo.
echo  Starting the birthday site on http://localhost:8000  (close this window to stop it)
echo.
start "" "http://localhost:8000/?preview=1"
where py >nul 2>nul && (py -m http.server 8000 & goto :eof)
where python >nul 2>nul && (python -m http.server 8000 & goto :eof)
where npx >nul 2>nul && (npx --yes serve -l 8000 . & goto :eof)
echo  Could not find Python or Node.js. Install Python from https://www.python.org/downloads/ (tick "Add to PATH") and run this again.
pause
