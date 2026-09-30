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

import React, { useState, useMemo } from 'react';
import YAML from 'yaml';
import { CodeEditor } from '../../components/common/CodeEditor';
import {
  Settings2,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';

/**
 * Tokenize a dot-and-bracket path like "server.servlet.context-path" or "items[0].name"
 */
function parseKeyPath(key: string): (string | number)[] {
  const parts: (string | number)[] = [];
  const regex = /([^.[\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(key)) !== null) {
    if (match[1] !== undefined) {
      parts.push(match[1]);
    } else if (match[2] !== undefined) {
      parts.push(parseInt(match[2], 10));
    }
  }
  return parts;
}

/**
 * Infer boolean, number, or string from raw value
 */
function parsePrimitiveValue(val: string, inferTypes: boolean): any {
  if (!inferTypes) return val;
  const trimmed = val.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  // Number parsing (avoid leading zeroes like "0123" unless it's just "0")
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    if (trimmed.length === 1 || !trimmed.startsWith('0') || trimmed.startsWith('0.')) {
      const num = Number(trimmed);
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        return num;
      }
    }
  }
  return val;
}

/**
 * Recursively set value along a nested path in target
 */
function setDeep(target: any, path: (string | number)[], value: any) {
  let current = target;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    const isNextArray = typeof nextKey === 'number';

    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = isNextArray ? [] : {};
    }
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  current[lastKey] = value;
}

/**
 * Sort object keys recursively (A-Z)
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    for (const k of keys) {
      sorted[k] = sortObjectKeys(obj[k]);
    }
    return sorted;
  }
  return obj;
}

/**
 * Convert .properties string into YAML string
 */
function propertiesToYaml(
  propStr: string,
  options: { indent: number; sortKeys: boolean; inferTypes: boolean }
): string {
  const lines = propStr.split(/\r?\n/);
  const rootObj: Record<string, any> = {};

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) {
      continue;
    }

    // Support multiline with backslash
    while (line.endsWith('\\') && i + 1 < lines.length) {
      line = line.slice(0, -1).trim() + lines[++i].trim();
    }

    // Find delimiter: = or :
    const match = line.match(/^([^:=]+)[:=]\s*(.*)$/);
    if (!match) continue;

    const rawKey = match[1].trim();
    const rawVal = match[2];
    const parsedVal = parsePrimitiveValue(rawVal, options.inferTypes);
    const path = parseKeyPath(rawKey);

    if (path.length > 0) {
      setDeep(rootObj, path, parsedVal);
    }
  }

  const finalObj = options.sortKeys ? sortObjectKeys(rootObj) : rootObj;
  return YAML.stringify(finalObj, { indent: options.indent });
}

/**
 * Recursively flatten a nested object/array to properties lines
 */
function flattenToProperties(
  obj: any,
  options: { arrayFormat: 'bracket' | 'dot'; delimiter: string; sortKeys: boolean }
): string {
  const entries: { key: string; val: string }[] = [];

  function recurse(curr: any, prefix: string) {
    if (curr === null || curr === undefined) {
      if (prefix) entries.push({ key: prefix, val: '' });
      return;
    }

    if (Array.isArray(curr)) {
      if (curr.length === 0) {
        if (prefix) entries.push({ key: prefix, val: '' });
        return;
      }
      curr.forEach((item, idx) => {
        const itemKey =
          options.arrayFormat === 'bracket'
            ? `${prefix}[${idx}]`
            : prefix
            ? `${prefix}.${idx}`
            : `${idx}`;
        recurse(item, itemKey);
      });
    } else if (typeof curr === 'object') {
      const keys = Object.keys(curr);
      if (keys.length === 0) {
        if (prefix) entries.push({ key: prefix, val: '' });
        return;
      }
      for (const k of keys) {
        const newPrefix = prefix ? `${prefix}.${k}` : k;
        recurse(curr[k], newPrefix);
      }
    } else {
      // Primitive
      entries.push({ key: prefix, val: String(curr) });
    }
  }

  recurse(obj, '');

  if (options.sortKeys) {
    entries.sort((a, b) => a.key.localeCompare(b.key));
  }

  return entries.map((e) => `${e.key}${options.delimiter}${e.val}`).join('\n');
}

/**
 * Convert YAML string to .properties string
 */
