[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$expectedRepositoryRoot = 'C:\Users\sab_j\Desktop\Projects\Soccerxcamp\web'

function Assert-LastCommandSucceeded {
    param([Parameter(Mandatory)][string]$Step)

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE."
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot 'package.json') -PathType Leaf)) {
    throw "No package.json was found at $repositoryRoot."
}

if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot '.git') -PathType Container)) {
    throw "The expected Git repository was not found at $repositoryRoot."
}

if ($repositoryRoot -ne $expectedRepositoryRoot) {
    throw "This script must run from the Soccerxcamp web repository. Resolved path: $repositoryRoot"
}

$runtimePackages = @(
    'gsap'
    '@gsap/react'
    'motion'
    'lenis'
    'embla-carousel-react'
    'lucide-react'
    'sonner'
    'yet-another-react-lightbox'
    'react-hook-form'
    'zod'
    '@hookform/resolvers'
    'clsx'
    'tailwind-merge'
    'class-variance-authority'
    'drizzle-orm'
    'postgres'
    'next-auth'
    'sanitize-html'
    'fast-xml-parser'
    'adm-zip'
    'sharp'
)

$developmentPackages = @(
    '@types/node@^22'
    'drizzle-kit'
    'tsx'
    'vitest@5'
    '@vitest/coverage-v8@5'
    '@playwright/test'
    '@types/sanitize-html'
    '@types/adm-zip'
)

Push-Location -LiteralPath $repositoryRoot

try {
    Write-Host "Repository: $repositoryRoot" -ForegroundColor Cyan

    Write-Host 'Installing runtime dependencies...' -ForegroundColor Cyan
    & npm.cmd install --save --no-audit @runtimePackages
    Assert-LastCommandSucceeded -Step 'Runtime dependency installation'

    Write-Host 'Installing development dependencies...' -ForegroundColor Cyan
    & npm.cmd install --save-dev --no-audit @developmentPackages
    Assert-LastCommandSucceeded -Step 'Development dependency installation'

    Write-Host 'Checking the top-level dependency tree...' -ForegroundColor Cyan
    & npm.cmd ls --depth=0
    Assert-LastCommandSucceeded -Step 'Dependency tree verification'

    Write-Host 'Running ESLint...' -ForegroundColor Cyan
    & npm.cmd run lint
    Assert-LastCommandSucceeded -Step 'Lint verification'

    Write-Host 'Running the TypeScript compiler...' -ForegroundColor Cyan
    & npx.cmd tsc --noEmit
    Assert-LastCommandSucceeded -Step 'TypeScript verification'

    Write-Host 'Running the production build...' -ForegroundColor Cyan
    & npm.cmd run build
    Assert-LastCommandSucceeded -Step 'Production build verification'

    Write-Host ''
    Write-Host 'Sprint 0 dependency installation and non-interactive checks passed.' -ForegroundColor Green
    Write-Host 'No parent-directory files were removed.' -ForegroundColor Green
    Write-Host 'Next: run npm run dev manually, verify http://localhost:3000, then press Ctrl+C.' -ForegroundColor Yellow
}
finally {
    Pop-Location
}
