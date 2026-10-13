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
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '', label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
        copied
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-black/5 hover:bg-black/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white'
      } ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
      )}
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  );
};
