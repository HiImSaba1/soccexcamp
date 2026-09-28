[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$expectedRoot = 'C:\Users\sab_j\Desktop\Projects\Soccerxcamp\web'
$manifestPath = Join-Path $repositoryRoot 'migration\media-manifest.json'
$approvalPath = Join-Path $repositoryRoot 'migration\media-acquisition-approval.json'
$reviewRoot = Join-Path $repositoryRoot 'migration\review-media'
$reportPath = Join-Path $repositoryRoot 'migration\reports\sprint-06-media-verification.json'

if ($repositoryRoot -ne $expectedRoot) { throw "Unexpected repository root: $repositoryRoot" }
foreach ($required in @($manifestPath, $approvalPath)) { if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Required input is missing: $required" } }

$manifestDocument = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$manifest = @($manifestDocument.GetEnumerator())
$approval = Get-Content -LiteralPath $approvalPath -Raw -Encoding UTF8 | ConvertFrom-Json
$approvedIds = @(
    @($approval.groups.campaign)
    @($approval.groups.'june-story')
    @($approval.groups.talentbook)
) | ForEach-Object {
    foreach ($value in @($_)) { [int]$value }
} | Sort-Object -Unique

if ($approvedIds.Count -eq 0) { throw 'The approval file did not contain any media IDs.' }
Write-Host "Approved media IDs ($($approvedIds.Count)): $($approvedIds -join ', ')" -ForegroundColor Cyan
if ($manifest.Count -eq 0) { throw 'The media manifest did not contain any records.' }
Write-Host "Media manifest records: $($manifest.Count)" -ForegroundColor Cyan

$records = @($manifest | Where-Object { $approvedIds -contains [int]$_.wordpressId })
$missingIds = @($approvedIds | Where-Object { $_ -notin $records.wordpressId })
if ($missingIds.Count -gt 0) { throw "Approved IDs missing from manifest: $($missingIds -join ', ')" }

$resolvedReviewRoot = [System.IO.Path]::GetFullPath($reviewRoot)
$resolvedRepositoryRoot = [System.IO.Path]::GetFullPath($repositoryRoot)
if (-not $resolvedReviewRoot.StartsWith($resolvedRepositoryRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Review directory escaped the repository: $resolvedReviewRoot" }
New-Item -ItemType Directory -Path $resolvedReviewRoot -Force | Out-Null

function Get-DetectedMimeType {
    param([Parameter(Mandatory)][string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 4 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) { return 'image/jpeg' }
    if ($bytes.Length -ge 8 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { return 'image/png' }
    if ($bytes.Length -ge 12 -and [Text.Encoding]::ASCII.GetString($bytes, 0, 4) -eq 'RIFF' -and [Text.Encoding]::ASCII.GetString($bytes, 8, 4) -eq 'WEBP') { return 'image/webp' }
    if ($bytes.Length -ge 5 -and [Text.Encoding]::ASCII.GetString($bytes, 0, 5) -eq '%PDF-') { return 'application/pdf' }
    return 'application/octet-stream'
}

function Get-ImageDimensions {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$MimeType)
    if (-not $MimeType.StartsWith('image/')) { return $null }
    try {
        Add-Type -AssemblyName System.Drawing
        $image = [System.Drawing.Image]::FromFile($Path)
        try { return @{ width = $image.Width; height = $image.Height } } finally { $image.Dispose() }
    }
    catch { return $null }
}

$results = [System.Collections.Generic.List[object]]::new()
foreach ($record in $records) {
    $id = [int]$record.wordpressId
    $sourceUrl = [string]$record.originalUrl
    if ($sourceUrl -match '^http://www\.soccerxcamp\.com/') { $sourceUrl = $sourceUrl -replace '^http://', 'https://' }
    $extension = [System.IO.Path]::GetExtension([string]$record.filename).ToLowerInvariant()
    $destination = Join-Path $resolvedReviewRoot ("{0}{1}" -f $id, $extension)
    $temporary = "$destination.part"
    $result = [ordered]@{ wordpressId = $id; sourceUrl = $sourceUrl; reviewPath = $destination.Substring($resolvedRepositoryRoot.Length).TrimStart('\'); status = 'failed'; detectedMimeType = $null; bytes = $null; sha256 = $null; width = $null; height = $null; error = $null }
    try {
        Write-Host "Downloading WordPress media $id..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $sourceUrl -OutFile $temporary -MaximumRedirection 5 -Headers @{ 'User-Agent' = 'Soccerxcamp migration verifier/1.0' }
        $mimeType = Get-DetectedMimeType -Path $temporary
        if ($mimeType -eq 'application/octet-stream') { throw 'Downloaded response is not a recognized approved media type.' }
        Move-Item -LiteralPath $temporary -Destination $destination -Force
        $file = Get-Item -LiteralPath $destination
        $dimensions = Get-ImageDimensions -Path $destination -MimeType $mimeType
        $result.status = 'verified-local-review'
        $result.detectedMimeType = $mimeType
        $result.bytes = $file.Length
        $result.sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
        if ($dimensions) { $result.width = $dimensions.width; $result.height = $dimensions.height }
        Write-Host "  $mimeType  $($file.Length) bytes  SHA256=$($result.sha256)" -ForegroundColor Green
    }
    catch {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
        $result.error = $_.Exception.Message
        Write-Warning "Media $id failed: $($result.error)"
    }
    $results.Add([pscustomobject]$result)
}

$report = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString('o')
    approvalScope = $approval.approvalScope
    publicationApproved = [bool]$approval.publicationApproved
    requested = $approvedIds.Count
    verified = @($results | Where-Object status -eq 'verified-local-review').Count
    failed = @($results | Where-Object status -eq 'failed').Count
    items = $results
}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Host "Verification report: $reportPath" -ForegroundColor Cyan
if ($report.failed -gt 0) { throw "$($report.failed) approved media downloads failed. Review the generated report; successful files remain quarantined." }
Write-Host 'All approved media was acquired for local review. Nothing was published.' -ForegroundColor Green
