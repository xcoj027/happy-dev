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


export const ChmodCalculator: React.FC = () => {
  const [perms, setPerms] = useState({
    owner: { read: true, write: true, exec: true }, // 7
    group: { read: true, write: false, exec: true }, // 5
    others: { read: true, write: false, exec: true }, // 5
  });

  const calcVal = (p: { read: boolean; write: boolean; exec: boolean }) => {
    let val = 0;
    if (p.read) val += 4;
    if (p.write) val += 2;
    if (p.exec) val += 1;
    return val;
  };

  const calcStr = (p: { read: boolean; write: boolean; exec: boolean }) => {
    return (p.read ? 'r' : '-') + (p.write ? 'w' : '-') + (p.exec ? 'x' : '-');
  };

  const octal = `${calcVal(perms.owner)}${calcVal(perms.group)}${calcVal(perms.others)}`;
  const symbolic = `-${calcStr(perms.owner)}${calcStr(perms.group)}${calcStr(perms.others)}`;
  const command = `chmod ${octal} filename`;

  return (
    <div className="space-y-4">
      {/* Result Card */}
      <div className="p-4 card-3d rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-[var(--text-secondary)]">Octal Permission</span>
            <div className="text-2xl font-mono font-bold text-emerald-700">{octal}</div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[var(--text-secondary)]">Symbolic Notation</span>
            <div className="text-2xl font-mono font-bold text-cyan-700">{symbolic}</div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[var(--text-secondary)]">Shell Command</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm well-3d px-3 py-1.5 rounded-lg text-[var(--text-primary)]">
                {command}
              </span>
              <CopyButton text={command} />
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['owner', 'group', 'others'] as const).map((role) => (
          <div key={role} className="p-4 card-3d rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--control-border)] pb-2">
              <span className="font-semibold text-[var(--text-primary)] text-sm capitalize">{role}</span>
              <span className="font-mono text-sm text-emerald-700 font-bold">{calcVal(perms[role])}</span>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[var(--hover-bg)] rounded transition">
                <span>Read (4)</span>
                <input
                  type="checkbox"
                  checked={perms[role].read}
                  onChange={(e) => setPerms({ ...perms, [role]: { ...perms[role], read: e.target.checked } })}
                  className="rounded text-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[var(--hover-bg)] rounded transition">
                <span>Write (2)</span>
                <input
                  type="checkbox"
                  checked={perms[role].write}
                  onChange={(e) => setPerms({ ...perms, [role]: { ...perms[role], write: e.target.checked } })}
                  className="rounded text-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[var(--hover-bg)] rounded transition">
                <span>Execute (1)</span>
                <input
                  type="checkbox"
                  checked={perms[role].exec}
                  onChange={(e) => setPerms({ ...perms, [role]: { ...perms[role], exec: e.target.checked } })}
                  className="rounded text-emerald-500"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
