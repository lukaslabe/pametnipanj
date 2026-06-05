$ErrorActionPreference = "Stop"

$cloudflared = Join-Path $PSScriptRoot "tools\cloudflared.exe"
$downloadedCloudflared = Join-Path $PSScriptRoot "tools\cloudflared-windows-amd64.exe"

if (!(Test-Path $cloudflared) -and (Test-Path $downloadedCloudflared)) {
  $cloudflared = $downloadedCloudflared
}

if (!(Test-Path $cloudflared)) {
  Write-Host ""
  Write-Host "Manjka tools\cloudflared.exe"
  Write-Host ""
  Write-Host "Prenesi ga sem:"
  Write-Host "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
  Write-Host ""
  Write-Host "Shrani kot eno od teh imen:"
  Write-Host (Join-Path $PSScriptRoot "tools\cloudflared.exe")
  Write-Host (Join-Path $PSScriptRoot "tools\cloudflared-windows-amd64.exe")
  Write-Host ""
  exit 1
}

Write-Host "Odpiram javni HTTPS tunel za BeeCare..."
Write-Host "Ko se izpiše https://....trycloudflare.com, ta link odpri na telefonu."
Write-Host ""

& $cloudflared tunnel --protocol http2 --url http://127.0.0.1:5173
