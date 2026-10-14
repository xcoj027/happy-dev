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
import { KeyRound, Clock } from 'lucide-react';

export const JwtDebugger: React.FC = () => {
  const [token, setToken] = useState('');

  let headerJson = '';
  let payloadJson = '';
  let signature = '';
  let expDate: Date | null = null;
  let isExpired = false;
  let error: string | null = null;

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
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-mono">
          {error}
        </div>
      )}

      {/* Expiry Banner */}
      {expDate && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isExpired
              ? 'bg-rose-50 border-rose-200/80 text-rose-700'
              : 'bg-emerald-50 border-emerald-200/80 text-emerald-700'
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
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-rose-700">HEADER: Algorithm & Token Type</span>
            <CopyButton text={headerJson} />
          </div>
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl font-mono text-xs text-rose-800 whitespace-pre overflow-auto max-h-[220px] shadow-2xs">
            {headerJson || '// No header'}
          </div>
        </div>

        {/* Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-indigo-700">PAYLOAD: Data Claims</span>
            <CopyButton text={payloadJson} />
          </div>
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl font-mono text-xs text-indigo-800 whitespace-pre overflow-auto max-h-[220px] shadow-2xs">
            {payloadJson || '// No payload'}
          </div>
        </div>
      </div>

      {/* Signature info */}
      <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-cyan-700 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> SIGNATURE Segment
          </span>
          <CopyButton text={signature} />
        </div>
        <div className="font-mono text-xs text-cyan-900 break-all select-all bg-cyan-50/60 border border-cyan-100 rounded-lg p-2.5">
          {signature || '—'}
        </div>
      </div>
    </div>
  );
};
