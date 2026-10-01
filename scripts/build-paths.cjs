const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cacheBase = process.platform === 'darwin'
  ? path.join(os.homedir(), 'Library', 'Caches')
  : process.platform === 'win32'
    ? process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    : process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
const managedTargetDir = path.join(cacheBase, 'HappyDev', 'tauri');
const cargoTargetDir = process.env.CARGO_TARGET_DIR
  ? path.resolve(root, process.env.CARGO_TARGET_DIR)
  : managedTargetDir;

module.exports = { root, managedTargetDir, cargoTargetDir };
