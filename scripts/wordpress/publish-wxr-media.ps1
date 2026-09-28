[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$expectedRoot = 'C:\Users\sab_j\Desktop\Projects\Soccerxcamp\web'
$manifestPath = Join-Path $repositoryRoot 'migration\media-manifest.json'
$approvalPath = Join-Path $repositoryRoot 'migration\wxr-publication-approval.json'
$publicRoot = Join-Path $repositoryRoot 'public\media\wordpress'
$reportPath = Join-Path $repositoryRoot 'migration\reports\sprint-07-public-media.json'

if ($repositoryRoot -ne $expectedRoot) { throw "Unexpected repository root: $repositoryRoot" }
foreach ($required in @($manifestPath, $approvalPath)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Required input is missing: $required" }
}

$manifest = @((Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json).GetEnumerator())
$approval = Get-Content -LiteralPath $approvalPath -Raw -Encoding UTF8 | ConvertFrom-Json
$approvedTypes = @($approval.approvedTypes | ForEach-Object { [string]$_ })
if (-not [bool]$approval.publicationApproved) { throw 'The publication approval is not active.' }
if ($manifest.Count -ne [int]$approval.approvedCount) { throw "Manifest count $($manifest.Count) does not match approved count $($approval.approvedCount)." }

$resolvedPublicRoot = [IO.Path]::GetFullPath($publicRoot)
$resolvedRepositoryRoot = [IO.Path]::GetFullPath($repositoryRoot)
if (-not $resolvedPublicRoot.StartsWith($resolvedRepositoryRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Public media directory escaped the repository: $resolvedPublicRoot" }
New-Item -ItemType Directory -Path $resolvedPublicRoot -Force | Out-Null

function Get-DetectedMimeType {
    param([Parameter(Mandatory)][string]$Path)
    $bytes = [IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 4 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xD8 -and $bytes[2] -eq 0xFF) { return 'image/jpeg' }
    if ($bytes.Length -ge 8 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) { return 'image/png' }
    if ($bytes.Length -ge 12 -and [Text.Encoding]::ASCII.GetString($bytes, 0, 4) -eq 'RIFF' -and [Text.Encoding]::ASCII.GetString($bytes, 8, 4) -eq 'WEBP') { return 'image/webp' }
    if ($bytes.Length -ge 5 -and [Text.Encoding]::ASCII.GetString($bytes, 0, 5) -eq '%PDF-') { return 'application/pdf' }
    return 'application/octet-stream'
}

function Get-PublicFilename {
    param([Parameter(Mandatory)]$Record)
    $leaf = [IO.Path]::GetFileName([string]$Record.filename)
    $safeLeaf = $leaf -replace '[^A-Za-z0-9._-]', '-'
    if ([string]::IsNullOrWhiteSpace($safeLeaf)) { throw "Attachment $($Record.wordpressId) has no safe filename." }
    return "{0}-{1}" -f [int]$Record.wordpressId, $safeLeaf
}

function Get-PublicSourceUrl {
    param([Parameter(Mandatory)][string]$OriginalUrl)
    $uri = [Uri]$OriginalUrl
    if ($uri.Host -notin @('soccerxcamp.com', 'www.soccerxcamp.com', 'soccerxcamp.localhost')) { throw "Unapproved media host: $($uri.Host)" }
    return "https://www.soccerxcamp.com$($uri.PathAndQuery)"
}

$results = [Collections.Generic.List[object]]::new()
foreach ($record in $manifest) {
    $id = [int]$record.wordpressId
    $publicFilename = Get-PublicFilename -Record $record
    $destination = Join-Path $resolvedPublicRoot $publicFilename
    $temporary = "$destination.part"
    $sourceUrl = Get-PublicSourceUrl -OriginalUrl ([string]$record.originalUrl)
    $result = [ordered]@{ wordpressId=$id; sourceUrl=$sourceUrl; publicPath="public/media/wordpress/$publicFilename"; status='failed'; detectedMimeType=$null; bytes=$null; sha256=$null; error=$null }
    try {
        $downloadRequired = $true
        if (Test-Path -LiteralPath $destination -PathType Leaf) {
            $existingType = Get-DetectedMimeType -Path $destination
            if ($approvedTypes -contains $existingType) { $downloadRequired = $false; Write-Host "Reusing verified media $id..." -ForegroundColor DarkCyan }
        }
        if ($downloadRequired) {
            Write-Host "Downloading WordPress media $id of $($manifest.Count)..." -ForegroundColor Cyan
            Invoke-WebRequest -Uri $sourceUrl -OutFile $temporary -MaximumRedirection 5 -Headers @{ 'User-Agent'='Soccerxcamp WXR media publisher/1.0' }
            $downloadedType = Get-DetectedMimeType -Path $temporary
            if ($approvedTypes -notcontains $downloadedType) { throw "Downloaded response has unapproved type: $downloadedType" }
            Move-Item -LiteralPath $temporary -Destination $destination -Force
        }
        $mimeType = Get-DetectedMimeType -Path $destination
        if ($approvedTypes -notcontains $mimeType) { throw "Public file has unapproved type: $mimeType" }
        $file = Get-Item -LiteralPath $destination
        $result.status = 'published-verified'
        $result.detectedMimeType = $mimeType
        $result.bytes = $file.Length
        $result.sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
        Write-Host "  $publicFilename  $mimeType  $($file.Length) bytes" -ForegroundColor Green
    }
    catch {
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
        $result.error = $_.Exception.Message
        Write-Warning "Media $id failed: $($result.error)"
    }
    $results.Add([pscustomobject]$result)
}

$report = [ordered]@{
    generatedAt=(Get-Date).ToUniversalTime().ToString('o')
    approvalScope=[string]$approval.approvalScope
    publicationApproved=$true
    requested=$manifest.Count
    published=@($results | Where-Object status -eq 'published-verified').Count
    failed=@($results | Where-Object status -eq 'failed').Count
    items=$results
}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8
Write-Host "Publication report: $reportPath" -ForegroundColor Cyan
if ($report.failed -gt 0) { throw "$($report.failed) media files failed. Successful files remain verified; rerun the script to retry only missing or invalid files." }
Write-Host "Published and verified all $($report.published) WXR media attachments." -ForegroundColor Green
