# Genera capturas REALES de ambas aplicaciones en Microsoft Edge o Google Chrome (Windows).
# Ejecutar despues de npm install: powershell -ExecutionPolicy Bypass -File .\scripts\crear-capturas.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dest = Join-Path $root 'docs\capturas'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$programFilesX86 = [Environment]::GetFolderPath('ProgramFilesX86')
$candidates = @(
  (Join-Path $programFilesX86 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
  (Join-Path $programFilesX86 'Google\Chrome\Application\chrome.exe')
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) {
  throw 'No encuentro Microsoft Edge o Chrome. Abre manualmente los dos enlaces y guarda las capturas en docs/capturas/.'
}

$api = $null
$web = $null
try {
  $api = Start-Process -FilePath 'node.exe' -ArgumentList 'apps/api/src/server.js' -WorkingDirectory $root -PassThru -WindowStyle Hidden
  $web = Start-Process -FilePath 'node.exe' -ArgumentList 'apps/web/scripts/server.mjs' -WorkingDirectory $root -PassThru -WindowStyle Hidden
  $ok = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 600
    try {
      $health = Invoke-RestMethod 'http://localhost:3001/api/health' -TimeoutSec 2
      $page = Invoke-WebRequest 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 2
      if ($health.ok -and $page.StatusCode -eq 200) { $ok = $true; break }
    } catch { }
  }
  if (-not $ok) { throw 'No se pudo iniciar el frontend o el backend. Verifica que los puertos 3000 y 3001 esten libres.' }

  $captures = @(
    @{ name = '01-frontend-funcionando.png'; url = 'http://localhost:3000'; height = 1480 },
    @{ name = '02-backend-funcionando.png'; url = 'http://localhost:3001'; height = 1050 }
  )
  foreach ($capture in $captures) {
    $output = Join-Path $dest $capture.name
    $profile = Join-Path $env:TEMP ('stocklab-capture-' + [Guid]::NewGuid().ToString('N'))
    $args = @('--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--virtual-time-budget=6000', "--user-data-dir=$profile", "--window-size=1440,$($capture.height)", "--screenshot=$output", $capture.url)
    & $browser @args 2>$null | Out-Null
    if (-not (Test-Path $output)) { throw "No se pudo generar la captura $($capture.name)" }
    Write-Host "Captura guardada: $output" -ForegroundColor Green
    Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
  }
} finally {
  if ($web -and -not $web.HasExited) { Stop-Process -Id $web.Id -Force -ErrorAction SilentlyContinue }
  if ($api -and -not $api.HasExited) { Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue }
}
