const { execFileSync } = require('node:child_process');
const path = require('node:path');

function getAppVersion() {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  }).trim();
  if (!/^[0-9a-f]{40,64}$/.test(commit)) {
    throw new Error('Cannot determine the app version from Git HEAD.');
  }
  return commit.slice(-6);
}

module.exports = { getAppVersion };
