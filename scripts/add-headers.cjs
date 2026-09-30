const fs = require('fs');
const path = require('path');

const HEADER = `/**
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
`;

const TARGET_DIRECTORIES = ['src', 'electron', 'scripts'];
const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.cjs', '.mjs', '.css'];
const STANDALONE_FILES = ['vite.config.ts'];

function getFiles(dir) {
  const fullDir = path.resolve(__dirname, '..', dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (TARGET_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already contains the copyright notice
  if (content.includes('xcoj027/happy-dev') && content.includes('TNQSW')) {
    return { path: filePath, skipped: true };
  }

  let newContent = '';

  if (content.startsWith('#!')) {
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex !== -1) {
      const shebang = content.slice(0, newlineIndex + 1);
      const rest = content.slice(newlineIndex + 1);
      newContent = `${shebang}\n${HEADER}\n${rest}`;
    } else {
      newContent = `${content}\n\n${HEADER}`;
    }
  } else {
    newContent = `${HEADER}\n${content}`;
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
  return { path: filePath, updated: true };
}

function main() {
  const allFiles = new Set();

  for (const dir of TARGET_DIRECTORIES) {
    for (const f of getFiles(dir)) {
      allFiles.add(f);
    }
  }

  for (const f of STANDALONE_FILES) {
    const p = path.resolve(__dirname, '..', f);
    if (fs.existsSync(p)) {
      allFiles.add(p);
    }
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const file of allFiles) {
    const rel = path.relative(path.resolve(__dirname, '..'), file);
    const result = processFile(file);
    if (result.updated) {
      console.log(`[UPDATED] ${rel}`);
      updatedCount++;
    } else {
      console.log(`[SKIPPED] ${rel} (already has header)`);
      skippedCount++;
    }
  }

  console.log(`\nCompleted! Updated: ${updatedCount}, Already had header: ${skippedCount}, Total: ${allFiles.size}`);
}

main();
