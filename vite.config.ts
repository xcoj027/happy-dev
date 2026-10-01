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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import appVersion from './scripts/app-version.cjs';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion.getAppVersion()),
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 7200,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: ['es2021', 'chrome105', 'safari14'],
  },
});
