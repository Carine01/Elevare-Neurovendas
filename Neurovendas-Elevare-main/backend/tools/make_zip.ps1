param(
    [string]$AppDir,
    [string]$ZipPath
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $AppDir) {
    $AppDir = Resolve-Path (Join-Path $scriptDir "..\..")
}
$appLeaf = Split-Path $AppDir -Leaf
$appParent = Split-Path $AppDir -Parent

if (-not $ZipPath) {
    $ZipPath = Join-Path $appParent ("{0}.zip" -f $appLeaf)
}

Write-Host "AppDir: $AppDir" -ForegroundColor Cyan
Write-Host "ZipPath: $ZipPath" -ForegroundColor Cyan

if (Test-Path $ZipPath) { Remove-Item -Path $ZipPath -Force }
Compress-Archive -Path (Join-Path $AppDir "*") -DestinationPath $ZipPath -Force
Write-Host "ZIP criado: $ZipPath" -ForegroundColor Green
