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
    if (unit === 'words') {
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(wordsBank[i % wordsBank.length]);
      }
      setText(res.join(' '));
    } else if (unit === 'sentences') {
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(generateSentence());
      }
      setText(res.join(' '));
    } else {
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(generateParagraph());
      }
      setText(res.join('\n\n'));
    }
  };

  React.useEffect(() => {
    generate();
  }, [unit, count]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <FileText className="w-4 h-4 text-emerald-400" />
          <div className="flex items-center gap-1.5">
            {(['paragraphs', 'sentences', 'words'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize text-xs transition ${
                  unit === u ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 ml-2">
            <span>Count:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              className="w-16 bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-gray-200 outline-none"
            />
          </label>
        </div>

        <button
          onClick={generate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
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
