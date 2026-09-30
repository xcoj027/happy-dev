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
  const [tokenCount, setTokenCount] = useState(5);
  const [customChars, setCustomChars] = useState('');

  // Passphrase options
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [includeNumber, setIncludeNumber] = useState(true);
  const [caseFormat, setCaseFormat] = useState<'lower' | 'upper' | 'title'>('lower');
  const [passphraseCount, setPassphraseCount] = useState(5);

  // Bytes options
  const [byteLength, setByteLength] = useState(16);
  const [byteFormat, setByteFormat] = useState<'hex' | 'base64' | 'uint8' | 'decimal'>('hex');
  const [byteCount, setByteCount] = useState(5);

  // Number options
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);
  const [numCount, setNumCount] = useState(5);
  const [isFloat, setIsFloat] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [uniqueNumbers, setUniqueNumbers] = useState(false);

  // Network options
  const [networkType, setNetworkType] = useState<'ipv4' | 'ipv6' | 'mac' | 'port'>('ipv4');
  const [networkCount, setNetworkCount] = useState(5);

  // Generated outputs
  const [results, setResults] = useState<string[]>([]);

  // Generation functions
  const generateSecureRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const handleGenerate = () => {
    const out: string[] = [];

    if (activeTab === 'tokens') {
      let chars = '';
      if (tokenType === 'alphanumeric') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      else if (tokenType === 'alpha') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      else if (tokenType === 'numeric') chars = '0123456789';
      else if (tokenType === 'hex') chars = '0123456789abcdef';
      else if (tokenType === 'urlsafe') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      else chars = customChars || '0123456789';

      for (let c = 0; c < tokenCount; c++) {
        let str = '';
        for (let i = 0; i < tokenLength; i++) {
          str += chars[generateSecureRandomInt(chars.length)];
        }
        out.push(str);
      }
    } else if (activeTab === 'passphrase') {
      for (let c = 0; c < passphraseCount; c++) {
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
        out.push(words.join(separator));
      }
    } else if (activeTab === 'bytes') {
      for (let c = 0; c < byteCount; c++) {
        const bytes = new Uint8Array(byteLength);
        window.crypto.getRandomValues(bytes);

        if (byteFormat === 'hex') {
          out.push(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        } else if (byteFormat === 'base64') {
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          out.push(window.btoa(binary));
        } else if (byteFormat === 'uint8') {
          out.push(`new Uint8Array([${Array.from(bytes).join(', ')}])`);
        } else {
          out.push(`[${Array.from(bytes).join(', ')}]`);
        }
      }
    } else if (activeTab === 'numbers') {
      const min = Math.min(minNum, maxNum);
      const max = Math.max(minNum, maxNum);
      const range = max - min + 1;

      if (uniqueNumbers && !isFloat) {
        const available = Array.from({ length: range }, (_, i) => min + i);
        // Fisher-Yates shuffle
        for (let i = available.length - 1; i > 0; i--) {
          const j = generateSecureRandomInt(i + 1);
          [available[i], available[j]] = [available[j], available[i]];
        }
        const picked = available.slice(0, Math.min(numCount, available.length));
        out.push(...picked.map(String));
      } else {
        for (let c = 0; c < numCount; c++) {
          if (isFloat) {
            const rand = min + (window.crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) * (max - min);
            out.push(rand.toFixed(decimalPlaces));
          } else {
            const rand = min + generateSecureRandomInt(range);
            out.push(rand.toString());
          }
        }
      }
    } else if (activeTab === 'network') {
      for (let c = 0; c < networkCount; c++) {
        if (networkType === 'ipv4') {
          const b = new Uint8Array(4);
          window.crypto.getRandomValues(b);
          // Avoid 0.x.x.x
          if (b[0] === 0) b[0] = 10;
          out.push(`${b[0]}.${b[1]}.${b[2]}.${b[3]}`);
        } else if (networkType === 'ipv6') {
          const b = new Uint16Array(8);
          window.crypto.getRandomValues(b);
          out.push(Array.from(b).map(n => n.toString(16).padStart(4, '0')).join(':'));
        } else if (networkType === 'mac') {
          const b = new Uint8Array(6);
          window.crypto.getRandomValues(b);
          // Set unicast & locally administered
          b[0] = (b[0] & 0xfe) | 0x02;
          out.push(Array.from(b).map(n => n.toString(16).padStart(2, '0')).join(':'));
        } else {
          // Port
          const port = 1024 + generateSecureRandomInt(65535 - 1024 + 1);
          out.push(port.toString());
        }
      }
    } else if (activeTab === 'colors') {
      for (let c = 0; c < 6; c++) {
        const r = generateSecureRandomInt(256);
        const g = generateSecureRandomInt(256);
        const b = generateSecureRandomInt(256);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        out.push(`${hex} | rgb(${r}, ${g}, ${b})`);
      }
    } else if (activeTab === 'dates') {
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      for (let c = 0; c < 5; c++) {
        const offset = (generateSecureRandomInt(oneYearMs * 2)) - oneYearMs;
        const d = new Date(now + offset);
        out.push(`${d.toISOString()} (Epoch: ${d.getTime()})`);
      }
    }

    setResults(out);
  };

  React.useEffect(() => {
    handleGenerate();
  }, [
    activeTab,
    tokenType,
    tokenLength,
    tokenCount,
    customChars,
    wordCount,
    separator,
    includeNumber,
    caseFormat,
    passphraseCount,
    byteLength,
    byteFormat,
    byteCount,
    minNum,
    maxNum,
    numCount,
    isFloat,
    decimalPlaces,
    uniqueNumbers,
    networkType,
    networkCount
  ]);

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Quantity: {tokenCount}</label>
              <input
                type="range"
                min={1}
                max={25}
                value={tokenCount}
                onChange={(e) => setTokenCount(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>
            {tokenType === 'custom' && (
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Custom Characters</label>
                <input
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                Append random number
              </label>
            </div>
          </div>
        )}

        {activeTab === 'bytes' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
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
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Quantity: {byteCount}</label>
              <input
                type="range"
                min={1}
                max={20}
                value={byteCount}
                onChange={(e) => setByteCount(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Quantity: {numCount}</label>
              <input
                type="number"
                min={1}
                max={100}
                value={numCount}
                onChange={(e) => setNumCount(Number(e.target.value))}
                className="input-3d w-full px-2.5 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={uniqueNumbers}
                  onChange={(e) => setUniqueNumbers(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Unique</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={isFloat}
                  onChange={(e) => setIsFloat(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Decimals</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
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
            <div>
              <label className="text-[var(--text-secondary)] block mb-1">Quantity: {networkCount}</label>
              <input
                type="range"
                min={1}
                max={25}
                value={networkCount}
                onChange={(e) => setNetworkCount(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
            <span>Generate New Values</span>
          </button>
          {results.length > 0 && (
            <CopyButton text={results.join('\n')} label="Copy All Values" />
          )}
        </div>
      </div>

      {/* Results View */}
      <div className="card-3d p-4 rounded-xl flex-1 flex flex-col space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Generated Output ({results.length} items)</span>
        </div>
        <div className="well-3d p-3 rounded-xl flex-1 overflow-auto max-h-[380px] space-y-2 font-mono text-xs">
          {results.map((res, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[var(--control-panel-bg)] hover:bg-[var(--control-panel-bg)]/80 transition group"
            >
              <span className="text-[var(--text-primary)] truncate select-all">{res}</span>
              <CopyButton text={res} label="Copy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
