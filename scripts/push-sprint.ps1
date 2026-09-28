[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidatePattern('^[0-9]+[A-Za-z0-9.-]*$')]
    [string]$Sprint,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Message
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$expectedRepositoryRoot = 'C:\Users\sab_j\Desktop\Projects\Soccerxcamp\web'
$githubRemote = 'https://github.com/HiImSaba1/soccexcamp.git'

function Assert-LastCommandSucceeded {
    param([Parameter(Mandatory)][string]$Step)

    if ($LASTEXITCODE -ne 0) {
        throw "$Step failed with exit code $LASTEXITCODE."
    }
}

function Invoke-Git {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments,

        [Parameter(Mandatory)]
        [string]$Step
    )

    & git @Arguments
    Assert-LastCommandSucceeded -Step $Step
}

if ($repositoryRoot -ne $expectedRepositoryRoot) {
    throw "This script must run from the Soccerxcamp web repository. Resolved path: $repositoryRoot"
}

if (-not (Test-Path -LiteralPath (Join-Path $repositoryRoot '.git') -PathType Container)) {
    throw "The expected Git repository was not found at $repositoryRoot."
}

Push-Location -LiteralPath $repositoryRoot

try {
    Write-Host "Repository: $repositoryRoot" -ForegroundColor Cyan
    Write-Host "Target:     $githubRemote" -ForegroundColor Cyan

    Write-Host 'Running ESLint...' -ForegroundColor Cyan
    & npm.cmd run lint
    Assert-LastCommandSucceeded -Step 'Lint verification'

    Write-Host 'Running TypeScript checks...' -ForegroundColor Cyan
    & npx.cmd tsc --noEmit
    Assert-LastCommandSucceeded -Step 'TypeScript verification'

    Write-Host 'Running the production build...' -ForegroundColor Cyan
    & npm.cmd run build
    Assert-LastCommandSucceeded -Step 'Production build verification'

    $remotes = @(& git remote)
    Assert-LastCommandSucceeded -Step 'Reading configured Git remotes'

    if ($remotes -notcontains 'origin') {
        Write-Host 'Adding the approved GitHub repository as origin...' -ForegroundColor Cyan
        Invoke-Git -Arguments @('remote', 'add', 'origin', $githubRemote) -Step 'Adding origin'
    }
    else {
        $origin = (& git remote get-url origin).Trim()
        Assert-LastCommandSucceeded -Step 'Reading origin URL'

        if ($origin.TrimEnd('/') -ne $githubRemote.TrimEnd('/')) {
            throw "Remote 'origin' is '$origin', not the approved repository '$githubRemote'. No remote was changed."
        }
    }

    $branch = (& git branch --show-current).Trim()
    Assert-LastCommandSucceeded -Step 'Reading the current branch'
    if ([string]::IsNullOrWhiteSpace($branch)) {
        throw 'The repository is in detached HEAD state. Check out a branch before pushing.'
    }

    if ($branch -eq 'master') {
        Write-Host "Renaming the initial branch from 'master' to 'main'..." -ForegroundColor Cyan
        Invoke-Git -Arguments @('branch', '-M', 'main') -Step 'Renaming the initial branch'
        $branch = 'main'
    }

    Write-Host 'Staging repository changes...' -ForegroundColor Cyan
    Invoke-Git -Arguments @('add', '--all') -Step 'Staging changes'

    $stagedFiles = @(& git diff --cached --name-only --diff-filter=ACMR)
    Assert-LastCommandSucceeded -Step 'Inspecting staged files'

    $blockedFiles = @(
        $stagedFiles | Where-Object {
            $_ -match '(^|/)(\.env(?:\..*)?|node_modules|\.next|coverage|playwright-report|test-results)(/|$)' -or
            $_ -match '\.pem$' -or
            $_ -match '\.key$' -or
            $_ -match '\.pfx$' -or
            $_ -match '\.p12$' -or
            $_ -match '\.WordPress\..*\.xml$' -or
            $_ -match '\.(?:zip|tar|tar\.gz|tgz)$'
        }
    )

    if ($blockedFiles.Count -gt 0) {
        Write-Host 'Blocked staged files:' -ForegroundColor Red
        $blockedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        throw 'Commit cancelled because sensitive, generated, migration-source, or archive files are staged. Nothing was committed or pushed.'
    }

    if ($stagedFiles.Count -eq 0) {
        throw 'There are no staged changes to commit. Nothing was pushed.'
    }

    Write-Host 'Files selected for the sprint commit:' -ForegroundColor Cyan
    $stagedFiles | ForEach-Object { Write-Host "  $_" }

    $commitMessage = "Sprint ${Sprint}: $($Message.Trim())"
    Invoke-Git -Arguments @('commit', '-m', $commitMessage) -Step 'Creating the sprint commit'

    Write-Host "Pushing branch '$branch'..." -ForegroundColor Cyan
    $upstream = (& git for-each-ref '--format=%(upstream:short)' "refs/heads/$branch").Trim()
    Assert-LastCommandSucceeded -Step 'Reading branch upstream'

    if (-not [string]::IsNullOrWhiteSpace($upstream)) {
        Invoke-Git -Arguments @('push') -Step 'Pushing the sprint commit'
    }
    else {
        Invoke-Git -Arguments @('push', '--set-upstream', 'origin', $branch) -Step 'Publishing the branch'
    }

    Write-Host ''
    Write-Host "$commitMessage was pushed successfully." -ForegroundColor Green
    Write-Host "Remote: $githubRemote" -ForegroundColor Green
    Write-Host "Branch: $branch" -ForegroundColor Green
}
finally {
    Pop-Location
}
