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
import CryptoJS from 'crypto-js';
import { CodeEditor } from '../../components/common/CodeEditor';
import { CopyButton } from '../../components/common/CopyButton';
import { Key, Shield } from 'lucide-react';

export const HashGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [useHmac, setUseHmac] = useState(false);
  const [uppercase, setUppercase] = useState(false);

  const calculateHash = (algo: string) => {
    if (!text) return '';
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={useHmac}
            onChange={(e) => setUseHmac(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-0"
          />
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>Enable HMAC Key</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-0"
          />
          <span>Uppercase Hex</span>
        </label>
      </div>

      {useHmac && (
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <label className="text-xs text-gray-400 block mb-1">HMAC Secret Key</label>
          <input
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter secret HMAC key..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-200 outline-none focus:border-emerald-500"
          />
        </div>
      )}

      <CodeEditor
        label="Input Plaintext to Hash"
        value={text}
        onChange={setText}
        minHeight="100px"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {algos.map((algo) => {
          const val = calculateHash(algo.key);
          return (
            <div
              key={algo.name}
              className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl space-y-1 hover:border-gray-700 transition"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  {algo.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">{algo.bits}</span>
                  <CopyButton text={val} />
                </div>
              </div>
              <div className="font-mono text-xs text-emerald-400 break-all select-all pt-1">
                {val || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
