@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:5500"
"C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" live-preview.cjs > live-preview.log 2> live-preview-error.log
pause
