<#
.SYNOPSIS
    Generate tasks.md file from spec.md and plan.md

.DESCRIPTION
    Creates a detailed task breakdown file organized by user story priority.
    Reads user stories from spec.md and implementation sequence from plan.md.

.PARAMETER Json
    Output result as JSON for programmatic use

.EXAMPLE
    .\setup-tasks.ps1
    .\setup-tasks.ps1 -Json
#>

[CmdletBinding()]
param(
    [switch]$Json
)

# Import common functions
. "$PSScriptRoot\common.ps1"

function Get-FeatureSpec {
    $specPath = Get-CurrentFeatureFile "spec.md"
    if (-not (Test-Path $specPath)) {
        throw "spec.md not found. Run /speckit.specify first."
    }
    return Get-Content $specPath -Raw
}

function Get-FeaturePlan {
    $planPath = Get-CurrentFeatureFile "plan.md"
    if (-not (Test-Path $planPath)) {
        throw "plan.md not found. Run /speckit.plan first."
    }
    return Get-Content $planPath -Raw
}

function New-TasksFile {
    param(
        [string]$SpecContent,
        [string]$PlanContent
    )

    $tasksPath = Get-CurrentFeatureFile "tasks.md"
    $templatePath = Join-Path $PSScriptRoot "..\..\templates\tasks-template.md"

    if (-not (Test-Path $templatePath)) {
        throw "tasks-template.md not found at: $templatePath"
    }

    # Extract feature name from spec
    $featureName = if ($SpecContent -match "# Feature Specification:\s*(.+)") {
        $matches[1].Trim()
    } else {
        "Contract Management UI"
    }

    # Read template
    $template = Get-Content $templatePath -Raw

    # Replace feature name placeholder
    $tasksContent = $template -replace '\[FEATURE NAME\]', $featureName

    # Save tasks.md
    $tasksContent | Set-Content -Path $tasksPath -NoNewline

    return $tasksPath
}

# Main execution
try {
    Write-InfoMessage "Setting up tasks file..."

    # Get current branch
    $branch = Get-CurrentBranch
    if (-not $branch) {
        throw "Not on a feature branch. Run /speckit.specify first."
    }

    Write-InfoMessage "Current feature: $branch"

    # Get spec and plan content
    $specContent = Get-FeatureSpec
    $planContent = Get-FeaturePlan

    # Generate tasks.md
    $tasksPath = New-TasksFile -SpecContent $specContent -PlanContent $planContent

    Write-SuccessMessage "✓ Tasks file created: $tasksPath"
    Write-InfoMessage ""
    Write-InfoMessage "Next steps:"
    Write-InfoMessage "1. Edit tasks.md to add detailed task breakdown"
    Write-InfoMessage "2. Organize tasks by user story priority (P1, P2, P3)"
    Write-InfoMessage "3. Mark parallelizable tasks with [P]"
    Write-InfoMessage "4. Include exact file paths in task descriptions"

    if ($Json) {
        @{
            success = $true
            tasksFile = $tasksPath
            branch = $branch
        } | ConvertTo-Json
    }
}
catch {
    Write-ErrorMessage "Setup tasks failed: $_"
    if ($Json) {
        @{
            success = $false
            error = $_.Exception.Message
        } | ConvertTo-Json
    }
    exit 1
}
