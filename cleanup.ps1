# BogunsoPlus Cleanup Script
# Deletes obsolete files after Next.js migration

$filesToDelete = @(
    "vite.config.ts",
    "tsconfig.node.json",
    "next.config.ts.egdesk-backup",
    "client/index.html",
    "client/src/main.tsx",
    "client/src/App.tsx",
    "client/src/index.css",
    "server/index.ts",
    "package-lock.json"
)

Write-Host "--- BogunsoPlus Cleanup ---" -ForegroundColor Cyan

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Write-Host "Deleting $file..." -ForegroundColor Yellow
        Remove-Item -Path $file -Force
    } else {
        Write-Host "File $file not found, skipping." -ForegroundColor Gray
    }
}

Write-Host "Cleanup complete! The project is now fully optimized for Next.js." -ForegroundColor Green
