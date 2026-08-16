#!/usr/bin/env bash
# Builds CustomYTools.zip containing only the files needed to load/publish the extension.
# Includes: /scripts, /src (except src/css/app.css), config.json, manifest.json, popup.html, version.json

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
manifest_version="$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$root/manifest.json" | head -1 | sed -E 's/.*"([^"]+)"$/\1/')"
zip_name="CustomYTools_v${manifest_version}.zip"
zip_path="$root/$zip_name"
staging_dir="$(mktemp -d)"

cleanup() {
	rm -rf "$staging_dir"
}
trap cleanup EXIT

rm -f "$zip_path"

cp -R "$root/scripts" "$staging_dir/scripts"
cp -R "$root/src" "$staging_dir/src"

rm -f "$staging_dir/src/css/app.css"

cp "$root/config.json" "$staging_dir/"
cp "$root/manifest.json" "$staging_dir/"
cp "$root/popup.html" "$staging_dir/"
cp "$root/version.json" "$staging_dir/"

(cd "$staging_dir" && zip -r -X -q "$zip_path" .)

echo "Built $zip_name"
