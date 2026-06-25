# Project Finder

A portable Windows application for quickly finding and opening project folders across network drives.

## Features

- Search projects by number across G:, J:, and R: drives
- Instant search with auto-detection of project number formats
- Recent projects list (last 5 opened)
- Keyboard shortcuts for quick navigation
- Modern Material UI interface

## Usage

1. Double-click `Project Finder.exe`
2. Select a drive from the dropdown (G:, J:, or R:)
3. Type a project number in the search field
4. Click a result to open the folder in Explorer

## Keyboard Shortcuts

- **Enter**: Open selected project
- **Escape**: Close application
- **Up/Down**: Navigate through results
- **Ctrl+G**: Switch to G: drive
- **Ctrl+J**: Switch to J: drive
- **Ctrl+R**: Switch to R: drive

## Project Number Formats

- **G: Drive**: NNNN-XX (e.g., 1002-27)
- **J: Drive (old)**: YYYY-NNN (e.g., 2020-001)
- **J: Drive (new)**: YY-NNNNN (e.g., 26-00041)
- **R: Drive**: NNNN-XX (e.g., 3459-200)

## Requirements

- Windows 10/11
- Network access to G:, J:, and R: drives (via company WiFi or VPN)

## Building from Source

```bash
npm install
npm run build
npm run dist
```

The portable .exe will be created in the `dist` folder.

`npm run dist` regenerates the bundled drive index (`npm run build:index`) and therefore **requires live access to the G:, J:, and R: shared drives** — run it on a machine connected to the company network. To package with the existing committed baseline instead (skipping re-indexing), use `npm run dist:skip-index`.
