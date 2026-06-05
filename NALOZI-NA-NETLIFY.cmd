@echo off
cd /d C:\Users\lslab\Desktop\Codex

echo.
echo Nalagam PametniPanj na Netlify...
echo Uporabljam ze zgrajeno mapo dist.
echo.

"C:\Program Files\nodejs\npx.cmd" netlify-cli deploy --prod --dir=dist --functions=netlify/functions --no-build

echo.
echo Ce je nalaganje uspelo, odpri:
echo https://pametnipanj.netlify.app/?fresh=1
echo.
pause
