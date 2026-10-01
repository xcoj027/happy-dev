const fs = require('node:fs');
const path = require('node:path');
const { managedTargetDir } = require('./build-paths.cjs');

const root = path.resolve(__dirname, '..');
const directories = ['src-tauri/target', 'src-tauri/gen/schemas', 'dist', 'node_modules/.vite'];
if (process.argv.includes('--all')) directories.push('node_modules', 'release');
for (const directory of directories) {
  fs.rmSync(path.join(root, directory), { recursive: true, force: true });
  console.log(`Cleaned ${directory}`);
}
fs.rmSync(managedTargetDir, { recursive: true, force: true });
console.log(`Cleaned Rust cache: ${managedTargetDir}`);
