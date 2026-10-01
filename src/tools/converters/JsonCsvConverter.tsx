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

export const JsonCsvConverter: React.FC = () => {
  const [direction, setDirection] = useState<'json2csv' | 'csv2json'>('json2csv');
  const [delimiter, setDelimiter] = useState<',' | '\t' | ';'>(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Helper to parse CSV to JSON
  const parseCsvToJson = (csvText: string, sep: string, header: boolean) => {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (!lines.length) return '[]';

    const parseLine = (line: string) => {
      // Basic quoted CSV line parser
      const row: string[] = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === sep && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += c;
        }
      }
      row.push(current.trim());
      return row;
    };

    if (header) {
      const headers = parseLine(lines[0]);
      const data = lines.slice(1).map(l => {
        const values = parseLine(l);
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          let val: any = values[idx] ?? '';
          if (val === 'true') val = true;
          else if (val === 'false') val = false;
          else if (!isNaN(Number(val)) && val !== '') val = Number(val);
          obj[h] = val;
        });
        return obj;
      });
      return JSON.stringify(data, null, 2);
    } else {
      const data = lines.map(l => parseLine(l));
      return JSON.stringify(data, null, 2);
    }
  };

  // Helper to convert JSON to CSV
  const parseJsonToCsv = (jsonText: string, sep: string, header: boolean) => {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error('Input must be a JSON array of objects or rows');
    }
    if (!parsed.length) return '';

    const isObjectArray = typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0]);
    if (isObjectArray) {
      const keys = Array.from(new Set(parsed.flatMap(obj => Object.keys(obj))));
      const lines: string[] = [];
      if (header) {
        lines.push(keys.map(k => `"${k.replace(/"/g, '""')}"`).join(sep));
      }
      parsed.forEach(item => {
        const row = keys.map(k => {
          const val = item[k] === null || item[k] === undefined ? '' : String(item[k]);
          return `"${val.replace(/"/g, '""')}"`;
        });
        lines.push(row.join(sep));
      });
      return lines.join('\n');
    } else {
      // Array of arrays
      return parsed
        .map(row => (Array.isArray(row) ? row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(sep) : String(row)))
        .join('\n');
    }
  };

  let output = '';
  try {
    if (!input.trim()) {
      output = '';
      if (error) setError(null);
    } else if (direction === 'json2csv') {
      output = parseJsonToCsv(input, delimiter, hasHeader);
      if (error) setError(null);
    } else {
      output = parseCsvToJson(input, delimiter, hasHeader);
      if (error) setError(null);
    }
  } catch (err: any) {
    output = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'Conversion error');
    }
  }


  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Controls Bar - Streamlined with 3D buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection('json2csv')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'json2csv' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            JSON → CSV
          </button>
          <button
            type="button"
            onClick={() => setDirection('csv2json')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'csv2json' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            CSV → JSON
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-1.5">
            <span>Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as any)}
              className="bg-[var(--control-input-bg)] border border-[var(--control-input-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value=",">Comma (,)</option>
              <option value="&#9;">Tab (TSV)</option>
              <option value=";">Semicolon (;)</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded bg-[var(--control-input-bg)] border border-[var(--control-input-border)] text-emerald-500"
            />
            <span>First row as Header</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[500px]">
        <CodeEditor
          label={direction === 'json2csv' ? 'JSON Array Input' : 'CSV Text Input'}
          value={input}
          onChange={setInput}
          language={direction === 'json2csv' ? 'json' : 'csv'}
        />
        <CodeEditor
          label={direction === 'json2csv' ? 'CSV Output' : 'JSON Array Output'}
          value={output}
          readOnly
          language={direction === 'json2csv' ? 'csv' : 'json'}
        />
      </div>
    </div>
  );
};