function yamlToProperties(
  yamlStr: string,
  options: { arrayFormat: 'bracket' | 'dot'; delimiter: string; sortKeys: boolean }
): string {
  const parsed = YAML.parse(yamlStr);
  if (parsed === null || parsed === undefined) {
    return '';
  }
  return flattenToProperties(parsed, options);
}

export interface PropertiesYamlConverterProps {
  initialDirection?: 'prop2yaml' | 'yaml2prop';
}

export const PropertiesYamlConverter: React.FC<PropertiesYamlConverterProps> = ({
  initialDirection = 'prop2yaml',
}) => {
  const [direction, setDirection] = useState<'prop2yaml' | 'yaml2prop'>(initialDirection);
  const [input, setInput] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [inferTypes, setInferTypes] = useState<boolean>(true);
  const [arrayFormat, setArrayFormat] = useState<'bracket' | 'dot'>('bracket');
  const [delimiter, setDelimiter] = useState<string>('=');

  // Convert on the fly
  const { output, error } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null };
    }
    try {
      if (direction === 'prop2yaml') {
        const result = propertiesToYaml(input, { indent, sortKeys, inferTypes });
        return { output: result, error: null };
      } else {
        const result = yamlToProperties(input, { arrayFormat, delimiter, sortKeys });
        return { output: result, error: null };
      }
    } catch (err: any) {
      return { output: '', error: err.message || 'Syntax parsing error' };
    }
  }, [input, direction, indent, sortKeys, inferTypes, arrayFormat, delimiter]);


  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        {/* Direction Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection('prop2yaml')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              direction === 'prop2yaml'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            Properties → YAML
          </button>
          <button
            type="button"
            onClick={() => setDirection('yaml2prop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              direction === 'yaml2prop'
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'btn-3d text-[var(--text-secondary)]'
            }`}
          >
            YAML → Properties
          </button>

        </div>

        {/* Options Toolbar */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
          {direction === 'prop2yaml' ? (
            <>
              {/* Indentation */}
              <div className="flex items-center gap-1.5">
                <span>Indent:</span>
                <select
                  value={indent}
                  onChange={(e) => setIndent(Number(e.target.value))}
                  className="bg-[var(--control-input-bg)] border border-black/5 dark:border-white/10 rounded-md px-2 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                </select>
              </div>

              {/* Infer Types */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inferTypes}
                  onChange={(e) => setInferTypes(e.target.checked)}
                  className="rounded text-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span>Infer numbers/booleans</span>
              </label>
            </>
          ) : (
            <>
              {/* Array format */}
              <div className="flex items-center gap-1.5">
                <span>Array:</span>
                <select
                  value={arrayFormat}
                  onChange={(e) => setArrayFormat(e.target.value as any)}
                  className="bg-[var(--control-input-bg)] border border-black/5 dark:border-white/10 rounded-md px-2 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
                >
                  <option value="bracket">items[0]</option>
                  <option value="dot">items.0</option>
                </select>
              </div>

              {/* Delimiter */}
              <div className="flex items-center gap-1.5">
                <span>Delimiter:</span>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="bg-[var(--control-input-bg)] border border-black/5 dark:border-white/10 rounded-md px-2 py-1 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
                >
                  <option value="=">=</option>
                  <option value=" = "> = </option>
                  <option value=":">:</option>
                  <option value=": ">: </option>
                </select>
              </div>
            </>
          )}

          {/* Sort Keys */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded text-emerald-500 cursor-pointer accent-emerald-500"
            />
            <span>Sort A-Z</span>
          </label>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Editors Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[460px]">
        <CodeEditor
          value={input}
          onChange={setInput}
          label={direction === 'prop2yaml' ? 'Properties Input' : 'YAML Input'}
          placeholder={
            direction === 'prop2yaml'
              ? 'Paste application.properties here (key=value)...'
              : 'Paste application.yml / yaml configuration here...'
          }
          language={direction === 'prop2yaml' ? 'properties' : 'yaml'}
        />

        <CodeEditor
          value={output}
          readOnly
          label={direction === 'prop2yaml' ? 'YAML Output' : 'Properties Output'}
          placeholder="Converted output will appear here automatically..."
          language={direction === 'prop2yaml' ? 'yaml' : 'properties'}
        />
      </div>
    </div>
  );
};
