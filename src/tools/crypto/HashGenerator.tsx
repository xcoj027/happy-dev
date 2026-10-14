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

import { TextInput } from '../../components/common/TextInput';
import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { CodeEditor } from '../../components/common/CodeEditor';
import { CopyButton } from '../../components/common/CopyButton';
import { Key, Shield } from 'lucide-react';

export const HashGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [useHmac, setUseHmac] = useState(false);
  const [uppercase, setUppercase] = useState(false);

  const MAX_HASH_INPUT = 500000;

  const calculateHash = (algo: string) => {
    if (!text) return '';
    if (text.length > MAX_HASH_INPUT) return 'Payload exceeds 500,000 characters limit';
    try {
      let hashObj;
      if (useHmac && hmacKey) {
        switch (algo) {
          case 'MD5': hashObj = CryptoJS.HmacMD5(text, hmacKey); break;
          case 'SHA1': hashObj = CryptoJS.HmacSHA1(text, hmacKey); break;
          case 'SHA256': hashObj = CryptoJS.HmacSHA256(text, hmacKey); break;
          case 'SHA384': hashObj = CryptoJS.HmacSHA384(text, hmacKey); break;
          case 'SHA512': hashObj = CryptoJS.HmacSHA512(text, hmacKey); break;
          case 'RIPEMD160': hashObj = CryptoJS.HmacRIPEMD160(text, hmacKey); break;
          default: return '';
        }
      } else {
        switch (algo) {
          case 'MD5': hashObj = CryptoJS.MD5(text); break;
          case 'SHA1': hashObj = CryptoJS.SHA1(text); break;
          case 'SHA256': hashObj = CryptoJS.SHA256(text); break;
          case 'SHA384': hashObj = CryptoJS.SHA384(text); break;
          case 'SHA512': hashObj = CryptoJS.SHA512(text); break;
          case 'RIPEMD160': hashObj = CryptoJS.RIPEMD160(text); break;
          default: return '';
        }
      }
      const res = hashObj.toString(CryptoJS.enc.Hex);
      return uppercase ? res.toUpperCase() : res.toLowerCase();
    } catch {
      return '';
    }
  };

  const algos = [
    { name: 'SHA-256', key: 'SHA256', bits: '256 bits / 64 hex' },
    { name: 'SHA-512', key: 'SHA512', bits: '512 bits / 128 hex' },
    { name: 'SHA-1', key: 'SHA1', bits: '160 bits / 40 hex' },
    { name: 'MD5', key: 'MD5', bits: '128 bits / 32 hex' },
    { name: 'SHA-384', key: 'SHA384', bits: '384 bits / 96 hex' },
    { name: 'RIPEMD-160', key: 'RIPEMD160', bits: '160 bits / 40 hex' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useHmac}
            onChange={(e) => setUseHmac(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <Key className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-medium">Enable HMAC Key</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span className="font-medium">Uppercase Hex</span>
        </label>
      </div>

      {useHmac && (
        <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1.5">
          <label className="text-xs font-medium text-slate-700 block">HMAC Secret Key</label>
          <TextInput
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter secret HMAC key..."
            className="w-full input-3d rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 outline-none"
          />
        </div>
      )}

      <CodeEditor
        label="Input Plaintext to Hash"
        value={text}
        onChange={setText}
        minHeight="110px"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {algos.map((algo) => {
          const val = calculateHash(algo.key);
          return (
            <div
              key={algo.name}
              className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-1.5 transition hover:border-slate-300 hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  {algo.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-100">{algo.bits}</span>
                  <CopyButton text={val} />
                </div>
              </div>
              <div className="font-mono text-xs text-emerald-700 break-all select-all pt-1 bg-slate-50 border border-slate-100 rounded-lg p-2">
                {val || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
