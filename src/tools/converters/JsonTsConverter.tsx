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
import { CodeEditor } from '../../components/common/CodeEditor';
import { Settings, AlertCircle } from 'lucide-react';

interface ConversionOptions {
  rootName: string;
  useTypeAlias: boolean;
  exportKeyword: boolean;
  allOptional: boolean;
  readonlyProps: boolean;
  extractNested: boolean;
}

export const JsonTsConverter: React.FC = () => {
  const [direction, setDirection] = useState<'json2ts' | 'ts2json'>('json2ts');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    rootName: 'RootObject',
    useTypeAlias: false,
    exportKeyword: true,
    allOptional: false,
    readonlyProps: false,
    extractNested: true,
  });
  const [showOptions, setShowOptions] = useState(false);

  // Capitalize helper
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Convert JSON to TypeScript interfaces
  const convertJsonToTs = (jsonStr: string, opts: ConversionOptions): string => {
    if (!jsonStr.trim()) return '';
    const parsed = JSON.parse(jsonStr);

    const generatedTypes: Map<string, string> = new Map();

    const getType = (val: any, keyName: string): string => {
      if (val === null) return 'null | any';
      if (val === undefined) return 'undefined';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'number') return 'number';
      if (typeof val === 'boolean') return 'boolean';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        // Check array element types
        const first = val[0];
        if (typeof first === 'object' && first !== null) {
          const itemTypeName = capitalize(keyName.replace(/s$/, '')) || 'Item';
          if (opts.extractNested) {
            buildInterface(first, itemTypeName);
            return `${itemTypeName}[]`;
          } else {
            return `Array<${buildInlineType(first)}>`;
          }
        }
        return `${getType(first, keyName)}[]`;
      }

      if (typeof val === 'object') {
        const nestedTypeName = capitalize(keyName) || 'Nested';
        if (opts.extractNested) {
          buildInterface(val, nestedTypeName);
          return nestedTypeName;
        } else {
          return buildInlineType(val);
        }
      }

      return 'any';
    };

    const buildInlineType = (obj: Record<string, any>): string => {
      const entries = Object.entries(obj).map(([k, v]) => {
        const opt = opts.allOptional ? '?' : '';
        const ro = opts.readonlyProps ? 'readonly ' : '';
        return `${ro}${k}${opt}: ${getType(v, k)}`;
      });
      return `{ ${entries.join('; ')} }`;
    };

    const buildInterface = (obj: Record<string, any>, typeName: string) => {
      if (generatedTypes.has(typeName)) return;

      const lines: string[] = [];
      const prefix = opts.exportKeyword ? 'export ' : '';
      const kind = opts.useTypeAlias ? `type ${typeName} =` : `interface ${typeName}`;

      lines.push(`${prefix}${kind} {`);
      for (const [k, v] of Object.entries(obj)) {
        const opt = opts.allOptional ? '?' : '';
        const ro = opts.readonlyProps ? 'readonly ' : '';
        const typeStr = getType(v, k);
        // If key has special characters, quote it
        const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        lines.push(`  ${ro}${validKey}${opt}: ${typeStr};`);
      }
      lines.push(opts.useTypeAlias ? '};' : '}');

      generatedTypes.set(typeName, lines.join('\n'));
    };

    const rootName = opts.rootName.trim() || 'RootObject';
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        buildInterface(parsed[0], rootName);
        const prefix = opts.exportKeyword ? 'export ' : '';
        return Array.from(generatedTypes.values()).reverse().join('\n\n') +
          `\n\n${prefix}type ${rootName}List = ${rootName}[];`;
      } else {
        const itemType = parsed.length > 0 ? typeof parsed[0] : 'any';
        const prefix = opts.exportKeyword ? 'export ' : '';
        return `${prefix}type ${rootName} = ${itemType}[];`;
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      buildInterface(parsed, rootName);
      return Array.from(generatedTypes.values()).reverse().join('\n\n');
    } else {
      const prefix = opts.exportKeyword ? 'export ' : '';
      return `${prefix}type ${rootName} = ${typeof parsed};`;
    }
  };

  // Convert TypeScript definitions to mock JSON
  const convertTsToJson = (tsStr: string): string => {
    if (!tsStr.trim()) return '';

    // Simple yet robust regex parser for TS interfaces/types
    // Extracts properties: name: type
    const result: Record<string, any> = {};
    const lines = tsStr.split('\n');

    for (let line of lines) {
      line = line.trim();
      // Skip comments, export, interface declaration lines, closing brackets
      if (
        !line ||
        line.startsWith('//') ||
        line.startsWith('/*') ||
        line.startsWith('*') ||
        line.startsWith('import') ||
        line.startsWith('export interface') ||
        line.startsWith('interface ') ||
        line.startsWith('export type') ||
        line.startsWith('type ') ||
        line === '{' ||
        line === '}' ||
        line === '};'
      ) {
        continue;
      }

      // Match: [readonly] [key]?: [type];
      const propMatch = line.match(/^(?:readonly\s+)?([a-zA-Z0-9_$"'`]+)\s*(\?)?:\s*(.+?);?$/);
      if (propMatch) {
        let key = propMatch[1].replace(/['"`]/g, '');
        let typeVal = propMatch[3].replace(/;$/, '').trim();

        // Infer mock value based on type
        result[key] = generateMockValueForType(typeVal);
      }
    }

    if (Object.keys(result).length === 0) {
      throw new Error('No valid interface properties found. Expected syntax like "propertyName: string;"');
    }

    return JSON.stringify(result, null, 2);
  };

  const generateMockValueForType = (typeStr: string): any => {
    typeStr = typeStr.trim();

    // Union of string literals: 'active' | 'inactive'
    if (typeStr.includes('|') && typeStr.includes("'")) {
      const matches = typeStr.match(/'([^']+)'/);
      if (matches) return matches[1];
    }

    // Arrays
    if (typeStr.endsWith('[]')) {
      const inner = typeStr.slice(0, -2);
      return [generateMockValueForType(inner)];
    }
    if (typeStr.startsWith('Array<') && typeStr.endsWith('>')) {
      const inner = typeStr.slice(6, -1);
      return [generateMockValueForType(inner)];
    }

    // Primitives
    switch (typeStr) {
      case 'string':
        return 'sample_string';
      case 'number':
        return 42;
      case 'boolean':
        return true;
      case 'Date':
        return new Date().toISOString();
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      case 'any':
      case 'unknown':
        return 'any_value';
      default:
        // Handle object literals { foo: string }
        if (typeStr.startsWith('{') && typeStr.endsWith('}')) {
          return { key: 'value' };
        }
        return `mock_${typeStr}`;
    }
  };

  let output = '';
  try {
    if (!input.trim()) {
      output = '';
    } else if (direction === 'json2ts') {
      output = convertJsonToTs(input, options);
    } else {
      output = convertTsToJson(input);
    }
    if (error) setError(null);
  } catch (err: any) {
    output = '';
    if (input.trim() && (!error || error !== err.message)) {
      setError(err.message || 'Syntax error during parsing');
    }
  }


  return (
    <div className="flex-1 flex flex-col h-full space-y-3 min-h-[540px]">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection('json2ts')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'json2ts' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            JSON → TypeScript
          </button>
          <button
            type="button"
            onClick={() => setDirection('ts2json')}
            className={`btn-3d px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              direction === 'ts2json' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
            }`}
          >
            TypeScript → JSON
          </button>
        </div>

        <div className="flex items-center gap-2">
          {direction === 'json2ts' && (
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                showOptions ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Options</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setInput('');
              setError(null);
            }}
            className="btn-3d px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-rose-400 transition cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Options Dropdown Panel */}
      {direction === 'json2ts' && showOptions && (
        <div className="card-3d p-3.5 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs animate-in fade-in duration-200">
          <div>
            <label className="text-[var(--text-secondary)] block mb-1">Root Name</label>
            <TextInput
              type="text"
              value={options.rootName}
              onChange={(e) => setOptions({ ...options, rootName: e.target.value })}
              className="input-3d w-full px-2.5 py-1 rounded text-xs text-[var(--text-primary)] font-mono outline-none"
              placeholder="RootObject"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="text-[var(--text-secondary)] block mb-1">Declaration</label>
            <select
              value={options.useTypeAlias ? 'type' : 'interface'}
              onChange={(e) => setOptions({ ...options, useTypeAlias: e.target.value === 'type' })}
              className="input-3d px-2 py-1 rounded text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="interface">interface</option>
              <option value="type">type alias</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="exportKeyword"
              checked={options.exportKeyword}
              onChange={(e) => setOptions({ ...options, exportKeyword: e.target.checked })}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="exportKeyword" className="text-[var(--text-secondary)] cursor-pointer select-none">
              Export
            </label>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="allOptional"
              checked={options.allOptional}
              onChange={(e) => setOptions({ ...options, allOptional: e.target.checked })}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="allOptional" className="text-[var(--text-secondary)] cursor-pointer select-none">
              Optional (?)
            </label>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="readonlyProps"
              checked={options.readonlyProps}
              onChange={(e) => setOptions({ ...options, readonlyProps: e.target.checked })}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="readonlyProps" className="text-[var(--text-secondary)] cursor-pointer select-none">
              Readonly
            </label>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="extractNested"
              checked={options.extractNested}
              onChange={(e) => setOptions({ ...options, extractNested: e.target.checked })}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="extractNested" className="text-[var(--text-secondary)] cursor-pointer select-none">
              Extract Types
            </label>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Code Editor Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-[460px]">
        <CodeEditor
          label={direction === 'json2ts' ? 'JSON Input' : 'TypeScript Interface Input'}
          language={direction === 'json2ts' ? 'json' : 'typescript'}
          value={input}
          onChange={setInput}
          placeholder={
            direction === 'json2ts'
              ? 'Paste raw JSON here...'
              : 'Paste TypeScript interface or type definition here...'
          }
        />
        <CodeEditor
          label={direction === 'json2ts' ? 'Generated TypeScript Types' : 'Generated JSON Mock'}
          language={direction === 'json2ts' ? 'typescript' : 'json'}
          value={output}
          readOnly
          placeholder="Converted output will appear here automatically..."
        />
      </div>
    </div>
  );
};
