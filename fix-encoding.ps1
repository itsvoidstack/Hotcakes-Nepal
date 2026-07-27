$file = "c:\Users\Acer\Downloads\Hotcakes-Nepal\src\components\dashboard\DashboardClient.tsx"
$bytes = [System.IO.File]::ReadAllBytes($file)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix garbled emoji/unicode sequences
$replacements = @{
    "â­ Yes"          = "⭐ Yes"
    "ðŸŽ Claim & Reset" = "🎁 Claim & Reset"
    "ðŸŽ Claim"        = "🎁 Claim"
    "Uploadingâ€¦"     = "Uploading…"
    "Savingâ€¦"        = "Saving…"
    "Loadingâ€¦"       = "Loading…"
    "dashboardâ€¦"     = "dashboard…"
    "hereâ€¦"          = "here…"
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Also fix the checkmark - handle separately due to quoting
$content = $content -replace [regex]::Escape("âœ" Set"), "✓ Set"

$outBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
[System.IO.File]::WriteAllBytes($file, $outBytes)
Write-Host "Fixed. Lines: $(($content -split "`n").Count)"
