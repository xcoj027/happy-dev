const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { getAppVersion } = require('./app-version.cjs');
const { cargoTargetDir } = require('./build-paths.cjs');

const root = path.resolve(__dirname, '..');
const platform = process.argv[2] || { darwin: 'macos', win32: 'windows', linux: 'linux' }[process.platform];
const local = process.argv.includes('--local');
const shouldOpen = process.argv.includes('--open');
const settings = {
  macos: { target: 'universal-apple-darwin', bundle: 'dmg', extension: '.dmg', suffix: 'mac-universal' },
  windows: { target: 'x86_64-pc-windows-msvc', bundle: 'nsis', extension: '.exe', suffix: 'windows-x64-setup' },
  linux: { target: 'x86_64-unknown-linux-gnu', bundle: 'appimage', extension: '.AppImage', suffix: 'linux-x64' },
}[platform];
if (!settings || (local && platform !== 'macos')) {
  throw new Error('Choose macos, windows, or linux. --local is only supported for the macOS app bundle.');
}

const version = getAppVersion();
const bundleRoot = path.join(cargoTargetDir, ...(local ? [] : [settings.target]), 'release', 'bundle');
const bundles = local ? 'app' : platform === 'macos' ? 'app,dmg' : settings.bundle;
const args = ['build', '--ci', '--bundles', bundles];
if (!local) args.push('--target', settings.target);
const overrides = {};
// Keep native numeric metadata valid while advancing release upgrade versions.
if (version !== 'local') {
  const number = Number(version.slice(2));
  if (!Number.isSafeInteger(number) || number > 65535) throw new Error('Release number exceeds native installer limits.');
  overrides.version = `1.0.${number}`;
}
if (platform === 'macos' && process.env.APPLE_SIGNING_IDENTITY) {
  overrides.bundle = { macOS: { signingIdentity: process.env.APPLE_SIGNING_IDENTITY } };
}
if (Object.keys(overrides).length) args.push('--config', JSON.stringify(overrides));
args.push('--', '--locked');
// Previous versions must not be mistaken for this build's installer.
if (!local) fs.rmSync(path.join(bundleRoot, settings.bundle), { recursive: true, force: true });
const cli = require.resolve('@tauri-apps/cli/tauri.js');
const result = spawnSync(process.execPath, [cli, ...args], {
  cwd: root,
  stdio: 'inherit',
  // Avoid Finder automation and interactive prompts during DMG creation.
  env: { ...process.env, CI: 'true', CARGO_TARGET_DIR: cargoTargetDir },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

if (local) {
  if (shouldOpen) {
    const opened = spawnSync('open', [path.join(bundleRoot, 'macos', 'HappyDev.app')], { stdio: 'inherit' });
    if (opened.status !== 0) process.exit(opened.status || 1);
  }
  process.exit(0);
}

const installers = fs.readdirSync(path.join(bundleRoot, settings.bundle))
  .filter((name) => name.endsWith(settings.extension));
if (installers.length !== 1) throw new Error(`Expected one ${settings.bundle} installer, found ${installers.length}.`);
const source = path.join(bundleRoot, settings.bundle, installers[0]);
const size = fs.statSync(source).size;
if (size >= 100_000_000) throw new Error(`Installer is ${(size / 1_000_000).toFixed(1)} MB; it must be below 100 MB.`);
const output = path.join(root, 'release', 'tauri', version);
fs.mkdirSync(output, { recursive: true });
const destination = path.join(output, `HappyDev-${version}-${settings.suffix}${settings.extension}`);
fs.copyFileSync(source, destination);
// Keep one output version instead of accumulating old release installers.
for (const entry of fs.readdirSync(path.dirname(output), { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name !== version && /^(local|v\.[1-9]\d*)$/.test(entry.name)) {
    fs.rmSync(path.join(path.dirname(output), entry.name), { recursive: true, force: true });
  }
}
console.log(`Installer: ${destination} (${(size / 1_000_000).toFixed(1)} MB)`);
