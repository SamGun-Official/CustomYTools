# Builds CustomYTools.zip containing only the files needed to load/publish the extension.
# Includes: /scripts, /src (except src/css/app.css), config.json, manifest.json, popup.html, version.json

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$zipName = "CustomYTools.zip"
$zipPath = Join-Path $root $zipName
$stagingDir = Join-Path $env:TEMP "CustomYTools_build_$(Get-Random)"

if (Test-Path $zipPath) {
	Remove-Item $zipPath -Force
}

New-Item -ItemType Directory -Path $stagingDir | Out-Null

try {
	Copy-Item -Path (Join-Path $root "scripts") -Destination (Join-Path $stagingDir "scripts") -Recurse
	Copy-Item -Path (Join-Path $root "src") -Destination (Join-Path $stagingDir "src") -Recurse

	$excludedCss = Join-Path $stagingDir "src\css\app.css"
	if (Test-Path $excludedCss) {
		Remove-Item $excludedCss -Force
	}

	Copy-Item -Path (Join-Path $root "config.json") -Destination $stagingDir
	Copy-Item -Path (Join-Path $root "manifest.json") -Destination $stagingDir
	Copy-Item -Path (Join-Path $root "popup.html") -Destination $stagingDir
	Copy-Item -Path (Join-Path $root "version.json") -Destination $stagingDir

	Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $zipPath -CompressionLevel Optimal

	Write-Host "Built $zipName"
}
finally {
	Remove-Item $stagingDir -Recurse -Force
}
