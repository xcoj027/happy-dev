const { spawnSync } = require('node:child_process');
const { root, cargoTargetDir } = require('./build-paths.cjs');

const result = spawnSync(process.execPath, [require.resolve('@tauri-apps/cli/tauri.js'), ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, CARGO_TARGET_DIR: cargoTargetDir },
});
if (result.error) throw result.error;
process.exit(result.status || (result.signal ? 1 : 0));
