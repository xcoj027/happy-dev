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
import React, { useState, useEffect } from 'react';
import { CopyButton } from '../../components/common/CopyButton';
import { RefreshCw, Key, Shield, Hash, Network, Calendar, Palette } from 'lucide-react';

const WORD_LIST = [
  'apple', 'beach', 'cloud', 'delta', 'eagle', 'forest', 'galaxy', 'harbor',
  'island', 'jungle', 'knight', 'lemon', 'meadow', 'nebula', 'ocean', 'planet',
  'quantum', 'river', 'solar', 'tiger', 'ultra', 'vortex', 'whisper', 'xenon',
  'yellow', 'zenith', 'anchor', 'breeze', 'castle', 'desert', 'echo', 'falcon',
  'glacier', 'horizon', 'iceberg', 'journey', 'katana', 'lagoon', 'monarch', 'nova',
  'oasis', 'phantom', 'quartz', 'radar', 'shadow', 'thunder', 'utopia', 'valley',
  'willow', 'prism', 'summit', 'aurora', 'comet', 'drift', 'flame', 'spark'
];

type GeneratorTab = 'tokens' | 'passphrase' | 'bytes' | 'numbers' | 'network' | 'dates' | 'colors';

export const RandomGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>('tokens');

  // Token options
  const [tokenType, setTokenType] = useState<'alphanumeric' | 'alpha' | 'numeric' | 'hex' | 'urlsafe' | 'custom'>('alphanumeric');
  const [tokenLength, setTokenLength] = useState(32);
  const [customChars, setCustomChars] = useState('');

  // Passphrase options
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [includeNumber, setIncludeNumber] = useState(true);
  const [caseFormat, setCaseFormat] = useState<'lower' | 'upper' | 'title'>('lower');

  // Bytes options
  const [byteLength, setByteLength] = useState(16);
  const [byteFormat, setByteFormat] = useState<'hex' | 'base64' | 'uint8' | 'decimal'>('hex');

  // Number options
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);
  const [isFloat, setIsFloat] = useState(false);
  const decimalPlaces = 2;

  // Network options
  const [networkType, setNetworkType] = useState<'ipv4' | 'ipv6' | 'mac' | 'port'>('ipv4');

  // Single generated output
  const [result, setResult] = useState<string>('');

  // Generation helper
  const generateSecureRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const handleGenerate = () => {
    let out = '';

    if (activeTab === 'tokens') {
      let chars = '';
      if (tokenType === 'alphanumeric') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      else if (tokenType === 'alpha') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      else if (tokenType === 'numeric') chars = '0123456789';
      else if (tokenType === 'hex') chars = '0123456789abcdef';
      else if (tokenType === 'urlsafe') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      else chars = customChars || '0123456789';

      let str = '';
      for (let i = 0; i < tokenLength; i++) {
        str += chars[generateSecureRandomInt(chars.length)];
      }
      out = str;
    } else if (activeTab === 'passphrase') {
      const words: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        let word = WORD_LIST[generateSecureRandomInt(WORD_LIST.length)];
        if (caseFormat === 'upper') word = word.toUpperCase();
        else if (caseFormat === 'title') word = word.charAt(0).toUpperCase() + word.slice(1);
        words.push(word);
      }
      if (includeNumber) {
        const num = generateSecureRandomInt(100);
        words[words.length - 1] = `${words[words.length - 1]}${num}`;
      }
      out = words.join(separator);
    } else if (activeTab === 'bytes') {
      const bytes = new Uint8Array(byteLength);
      window.crypto.getRandomValues(bytes);

      if (byteFormat === 'hex') {
        out = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      } else if (byteFormat === 'base64') {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        out = window.btoa(binary);
      } else if (byteFormat === 'uint8') {
        out = `new Uint8Array([${Array.from(bytes).join(', ')}])`;
      } else {
        out = `[${Array.from(bytes).join(', ')}]`;
      }
    } else if (activeTab === 'numbers') {
      const min = Math.min(minNum, maxNum);
      const max = Math.max(minNum, maxNum);
      const range = max - min + 1;

      if (isFloat) {
        const rand = min + (window.crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) * (max - min);
        out = rand.toFixed(decimalPlaces);
      } else {
        const rand = min + generateSecureRandomInt(range);
        out = rand.toString();
      }
    } else if (activeTab === 'network') {
      if (networkType === 'ipv4') {
        const b = new Uint8Array(4);
        window.crypto.getRandomValues(b);
        if (b[0] === 0) b[0] = 10;
        out = `${b[0]}.${b[1]}.${b[2]}.${b[3]}`;
      } else if (networkType === 'ipv6') {
        const b = new Uint16Array(8);
        window.crypto.getRandomValues(b);
        out = Array.from(b).map(n => n.toString(16).padStart(4, '0')).join(':');
      } else if (networkType === 'mac') {
        const b = new Uint8Array(6);
        window.crypto.getRandomValues(b);
        b[0] = (b[0] & 0xfe) | 0x02;
        out = Array.from(b).map(n => n.toString(16).padStart(2, '0')).join(':');
      } else {
        const port = 1024 + generateSecureRandomInt(65535 - 1024 + 1);
        out = port.toString();
      }
    } else if (activeTab === 'colors') {
      const r = generateSecureRandomInt(256);
      const g = generateSecureRandomInt(256);
      const b = generateSecureRandomInt(256);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      out = `${hex} | rgb(${r}, ${g}, ${b})`;
    } else if (activeTab === 'dates') {
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const offset = (generateSecureRandomInt(oneYearMs * 2)) - oneYearMs;
      const d = new Date(now + offset);
      out = `${d.toISOString()} (Epoch: ${d.getTime()})`;
    }

    setResult(out);
  };

  useEffect(() => {
    handleGenerate();
  }, [
    activeTab,
    tokenType,
    tokenLength,
    customChars,
    wordCount,
    separator,
    includeNumber,
    caseFormat,
    byteLength,
    byteFormat,
    minNum,
    maxNum,
    isFloat,
    decimalPlaces,
    networkType,
  ]);

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('tokens')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'tokens' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-pink-400" />
          <span>Strings & Tokens</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('passphrase')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'passphrase' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Passphrases</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bytes')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'bytes' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cryptographic Bytes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('numbers')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'numbers' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-emerald-400" />
          <span>Random Numbers</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('network')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'network' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-sky-400" />
          <span>IP, MAC & Ports</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'colors' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          <span>Colors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dates')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeTab === 'dates' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-orange-400" />
          <span>Timestamps & Dates</span>
        </button>
      </div>

      {/* Configuration Box */}
      <div className="card-3d p-4 rounded-xl space-y-3">
        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Character Type</label>
              <select
                value={tokenType}
                onChange={(e) => setTokenType(e.target.value as any)}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="alpha">Alpha only (A-Z, a-z)</option>
                <option value="numeric">Numeric PIN (0-9)</option>
                <option value="hex">Hexadecimal (0-9, a-f)</option>
                <option value="urlsafe">URL-Safe (A-Z, a-z, 0-9, -, _)</option>
                <option value="custom">Custom Character Set</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Length: {tokenLength}</label>
              <input
                type="range"
                min={4}
                max={128}
                value={tokenLength}
                onChange={(e) => setTokenLength(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
            {tokenType === 'custom' && (
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Custom Characters</label>
                <TextInput
                  type="text"
                  value={customChars}
                  onChange={(e) => setCustomChars(e.target.value)}
                  placeholder="e.g. ABCDEF0123456789"
                  className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] font-mono outline-none"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'passphrase' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Word Count: {wordCount}</label>
              <input
                type="range"
                min={3}
                max={8}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Separator</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="-">Hyphen (-)</option>
                <option value=".">Dot (.)</option>
                <option value="_">Underscore (_)</option>
                <option value=" ">Space ( )</option>
                <option value="">None</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Case Style</label>
              <select
                value={caseFormat}
                onChange={(e) => setCaseFormat(e.target.value as any)}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="lower">lowercase</option>
                <option value="upper">UPPERCASE</option>
                <option value="title">TitleCase</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="incNum"
                checked={includeNumber}
                onChange={(e) => setIncludeNumber(e.target.checked)}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <label htmlFor="incNum" className="text-[var(--text-secondary)] cursor-pointer select-none">
                Append number
              </label>
            </div>
          </div>
        )}

        {activeTab === 'bytes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Byte Size: {byteLength} bytes ({byteLength * 8}-bit)</label>
              <select
                value={byteLength}
                onChange={(e) => setByteLength(Number(e.target.value))}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value={8}>8 bytes (64-bit)</option>
                <option value={16}>16 bytes (128-bit / AES-128)</option>
                <option value={24}>24 bytes (192-bit / AES-192)</option>
                <option value={32}>32 bytes (256-bit / AES-256 / SHA-256)</option>
                <option value={64}>64 bytes (512-bit / SHA-512)</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Encoding Format</label>
              <select
                value={byteFormat}
                onChange={(e) => setByteFormat(e.target.value as any)}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="hex">Hexadecimal string</option>
                <option value="base64">Base64 encoded</option>
                <option value="uint8">JavaScript Uint8Array</option>
                <option value="decimal">Raw decimal array [..]</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Minimum</label>
              <input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(Number(e.target.value))}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              />
            </div>
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Maximum</label>
              <input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(Number(e.target.value))}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={isFloat}
                  onChange={(e) => setIsFloat(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Decimals ({decimalPlaces} places)</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Identifier Type</label>
              <select
                value={networkType}
                onChange={(e) => setNetworkType(e.target.value as any)}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="ipv4">IPv4 Address (e.g. 192.168.1.1)</option>
                <option value="ipv6">IPv6 Address (128-bit hex)</option>
                <option value="mac">MAC Hardware Address</option>
                <option value="port">Port Number (1024 - 65535)</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-3d flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
            <span>Generate Value</span>
          </button>
        </div>
      </div>

      {/* Result View */}
      <div className="card-3d p-4 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">Generated Value</span>
          <CopyButton text={result} />
        </div>
        <div className="flex items-center justify-between p-3.5 well-3d rounded-xl">
          <span className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all break-all pr-2">
            {result}
          </span>
        </div>
      </div>
    </div>
  );
};
