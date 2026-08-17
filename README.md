# CustomTools for YouTube™

A Chrome extension that adds a set of quality-of-life fixes and tweaks to YouTube, toggleable from a single popup — no need to install and manage a pile of separate userscripts.

## Features

Toggle any of these on or off from the extension popup:

- **Clean UI** — strips out ads and clutter from the page for a cleaner viewing experience.
- **Redirect Shorts** — automatically redirects Shorts links to the regular watch page.
- **Suppress Live Chat** — keeps live chat running while preventing it from slowing down the page during high-traffic streams.
- **Allow Custom Loop** — loop any custom start/end time range on a video, not just the whole thing.
- **Player Auto Minimize** — automatically pops the video into Picture-in-Picture when scrolled away, and restores it when scrolled back.
- **Take Video Snapshot** — capture and download the current video frame as a PNG with one click.
- **Disable Auto Translation** — _(coming soon)_.

## Installation

1. Download the latest release zip from the [Releases](../../releases) page.
2. Unzip it somewhere on your computer.
3. Open `chrome://extensions` in Chrome (or any Chromium-based browser).
4. Enable **Developer mode** (top right).
5. Click **Load unpacked** and select the unzipped folder.

The extension icon will appear in your toolbar — click it to open the popup and toggle features on YouTube.

## Building from source

If you'd rather build the release zip yourself instead of downloading one:

```bash
# Windows (PowerShell)
./build.ps1

# Windows (Command Prompt)
build.bat

# macOS/Linux
./build.sh
```

Any of these produce a `CustomYTools_v{VersionNumber}.zip` containing just what's needed to load the extension, ready to be loaded as described above.

## Updating

The extension checks for updates automatically and will notify you in the popup (and on-page) when a newer version is available.

## Author

Made by [SamGun-Official](https://github.com/SamGun-Official).

## License

This extension is using MIT License. See more on [this license](https://github.com/SamGun-Official/CustomYTools/blob/main/LICENSE.md).
