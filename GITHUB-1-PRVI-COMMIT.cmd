@echo off
cd /d C:\Users\lslab\Desktop\Codex

echo.
echo Pripravljam Git zgodovino za PametniPanj...
echo To nic ne objavi na splet. Samo naredi lokalni prvi commit.
echo.

git init
git config --global --add safe.directory C:/Users/lslab/Desktop/Codex
git branch -M main
git config user.name "Luka BeeCare"
git config user.email "luka@example.local"

echo.
echo Dodajam datoteke...
git add .

echo.
echo Ustvarjam prvi commit...
git commit -m "Initial PametniPanj MVP"

echo.
echo Koncano. Ce spodaj pise 'nothing to commit', je commit ze obstajal.
git status
echo.
pause
