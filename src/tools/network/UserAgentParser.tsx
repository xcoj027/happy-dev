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

import React, { useState } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';
import { CopyButton } from '../../components/common/CopyButton';
import { Monitor, Cpu, Globe } from 'lucide-react';

export const UserAgentParser: React.FC = () => {
  const [ua, setUa] = useState('');

  // Pure offline regex user agent parser
  const parseUa = (str: string) => {
    if (!str.trim()) {
      return { browser: '—', version: '—', os: '—', engine: '—', device: '—' };
    }
    let browser = 'Unknown Browser';
    let version = '';
    let os = 'Unknown OS';
    let engine = 'Unknown Engine';
    let device = 'Desktop';

    // OS
    if (/macintosh|mac os x/i.test(str)) os = 'macOS';
    else if (/windows nt 10/i.test(str)) os = 'Windows 10 / 11';
    else if (/windows nt 6\.3/i.test(str)) os = 'Windows 8.1';
    else if (/windows nt 6\.1/i.test(str)) os = 'Windows 7';
    else if (/android/i.test(str)) { os = 'Android'; device = 'Mobile / Tablet'; }
    else if (/iphone|ipad|ipod/i.test(str)) { os = 'iOS'; device = /ipad/i.test(str) ? 'Tablet' : 'Mobile'; }
    else if (/linux/i.test(str)) os = 'Linux';

    // Browser & Engine
    if (/edg\/([0-9.]+)/i.test(str)) {
      browser = 'Microsoft Edge';
      version = str.match(/edg\/([0-9.]+)/i)?.[1] || '';
      engine = 'Blink';
    } else if (/chrome\/([0-9.]+)/i.test(str) && !/edg/i.test(str)) {
      browser = 'Google Chrome';
      version = str.match(/chrome\/([0-9.]+)/i)?.[1] || '';
      engine = 'Blink';
    } else if (/firefox\/([0-9.]+)/i.test(str)) {
      browser = 'Mozilla Firefox';
      version = str.match(/firefox\/([0-9.]+)/i)?.[1] || '';
      engine = 'Gecko';
    } else if (/safari\/([0-9.]+)/i.test(str) && !/chrome/i.test(str)) {
      browser = 'Apple Safari';
      version = str.match(/version\/([0-9.]+)/i)?.[1] || '';
      engine = 'WebKit';
    }

    return { browser, version, os, engine, device };
  };

  const info = parseUa(ua);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 card-3d rounded-xl">
        <span className="text-xs text-[var(--text-secondary)] font-medium">User-Agent Offline Inspector</span>
        <button
          type="button"
          onClick={() => setUa(navigator.userAgent)}
          className="btn-3d px-3 py-1.5 rounded-lg text-xs transition"
        >
          Use Current Device UA
        </button>
      </div>

      <CodeEditor
        label="User-Agent String"
        value={ua}
        onChange={setUa}
        minHeight="80px"
      />

      {/* Parsed Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-3 card-3d rounded-xl space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)]">Browser Name</span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{info.browser}</div>
          <div className="text-[11px] text-[var(--text-secondary)] font-mono">v{info.version || 'Unknown'}</div>
        </div>

        <div className="p-3 card-3d rounded-xl space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)]">Operating System</span>
          <div className="text-base font-bold text-cyan-600 dark:text-cyan-400">{info.os}</div>
          <div className="text-[11px] text-[var(--text-secondary)] font-mono">Device: {info.device}</div>
        </div>

        <div className="p-3 card-3d rounded-xl space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)]">Rendering Engine</span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{info.engine}</div>
        </div>
      </div>
    </div>
  );
};
