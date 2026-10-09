#!/bin/sh
# Starts a tiny local web server for the birthday site and opens it in your browser.
cd "$(dirname "$0")" || exit 1
echo "Starting the birthday site on http://localhost:8000  (press Ctrl+C to stop)"
( sleep 1; (open "http://localhost:8000/?preview=1" || xdg-open "http://localhost:8000/?preview=1") >/dev/null 2>&1 ) &
if command -v python3 >/dev/null 2>&1; then exec python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then exec python -m http.server 8000
else exec npx --yes serve -l 8000 .
fi
