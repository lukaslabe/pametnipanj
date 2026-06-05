@echo off
setlocal

cd /d C:\Users\lslab\Desktop\Codex

echo Nalagam zadnjo delujoco verzijo iz mape dist...
echo To NE gradi aplikacije znova.

where netlify >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  netlify deploy --prod --dir=dist --functions=netlify/functions --no-build
  goto done
)

where npm.cmd >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  npm.cmd exec --yes netlify-cli -- deploy --prod --dir=dist --functions=netlify/functions --no-build
  goto done
)

if exist "C:\Program Files\nodejs\npm.cmd" (
  "C:\Program Files\nodejs\npm.cmd" exec --yes netlify-cli -- deploy --prod --dir=dist --functions=netlify/functions --no-build
  goto done
)

where npx.cmd >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  npx.cmd netlify-cli deploy --prod --dir=dist --functions=netlify/functions --no-build
  goto done
)

echo Ne najdem Netlify ukaza. Odpri terminal z normalnim Node/npm okoljem.

:done
echo.
echo Koncano. Odpri:
echo https://pametnipanj.netlify.app/?fresh=1
pause
