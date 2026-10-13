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
import CryptoJS from 'crypto-js';
import { CodeEditor } from '../../components/common/CodeEditor';
import { Lock, Unlock, AlertCircle, RefreshCw } from 'lucide-react';

type AesMode = 'CBC' | 'CTR' | 'CFB' | 'OFB' | 'ECB';
type AesPadding = 'Pkcs7' | 'Iso97971' | 'AnsiX923' | 'Iso10126' | 'ZeroPadding' | 'NoPadding';
type KeyEncoding = 'utf8' | 'hex' | 'base64';
type OutputFormat = 'base64' | 'hex';

export const AesEncryptor: React.FC = () => {
  const [direction, setDirection] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cipherMode, setCipherMode] = useState<AesMode>('CBC');
  const [padding, setPadding] = useState<AesPadding>('Pkcs7');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64');

  const [keyEncoding, setKeyEncoding] = useState<KeyEncoding>('utf8');
  const [key, setKey] = useState('');
  const [keyBits, setKeyBits] = useState<128 | 192 | 256>(256);

  const [ivEncoding, setIvEncoding] = useState<KeyEncoding>('hex');
  const [iv, setIv] = useState('');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Generate random Key
  const generateRandomKey = (bits: 128 | 192 | 256) => {
    const bytes = bits / 8;
    const array = new Uint8Array(bytes);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    if (keyEncoding === 'hex') {
      setKey(hex);
    } else if (keyEncoding === 'base64') {
      let bin = '';
      for (let i = 0; i < array.length; i++) bin += String.fromCharCode(array[i]);
      setKey(window.btoa(bin));
    } else {
      setKey(hex.slice(0, bytes));
    }
  };

  // Generate random 16-byte IV
  const generateRandomIv = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    if (ivEncoding === 'hex') {
      setIv(hex);
    } else if (ivEncoding === 'base64') {
      let bin = '';
      for (let i = 0; i < array.length; i++) bin += String.fromCharCode(array[i]);
      setIv(window.btoa(bin));
    } else {
      setIv(hex.slice(0, 16));
    }
  };

  // Parse CryptoJS mode & padding
  const getCryptoMode = (m: AesMode) => {
    switch (m) {
      case 'CBC': return CryptoJS.mode.CBC;
      case 'CTR': return CryptoJS.mode.CTR;
      case 'CFB': return CryptoJS.mode.CFB;
      case 'OFB': return CryptoJS.mode.OFB;
      case 'ECB': return CryptoJS.mode.ECB;
      default: return CryptoJS.mode.CBC;
    }
  };

  const getCryptoPadding = (p: AesPadding) => {
    switch (p) {
      case 'Pkcs7': return CryptoJS.pad.Pkcs7;
      case 'Iso97971': return CryptoJS.pad.Iso97971;
      case 'AnsiX923': return CryptoJS.pad.AnsiX923;
      case 'Iso10126': return CryptoJS.pad.Iso10126;
      case 'ZeroPadding': return CryptoJS.pad.ZeroPadding;
      case 'NoPadding': return CryptoJS.pad.NoPadding;
      default: return CryptoJS.pad.Pkcs7;
    }
  };

  const parseWordInput = (str: string, enc: KeyEncoding) => {
    if (enc === 'hex') return CryptoJS.enc.Hex.parse(str.replace(/\s+/g, ''));
    if (enc === 'base64') return CryptoJS.enc.Base64.parse(str.trim());
    return CryptoJS.enc.Utf8.parse(str);
  };

  const handleProcess = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    if (!key.trim()) {
      setError('Secret Key is required');
      setOutput('');
      return;
    }

    try {
      const parsedKey = parseWordInput(key, keyEncoding);
      const options: any = {
        mode: getCryptoMode(cipherMode),
        padding: getCryptoPadding(padding),
      };

      if (cipherMode !== 'ECB') {
        if (!iv.trim()) {
          setError(`IV (Initialization Vector) is required for ${cipherMode} mode`);
          setOutput('');
          return;
        }
        options.iv = parseWordInput(iv, ivEncoding);
      }

      if (direction === 'encrypt') {
        const encrypted = CryptoJS.AES.encrypt(input, parsedKey, options);
        if (outputFormat === 'hex') {
          setOutput(encrypted.ciphertext.toString(CryptoJS.enc.Hex));
        } else {
          setOutput(encrypted.toString());
        }
      } else {
        // Decrypt
        let cipherParams: any;
        if (outputFormat === 'hex' || /^[0-9a-fA-F]+$/.test(input.trim()) && input.trim().length % 2 === 0) {
          const cipherBytes = CryptoJS.enc.Hex.parse(input.trim());
          cipherParams = { ciphertext: cipherBytes };
        } else {
          cipherParams = input.trim();
        }

        const decrypted = CryptoJS.AES.decrypt(cipherParams, parsedKey, options);
        const text = decrypted.toString(CryptoJS.enc.Utf8);
        if (!text && input.trim()) {
          throw new Error('Decryption resulted in empty or non-UTF8 output. Verify your Key, IV, Mode, and Padding.');
        }
        setOutput(text);
      }
    } catch (err: any) {
      setOutput('');
      setError(err.message || 'AES operation failed. Check cipher settings.');
    }
  };

  useEffect(() => {
    handleProcess();
  }, [direction, cipherMode, padding, outputFormat, key, keyEncoding, iv, ivEncoding, input]);

  return (
    <div className="flex-1 flex flex-col h-full space-y-4 min-h-[540px]">
      {/* Top Action & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDirection('encrypt')}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
              direction === 'encrypt' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypt Plaintext</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection('decrypt')}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer ${
              direction === 'decrypt' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Decrypt Ciphertext</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInput('');
              setOutput('');
              setError(null);
            }}
            className="btn-3d px-3.5 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-rose-400 cursor-pointer transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Advanced Cipher Settings Card */}
      <div className="card-3d p-5 sm:p-6 rounded-2xl space-y-5">
        {/* Cipher Mode & Output Format */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[var(--text-secondary)] font-medium block mb-1.5">Cipher Mode</label>
            <select
              value={cipherMode}
              onChange={(e) => setCipherMode(e.target.value as AesMode)}
              className="input-3d w-full px-3 py-2 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="CBC">CBC (Cipher Block Chaining)</option>
              <option value="CTR">CTR (Counter Mode)</option>
              <option value="CFB">CFB (Cipher Feedback)</option>
              <option value="OFB">OFB (Output Feedback)</option>
              <option value="ECB">ECB (Electronic Codebook - No IV)</option>
            </select>
          </div>
          <div>
            <label className="text-[var(--text-secondary)] font-medium block mb-1.5">Padding Scheme</label>
            <select
              value={padding}
              onChange={(e) => setPadding(e.target.value as AesPadding)}
              className="input-3d w-full px-3 py-2 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="Pkcs7">PKCS #7 (Default standard)</option>
              <option value="Iso97971">ISO / IEC 9797-1</option>
              <option value="AnsiX923">ANSI X.923</option>
              <option value="Iso10126">ISO 10126</option>
              <option value="ZeroPadding">Zero Padding</option>
              <option value="NoPadding">No Padding</option>
            </select>
          </div>
          <div>
            <label className="text-[var(--text-secondary)] font-medium block mb-1.5">Key Size</label>
            <select
              value={keyBits}
              onChange={(e) => setKeyBits(Number(e.target.value) as any)}
              className="input-3d w-full px-3 py-2 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value={128}>AES-128 (16 Bytes / 128 Bits)</option>
              <option value={192}>AES-192 (24 Bytes / 192 Bits)</option>
              <option value={256}>AES-256 (32 Bytes / 256 Bits)</option>
            </select>
          </div>
          <div>
            <label className="text-[var(--text-secondary)] font-medium block mb-1.5">Output / Cipher Format</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="input-3d w-full px-3 py-2 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="base64">Base64 (Standard)</option>
              <option value="hex">Hexadecimal</option>
            </select>
          </div>
        </div>

        {/* Key and IV Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] font-medium">Secret Key</span>
              <div className="flex items-center gap-2">
                <select
                  value={keyEncoding}
                  onChange={(e) => setKeyEncoding(e.target.value as KeyEncoding)}
                  className="input-3d px-2 py-1 rounded text-[11px] text-[var(--text-secondary)] outline-none"
                >
                  <option value="utf8">UTF-8 / Passphrase</option>
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                </select>
                <button
                  type="button"
                  onClick={() => generateRandomKey(keyBits)}
                  className="text-amber-500 hover:text-amber-400 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition"
                  title="Generate Cryptographic Random Key"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Gen Key</span>
                </button>
              </div>
            </div>
            <TextInput
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={`Enter or generate ${keyBits}-bit secret key...`}
              className="input-3d w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* IV Input */}
          {cipherMode !== 'ECB' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Initialization Vector (IV - 16 bytes)</span>
                <div className="flex items-center gap-2">
                  <select
                    value={ivEncoding}
                    onChange={(e) => setIvEncoding(e.target.value as KeyEncoding)}
                    className="input-3d px-2 py-1 rounded text-[11px] text-[var(--text-secondary)] outline-none"
                  >
                    <option value="hex">Hex (32 chars)</option>
                    <option value="base64">Base64 (24 chars)</option>
                    <option value="utf8">UTF-8 (16 chars)</option>
                  </select>
                  <button
                    type="button"
                    onClick={generateRandomIv}
                    className="text-amber-500 hover:text-amber-400 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition"
                    title="Generate Random 16-byte IV"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Gen IV</span>
                  </button>
                </div>
              </div>
              <TextInput
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder="Enter or generate 16-byte initialization vector..."
                className="input-3d w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 rounded-xl bg-[var(--control-panel-bg)] text-xs text-[var(--text-muted)] italic">
              ECB mode does not utilize an Initialization Vector (IV).
            </div>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Code Editor Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[420px]">
        <CodeEditor
          label={direction === 'encrypt' ? 'Plaintext to Encrypt' : `Ciphertext to Decrypt (${outputFormat.toUpperCase()})`}
          value={input}
          onChange={setInput}
          placeholder={direction === 'encrypt' ? 'Enter text to encrypt...' : 'Enter encrypted ciphertext...'}
        />
        <CodeEditor
          label={direction === 'encrypt' ? `AES Encrypted Ciphertext (${outputFormat.toUpperCase()})` : 'Decrypted Plaintext'}
          value={output}
          readOnly
          placeholder="Cipher output will appear here automatically..."
        />
      </div>
    </div>
  );
};

