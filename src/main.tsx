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

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ScreenshotOverlay } from './components/screenshot/ScreenshotOverlay';
import './index.css';

const isScreenshotWindow =
  typeof window !== 'undefined' &&
  (window.location.search.includes('window=screenshot-overlay') ||
    window.location.hash.includes('screenshot-overlay'));

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isScreenshotWindow ? <ScreenshotOverlay /> : <App />}
  </React.StrictMode>
);
