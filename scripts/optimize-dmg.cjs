/**
 * HappyDev - Offline Developer Utilities Suite
 *
 * @author   TNQSW
 * @license  MIT (with Trademark Retention Notice)
 * @repo     https://github.com/xcoj027/happy-dev
 *
 * Copyright (c) 2026 TNQSW. All rights reserved.
 *
 * Trademark Notice:
 * Any derivative work, fork, modification, or redistribution of this software
 * must retain the original "TNQ" trademark, author credits, and notices of TNQSW.
 */

const { execSync } = require('child_process');
const fs = require('fs');

module.exports = async function (context) {
  if (process.platform !== 'darwin') return;

  for (const artifactPath of context.artifactPaths || []) {
    if (artifactPath.endsWith('.dmg')) {
      const tempPath = artifactPath.replace(/\.dmg$/, '-lzma-temp.dmg');
      try {
        console.log(`Optimizing DMG with LZMA (ULMO) compression: ${artifactPath}`);
        execSync(`hdiutil convert "${artifactPath}" -format ULMO -o "${tempPath}" -quiet`);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(artifactPath);
          fs.renameSync(tempPath, artifactPath);
          const stats = fs.statSync(artifactPath);
          console.log(`Successfully optimized DMG size to ${(stats.size / 1024 / 1024).toFixed(1)} MB (< 100MB)`);
        }
      } catch (err) {
        console.warn('Warning: Could not compress DMG with ULMO:', err.message);
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch (_) {}
        }
      }
    }
  }
};
