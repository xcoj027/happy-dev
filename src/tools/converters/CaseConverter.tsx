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
import { CodeEditor } from '../../components/common/CodeEditor';
import { Type } from 'lucide-react';

export const CaseConverter: React.FC = () => {
  const [input, setInput] = useState('');

  const safeInput = input.slice(0, 100000);
  const words = safeInput
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const camelCase = words.map((w, idx) => idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const pascalCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const snakeCase = words.map(w => w.toLowerCase()).join('_');
  const kebabCase = words.map(w => w.toLowerCase()).join('-');
  const constantCase = words.map(w => w.toUpperCase()).join('_');
  const dotCase = words.map(w => w.toLowerCase()).join('.');
  const titleCase = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const sentenceCase = safeInput ? safeInput.charAt(0).toUpperCase() + safeInput.slice(1).toLowerCase() : '';
  const lowerCase = safeInput.toLowerCase();
  const upperCase = safeInput.toUpperCase();

  const cases = [
    { label: 'camelCase', value: camelCase },
    { label: 'PascalCase', value: pascalCase },
    { label: 'snake_case', value: snakeCase },
    { label: 'kebab-case', value: kebabCase },
    { label: 'CONSTANT_CASE', value: constantCase },
    { label: 'dot.case', value: dotCase },
    { label: 'Title Case', value: titleCase },
    { label: 'Sentence case', value: sentenceCase },
    { label: 'lowercase', value: lowerCase },
    { label: 'UPPERCASE', value: upperCase },
  ];

  return (
    <div className="space-y-4">
      <CodeEditor
        label="Input String or Identifier"
        value={input}
        onChange={setInput}
        minHeight="100px"
        placeholder="Type variable, class or sentence here..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cases.map((item) => (
          <div
            key={item.label}
            className="p-3 card-3d rounded-xl flex items-center justify-between transition"
          >
            <div className="space-y-0.5 overflow-hidden pr-2">
              <div className="text-[11px] font-semibold text-[var(--text-secondary)]">{item.label}</div>
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 truncate">{item.value || '—'}</div>
            </div>
            <CopyButton text={item.value} />
          </div>
        ))}
      </div>
    </div>
  );
};
