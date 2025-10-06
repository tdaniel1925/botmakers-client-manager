# PowerShell script to fix all auth() calls that need await

$files = @(
    "actions\projects-actions.ts",
    "actions\project-notes-actions.ts",
    "actions\onboarding-actions.ts",
    "actions\audit-actions.ts",
    "actions\support-actions.ts",
    "actions\organizations-admin-actions.ts",
    "actions\platform-actions.ts",
    "actions\credits-actions.ts",
    "lib\platform-admin.ts",
    "lib\server-organization-context.ts",
    "lib\audit-logger.ts"
)

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        Write-Host "Fixing $file..."
        $content = Get-Content $path -Raw
        $content = $content -replace 'const \{ userId \} = auth\(\);', 'const { userId } = await auth();'
        $content = $content -replace 'const \{ (.+?) \} = auth\(\);', 'const { $1 } = await auth();'
        Set-Content $path $content -NoNewline
        Write-Host "  Fixed"
    } else {
        Write-Host "  File not found: $path" -ForegroundColor Yellow
    }
}

Write-Host "`nAll auth() calls have been updated to await auth()" -ForegroundColor Green
