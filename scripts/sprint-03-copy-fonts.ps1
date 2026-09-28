[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sourceRoot = 'C:\Users\sab_j\Desktop\Projects\Argiropouloslaw\web\public\fonts\Inter'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$destinationRoot = Join-Path $repositoryRoot 'public\fonts\Inter'
$files = @(
    'Inter-VariableFont_opsz,wght.ttf'
    'Inter-Italic-VariableFont_opsz,wght.ttf'
    'OFL.txt'
    'README.txt'
)

if ($repositoryRoot -ne 'C:\Users\sab_j\Desktop\Projects\Soccerxcamp\web') {
    throw "Unexpected repository root: $repositoryRoot"
}

foreach ($name in $files) {
    $source = Join-Path $sourceRoot $name
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Required font source is missing: $source"
    }
}

New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null

foreach ($name in $files) {
    $source = Join-Path $sourceRoot $name
    $destination = Join-Path $destinationRoot $name
    Copy-Item -LiteralPath $source -Destination $destination -Force
    $hash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
    Write-Host "$name  SHA256=$hash"
}

Write-Host "Inter variable fonts and OFL license copied to $destinationRoot" -ForegroundColor Green
