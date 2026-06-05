@echo off
cd /d C:\Users\lslab\Desktop\Codex

echo.
echo Povezava PametniPanj z GitHub repozitorijem.
echo.
echo Najprej na github.com ustvari PRAZEN repozitorij, brez README, brez .gitignore.
echo Nato sem prilepi URL, npr:
echo https://github.com/tvoje-ime/pametnipanj.git
echo.

set /p REPO_URL=GitHub repo URL: 

if "%REPO_URL%"=="" (
  echo Ni URL-ja. Prekinjam.
  pause
  exit /b 1
)

git remote remove origin 2>nul
git config --global --add safe.directory C:/Users/lslab/Desktop/Codex
git remote add origin "%REPO_URL%"
git branch -M main

echo.
echo Posiljam na GitHub...
git push -u origin main

echo.
echo Koncano. Ce je push uspel, lahko Netlify povezemo z GitHubom.
echo.
pause
