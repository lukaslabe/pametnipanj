$ErrorActionPreference = "Stop"

$nodeBin = "C:\Users\lslab\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$env:Path = "$nodeBin;$env:Path"

Set-Location $PSScriptRoot

Write-Host "Zaganjam BeeCare na lokalnem omrežju..."
Write-Host "Računalnik: http://127.0.0.1:5173/"
Write-Host "Telefon v istem Wi-Fi: http://192.168.178.34:5173/"
Write-Host ""

.\node_modules\.bin\vite.cmd --configLoader runner --host 0.0.0.0 --port 5173
