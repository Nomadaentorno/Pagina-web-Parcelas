@echo off
cd /d "%~dp0"
py -m http.server 5500
if errorlevel 1 (
  python -m http.server 5500
)
