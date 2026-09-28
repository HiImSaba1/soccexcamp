[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$reviewRoot = Join-Path $repoRoot 'migration\review-media'
$reportPath = Join-Path $repoRoot 'migration\reports\sprint-06-media-verification.json'
$selectionPath = Join-Path $repoRoot 'migration\media-publication-selection.json'
$publicRoot = Join-Path $repoRoot 'public\media\soccerxcamp'

if (-not (Test-Path -LiteralPath $reportPath -PathType Leaf)) {
    throw "Verification report not found: $reportPath. Run acquire-approved-media.ps1 first."
}
if (-not (Test-Path -LiteralPath $selectionPath -PathType Leaf)) {
    throw "Publication selection not found: $selectionPath"
}

$report = Get-Content -LiteralPath $reportPath -Raw -Encoding UTF8 | ConvertFrom-Json
$selection = Get-Content -LiteralPath $selectionPath -Raw -Encoding UTF8 | ConvertFrom-Json
$verifiedItems = @($report.items)
$selectedItems = @($selection.selected)
$blockedIds = @($selection.blocked | ForEach-Object { [int]$_.wordpressId })

if ($selectedItems.Count -eq 0) { throw 'Publication selection is empty.' }
if (-not ($blockedIds -contains 1257)) { throw 'Safety rule missing: the personal-data PDF must remain blocked.' }

New-Item -ItemType Directory -Path $publicRoot -Force | Out-Null

foreach ($selected in $selectedItems) {
    $id = [int]$selected.wordpressId
    if ($blockedIds -contains $id) { throw "WordPress media $id is both selected and blocked." }

    $matches = @($verifiedItems | Where-Object { [int]$_.wordpressId -eq $id })
    if ($matches.Count -ne 1) { throw "Expected one verified record for WordPress media $id; found $($matches.Count)." }
    $verified = $matches[0]
    if ($verified.status -ne 'verified-local-review' -or -not $verified.sha256) {
        throw "WordPress media $id is not verified for local review."
    }
    if (-not ([string]$verified.detectedMimeType).StartsWith('image/')) {
        throw "WordPress media $id is not an image and cannot be promoted."
    }

    $sourcePath = Join-Path $repoRoot ([string]$verified.reviewPath)
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Reviewed file missing: $sourcePath" }
    $actualHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash
    if ($actualHash -ne [string]$verified.sha256) { throw "Checksum mismatch for WordPress media $id." }

    $targetPath = Join-Path $publicRoot ([string]$selected.publicFile)
    Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
    $targetHash = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash
    if ($targetHash -ne $actualHash) { throw "Copy verification failed for WordPress media $id." }
    Write-Host "Published media $id -> public/media/soccerxcamp/$($selected.publicFile)  SHA256=$targetHash"
}

$expectedNames = @($selectedItems | ForEach-Object { [string]$_.publicFile })
$unexpected = @(Get-ChildItem -LiteralPath $publicRoot -File | Where-Object { $expectedNames -notcontains $_.Name })
if ($unexpected.Count -gt 0) {
    throw "Unexpected files exist in the managed public media directory: $($unexpected.Name -join ', ')"
}

Write-Host "Promoted $($selectedItems.Count) checksum-verified images."
Write-Host 'The personal-data PDF, expired campaign badge and all unselected review files remain outside public/.'
