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
import { KeyRound, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const JwtDebugger: React.FC = () => {
  const [token, setToken] = useState('');

  let headerJson = '';
  let payloadJson = '';
  let signature = '';
  let expDate: Date | null = null;
  let isExpired = false;
  let error: string | null = null;
  let claims: { key: string; val: any }[] = [];

  const MAX_TOKEN_LENGTH = 50000;

  try {
    const trimmed = token.trim();
    if (trimmed.length > MAX_TOKEN_LENGTH) {
      error = `Token exceeds maximum supported length (${MAX_TOKEN_LENGTH.toLocaleString()} characters)`;
    } else if (trimmed) {
      const parts = trimmed.split('.');
      if (parts.length === 3) {
        const b64DecodeUnicode = (str: string) => {
          let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
          while (b64.length % 4) b64 += '=';
          try {
            return decodeURIComponent(
              atob(b64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
          } catch {
            return atob(b64);
          }
        };

        const headerObj = JSON.parse(b64DecodeUnicode(parts[0]));
        const payloadObj = JSON.parse(b64DecodeUnicode(parts[1]));
        signature = parts[2];

        headerJson = JSON.stringify(headerObj, null, 2);
        payloadJson = JSON.stringify(payloadObj, null, 2);

        if (payloadObj.exp && typeof payloadObj.exp === 'number') {
          expDate = new Date(payloadObj.exp * 1000);
          isExpired = expDate.getTime() < Date.now();
        }

        claims = Object.entries(payloadObj).map(([key, val]) => ({ key, val }));
      } else {
        error = 'A valid JWT must contain 3 dot-separated segments (header.payload.signature)';
      }
    }
  } catch (e: any) {
    error = e.message || 'Error decoding JWT segments';
  }

  return (
    <div className="space-y-4">
      <CodeEditor
        label="Raw Encoded JWT Token"
        value={token}
        onChange={setToken}
        minHeight="80px"
        placeholder="Paste eyJhbGciOi... JWT here"
      />

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-mono">
          {error}
        </div>
      )}

      {/* Expiry Banner */}
      {expDate && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isExpired
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              Token Expiration: <strong>{expDate.toUTCString()}</strong> ({expDate.toLocaleString()})
            </span>
          </div>
          <span className="font-semibold uppercase tracking-wider">
            {isExpired ? 'Expired' : 'Active / Valid'}
          </span>
        </div>
      )}

      {/* Decoded Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-rose-600 dark:text-rose-400">HEADER: Algorithm & Token Type</span>
            <CopyButton text={headerJson} />
          </div>
          <div className="p-3 well-3d rounded-xl font-mono text-xs text-rose-700 dark:text-rose-300 whitespace-pre overflow-auto max-h-[200px]">
            {headerJson || '// No header'}
          </div>
        </div>

        {/* Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">PAYLOAD: Data Claims</span>
            <CopyButton text={payloadJson} />
          </div>
          <div className="p-3 well-3d rounded-xl font-mono text-xs text-indigo-700 dark:text-indigo-300 whitespace-pre overflow-auto max-h-[200px]">
            {payloadJson || '// No payload'}
          </div>
        </div>
      </div>

      {/* Signature info */}
      <div className="p-3 card-3d rounded-xl space-y-1">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> SIGNATURE Segment
          </span>
          <CopyButton text={signature} />
        </div>
        <div className="font-mono text-xs text-cyan-800 dark:text-cyan-300/80 break-all select-all">
          {signature || '—'}
        </div>
      </div>
    </div>
  );
};
