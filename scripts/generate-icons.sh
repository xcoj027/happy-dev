#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

echo "Building transparent macOS icon..."
python3 "$PROJECT_ROOT/scripts/build-mac-icon.py"

TMP_DIR=$(mktemp -d)
ICONSET="$TMP_DIR/icons.iconset"
mkdir -p "$ICONSET"

MASTER_PNG="$PROJECT_ROOT/public/icon.png"

# Generate each size for iconset using high quality sips resampling
sips -z 16 16     "$MASTER_PNG" --out "$ICONSET/icon_16x16.png"
sips -z 32 32     "$MASTER_PNG" --out "$ICONSET/icon_16x16@2x.png"
sips -z 32 32     "$MASTER_PNG" --out "$ICONSET/icon_32x32.png"
sips -z 64 64     "$MASTER_PNG" --out "$ICONSET/icon_32x32@2x.png"
sips -z 128 128   "$MASTER_PNG" --out "$ICONSET/icon_128x128.png"
sips -z 256 256   "$MASTER_PNG" --out "$ICONSET/icon_128x128@2x.png"
sips -z 256 256   "$MASTER_PNG" --out "$ICONSET/icon_256x256.png"
sips -z 512 512   "$MASTER_PNG" --out "$ICONSET/icon_256x256@2x.png"
sips -z 512 512   "$MASTER_PNG" --out "$ICONSET/icon_512x512.png"
sips -z 1024 1024 "$MASTER_PNG" --out "$ICONSET/icon_512x512@2x.png"

# Build icon.icns
iconutil -c icns "$ICONSET" -o "$TMP_DIR/icon.icns"

# Copy to destinations
cp "$TMP_DIR/icon.icns" "$PROJECT_ROOT/public/icon.icns"
mkdir -p "$PROJECT_ROOT/electron/assets"
cp "$TMP_DIR/icon.icns" "$PROJECT_ROOT/electron/assets/icon.icns"

if [ -d "$PROJECT_ROOT/dist" ]; then
  cp "$TMP_DIR/icon.icns" "$PROJECT_ROOT/dist/icon.icns"
fi

# Copy into built app bundle if present
APP_RESOURCES="$PROJECT_ROOT/release/1.0.0/mac-arm64/HappyDev.app/Contents/Resources"
if [ -d "$APP_RESOURCES" ]; then
  cp "$TMP_DIR/icon.icns" "$APP_RESOURCES/icon.icns"
  # Touch the app bundle to force macOS Finder / Dock icon cache refresh
  touch "$PROJECT_ROOT/release/1.0.0/mac-arm64/HappyDev.app"
fi

rm -rf "$TMP_DIR"
echo "macOS icons with transparency successfully generated!"
