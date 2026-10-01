#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# The checked-in PNG is the master; generate only the required desktop assets.
npx tauri icon public/icon.png --output src-tauri/icons
node <<'JS'
const fs = require('node:fs');
const path = require('node:path');
const directory = 'src-tauri/icons';
const keep = new Set(['32x32.png', '128x128.png', '128x128@2x.png', 'icon.icns', 'icon.ico']);
for (const name of fs.readdirSync(directory)) {
  if (!keep.has(name)) fs.rmSync(path.join(directory, name), { recursive: true, force: true });
}
JS
