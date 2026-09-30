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

import React, { useState, useEffect } from 'react';
import { CodeEditor } from '../../components/common/CodeEditor';
import { RefreshCw, FileText } from 'lucide-react';

const wordsBank = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel',
  'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida',
  'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis',
  'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien',
  'nec', 'massa', 'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor'
];

export const LoremIpsumGenerator: React.FC = () => {
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [text, setText] = useState('');

  const generateSentence = () => {
    const len = Math.floor(Math.random() * 10) + 8;
    const sWords: string[] = [];
    for (let i = 0; i < len; i++) {
      sWords.push(wordsBank[Math.floor(Math.random() * wordsBank.length)]);
    }
    const sentence = sWords.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = () => {
    const sCount = Math.floor(Math.random() * 4) + 4;
    const sentences = [];
    for (let i = 0; i < sCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  const generate = () => {
    const safeCount = Math.min(50, Math.max(1, count));
    if (unit === 'words') {
      const res = [];
      for (let i = 0; i < safeCount; i++) {
        res.push(wordsBank[i % wordsBank.length]);
      }
      setText(res.join(' '));
    } else if (unit === 'sentences') {
      const res = [];
      for (let i = 0; i < safeCount; i++) {
        res.push(generateSentence());
      }
      setText(res.join(' '));
    } else {
      const res = [];
      for (let i = 0; i < safeCount; i++) {
        res.push(generateParagraph());
      }
      setText(res.join('\n\n'));
    }
  };

  useEffect(() => {
    generate();
  }, [unit, count]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <FileText className="w-4 h-4 text-emerald-500" />
          <div className="flex items-center gap-1.5">
            {(['paragraphs', 'sentences', 'words'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize text-xs transition cursor-pointer ${
                  unit === u
                    ? 'btn-3d-active'
                    : 'btn-3d text-[var(--text-secondary)]'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 ml-2">
            <span>Count (1-50):</span>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCount(isNaN(val) ? 1 : Math.min(50, Math.max(1, val)));
              }}
              className="w-16 input-3d rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none text-center"
            />
          </label>
        </div>

        <button
          onClick={generate}
          className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>
      </div>

      <CodeEditor
        label={`Generated Lorem Ipsum (${count} ${unit})`}
        value={text}
        readOnly
        minHeight="300px"
      />
    </div>
  );
};
