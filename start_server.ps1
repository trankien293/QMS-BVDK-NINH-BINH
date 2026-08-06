$listener = New-Object System.Net.HttpListener

# Add localhost prefixes (works without Admin elevation)
$listener.Prefixes.Add("http://localhost:5000/")
$listener.Prefixes.Add("http://127.0.0.1:5000/")

# Try adding wildcard or local IP prefix if permitted
try {
    $ipList = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' }
    foreach ($ip in $ipList) {
        $ipStr = $ip.IPAddressToString
        if ($ipStr -ne "127.0.0.1") {
            try {
                $listener.Prefixes.Add("http://${ipStr}:5000/")
            } catch {}
        }
    }
} catch {}

try {
    $listener.Start()
    Write-Output "⚡ Máy chủ Web Server 5S đang chạy thành công tại http://localhost:5000/"
} catch {
    # If non-localhost IP prefix caused Access Denied, reset to localhost only
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:5000/")
    $listener.Prefixes.Add("http://127.0.0.1:5000/")
    $listener.Start()
    Write-Output "⚡ Máy chủ Web Server 5S đang chạy an toàn tại http://localhost:5000/"
}

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            if (Test-Path (Join-Path $root "standalone_app.html")) {
                $urlPath = "/standalone_app.html"
            } else {
                $urlPath = "/index.html"
            }
        }

        $filePath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".ico"  { $response.ContentType = "image/x-icon" }
                default { $response.ContentType = "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    } catch {
        # continue loop
    }
}
