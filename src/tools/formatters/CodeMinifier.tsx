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
import { Gauge } from 'lucide-react';

export const CodeMinifier: React.FC = () => {
  const [lang, setLang] = useState<'javascript' | 'css' | 'html'>('javascript');
  const [input, setInput] = useState('');

  const MAX_INPUT_LENGTH = 500000;

  const minifyCode = (code: string, type: 'javascript' | 'css' | 'html') => {
    if (!code.trim()) return '';
    if (code.length > MAX_INPUT_LENGTH) {
      return `/* Error: Code exceeds maximum supported size of ${MAX_INPUT_LENGTH.toLocaleString()} characters */`;
    }

    if (type === 'css') {
      return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .replace(/\s+/g, ' ') // collapse whitespaces
        .replace(/\s*([\{\}:;,])\s*/g, '$1') // remove spacing around selectors/brackets
        .replace(/;}/g, '}') // remove trailing semicolon
        .trim();
    }

    if (type === 'html') {
      return code
        .replace(/<!--[\s\S]*?-->/g, '') // remove comments
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    }

    // Basic safe JS minifier (strip single & multi line comments and collapse whitespace)
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .replace(/\/\/.*$/gm, '') // remove line comments
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s*([=+\-*/%&|^!<>?:;,{}()[\]])\s*/g, '$1')
      .replace(/;}/g, '}');
  };

  const output = minifyCode(input, lang);

  const origSize = new TextEncoder().encode(input).length;
  const minSize = new TextEncoder().encode(output).length;
  const savings = origSize > 0 ? (((origSize - minSize) / origSize) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-2">
          {(['javascript', 'css', 'html'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setLang(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition uppercase ${
                lang === t
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'btn-3d text-[var(--text-secondary)]'
              }`}
            >
              {t === 'javascript' ? 'JavaScript' : t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 font-mono font-medium">
          <Gauge className="w-4 h-4 text-emerald-600" />
          <span>Saved {savings}% ({origSize.toLocaleString()}B → {minSize.toLocaleString()}B)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={`Source ${lang.toUpperCase()}`}
          value={input}
          onChange={setInput}
          language={lang}
        />
        <CodeEditor
          label="Minified Output (1 Line)"
          value={output}
          readOnly
          language={lang}
        />
      </div>
    </div>
  );
};
