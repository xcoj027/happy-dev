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
import { CopyButton } from '../../components/common/CopyButton';
import { Code2 } from 'lucide-react';

export const SvgToJsxConverter: React.FC = () => {
  const [svg, setSvg] = useState('');
  const [componentName, setComponentName] = useState('');

  // Convert SVG attributes to JSX camelCase
  const convertToJsx = (rawSvg: string) => {
    if (!rawSvg.trim()) return '';
    const safeName = componentName.trim() || 'IconComponent';
    let jsx = rawSvg
      .replace(/class=/g, 'className=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/fill-opacity=/g, 'fillOpacity=')
      .replace(/stroke-opacity=/g, 'strokeOpacity=')
      .replace(/stop-color=/g, 'stopColor=')
      .replace(/stop-opacity=/g, 'stopOpacity=');

    return `import React from 'react';

export const ${safeName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  ${jsx.replace('<svg', '<svg {...props}')}
);`;
  };

  const toDataUri = (rawSvg: string) => {
    if (!rawSvg.trim()) return '';
    const encoded = encodeURIComponent(rawSvg.trim())
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml,${encoded}`;
  };

  const jsxCode = convertToJsx(svg);
  const dataUri = toDataUri(svg);

  return (
    <div className="space-y-4">
      {/* Component Name Config */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>React Component Name:</span>
          <input
            type="text"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="IconComponent"
            className="bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="Raw SVG Code Input"
          value={svg}
          onChange={setSvg}
          language="xml"
        />
        <CodeEditor
          label="React TypeScript JSX Component"
          value={jsxCode}
          readOnly
          language="tsx"
        />
      </div>

      {/* SVG Preview & CSS Data URI */}
      <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">CSS Data URI</span>
          <CopyButton text={`background-image: url("${dataUri}");`} label="Copy CSS rule" />
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center p-2 text-emerald-400 shrink-0"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <pre className="flex-1 p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-[11px] font-mono text-gray-400 truncate select-all">
            {dataUri}
          </pre>
        </div>
      </div>
    </div>
  );
};
