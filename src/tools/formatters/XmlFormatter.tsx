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
import { AlertCircle } from 'lucide-react';

export const XmlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState<string | null>(null);

  // Pure XML Beautifier algorithm
  const formatXml = (xml: string, tab: string) => {
    if (!xml.trim()) return '';
    let formatted = '';
    let indent = '';
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    const pad = 0;
    xml.split('\r\n').forEach((node) => {
      let indentDelta = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indentDelta = 0;
      } else if (node.match(/^<\/\w/)) {
        if (indent.length >= tab.length) {
          indent = indent.substring(tab.length);
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indentDelta = 1;
      } else {
        indentDelta = 0;
      }

      formatted += indent + node + '\r\n';
      if (indentDelta > 0) {
        indent += tab;
      }
    });
    return formatted.trim();
  };

  const minifyXml = (xml: string) => {
    return xml.replace(/>\s+</g, '><').trim();
  };

  let output = '';
  try {
    const tabStr = ' '.repeat(indentSize);
    output = formatXml(input, tabStr);
    if (error) setError(null);
  } catch (err: any) {
    output = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'XML formatting error');
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const tabStr = ' '.repeat(indentSize);
              setInput(formatXml(input, tabStr));
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            Beautify XML
          </button>
          <button
            type="button"
            onClick={() => setInput(minifyXml(input))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            Minify XML
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-300">
          <label className="flex items-center gap-1.5">
            <span>Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 outline-none"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[500px]">
        <CodeEditor
          label="XML Input"
          value={input}
          onChange={setInput}
          language="xml"
        />
        <CodeEditor
          label="Formatted XML Output"
          value={output}
          readOnly
          language="xml"
        />
      </div>
    </div>
  );
};
