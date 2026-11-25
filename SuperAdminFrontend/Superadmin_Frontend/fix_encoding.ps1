$filePath = "E:\B2B-CRM\src\SuperAdmin\pages\Plans\PlansManagementPage.jsx"
$content = [System.IO.File]::ReadAllText($filePath)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
Write-Host "Done. File re-encoded to UTF-8 without BOM."
