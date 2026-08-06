Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\7dcaef87-f1e0-401e-bdf0-3c07222c0395\media__1785119931724.png"
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

$destDirs = @(
    "c:\Users\Admin\.gemini\antigravity-ide\scratch\QMS-BVDK-NINH-BINH\QMS-BVDK-NINH-BINH",
    "c:\Users\Admin\.gemini\antigravity-ide\scratch\QMS-BVDK-NINH-BINH\QMS-BVDK-NINH-BINH\public"
)

foreach ($dir in $destDirs) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

function Save-ResizedImage ($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $outPath ($width x $height)"
}

foreach ($dir in $destDirs) {
    Save-ResizedImage $srcImg 512 512 (Join-Path $dir "icon-512.png")
    Save-ResizedImage $srcImg 192 192 (Join-Path $dir "icon-192.png")
    Save-ResizedImage $srcImg 180 180 (Join-Path $dir "apple-touch-icon.png")
    Save-ResizedImage $srcImg 64 64 (Join-Path $dir "favicon.png")
    Save-ResizedImage $srcImg 512 512 (Join-Path $dir "icon.png")
    Copy-Item -Path (Join-Path $dir "favicon.png") -Destination (Join-Path $dir "favicon.ico") -Force
}

$srcImg.Dispose()
Write-Host "All icons generated successfully!"
