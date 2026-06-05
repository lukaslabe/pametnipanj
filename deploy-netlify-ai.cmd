@echo off
set PATH=C:\Users\lslab\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%
echo Gradim PametniPanj...
call .\node_modules\.bin\vite.cmd build
if errorlevel 1 (
  echo Build ni uspel.
  pause
  exit /b 1
)
echo.
echo Nalagam na Netlify z AI funkcijo...
where netlify >nul 2>nul
if not errorlevel 1 (
  netlify deploy --prod --dir=dist --functions=netlify/functions --no-build
  pause
  exit /b %errorlevel%
)

where npx >nul 2>nul
if not errorlevel 1 (
  npx netlify-cli deploy --prod --dir=dist --functions=netlify/functions --no-build
  pause
  exit /b %errorlevel%
)

where npm >nul 2>nul
if not errorlevel 1 (
  npm exec --yes netlify-cli -- deploy --prod --dir=dist --functions=netlify/functions --no-build
  pause
  exit /b %errorlevel%
)

echo.
echo Manjka Node.js z npm/npx ali Netlify CLI.
echo Namesti Node.js LTS iz https://nodejs.org/
echo Nato zapri terminal, odpri novega in ponovno zazeni:
echo .\deploy-netlify-ai.cmd
pause
