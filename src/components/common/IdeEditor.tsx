/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
import React, { useEffect, useRef, useState } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { Annotation, Compartment, EditorState, Prec } from '@codemirror/state';
import { keymap, placeholder as placeholderExtension } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { StreamLanguage, indentUnit } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

const detectLanguage = (value: string): string => {
  const text = value.trimStart().slice(0, 4000);
  if (/^[{[]/.test(text)) {
    try { JSON.parse(value); return 'json'; } catch { /* Allow incomplete code while typing. */ }
    if (/^[{[]\s*(?:[}\]]|"[^"\n]*"\s*:)/.test(text)) return 'json';
  }
  if (/^<\?xml\b/.test(text)) return 'xml';
  if (/^<(?:!doctype html|html|head|body|div|span|p|a)\b/i.test(text)) return 'html';
  if (/^<[\w:-]+(?:\s|>)/.test(text)) return 'xml';
  if (/^(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/i.test(text)) return 'sql';
  if (/^(?:package\s+[\w.]+;|import\s+java\.|public\s+(?:class|interface|record))/.test(text)) return 'java';
  if (/^(?:from\s+\w+\s+import|def\s+\w+\(|class\s+\w+.*:|import\s+\w+\s*$)/m.test(text)) return 'python';
  if (/^(?:interface|type|enum)\s+\w+/.test(text)) return 'typescript';
  if (/^(?:const|let|var|function|export|import)\b/.test(text)) return 'javascript';
  if (/^[.#]?[\w-]+[^\n]*\{\s*[\w-]+\s*:/.test(text)) return 'css';
  if (/^(?:---\s*\n)?[\w-]+:\s+/.test(text)) return 'yaml';
  if (/^#{1,6}\s/.test(text)) return 'markdown';
  return '';
};

const externalChange = Annotation.define<boolean>();
const languages: Record<string, () => Promise<unknown>> = {
  bash: () => import('@codemirror/legacy-modes/mode/shell').then(m => StreamLanguage.define(m.shell)),
  go: () => import('@codemirror/legacy-modes/mode/go').then(m => StreamLanguage.define(m.go)),
  properties: () => import('@codemirror/legacy-modes/mode/properties').then(m => StreamLanguage.define(m.properties)),
  php: () => import('@codemirror/lang-php').then(m => m.php()),
  json: () => import('@codemirror/lang-json').then(m => m.json()),
  javascript: () => import('@codemirror/lang-javascript').then(m => m.javascript()),
  js: () => import('@codemirror/lang-javascript').then(m => m.javascript()),
  typescript: () => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  ts: () => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  python: () => import('@codemirror/lang-python').then(m => m.python()),
  java: () => import('@codemirror/lang-java').then(m => m.java()),
  sql: () => import('@codemirror/lang-sql').then(m => m.sql()),
  xml: () => import('@codemirror/lang-xml').then(m => m.xml()),
  html: () => import('@codemirror/lang-html').then(m => m.html()),
  css: () => import('@codemirror/lang-css').then(m => m.css()),
  markdown: () => import('@codemirror/lang-markdown').then(m => m.markdown()),
  yaml: () => import('@codemirror/lang-yaml').then(m => m.yaml()),
};

export interface IdeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  wrap?: boolean;
  singleLine?: boolean;
  maxLength?: number;
}

export const IdeEditor: React.FC<IdeEditorProps> = ({ value, onChange, language, label = 'Text editor', placeholder = '', minHeight = '160px', maxHeight = '600px', readOnly = false, wrap = true, singleLine = false, maxLength }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const detectedLanguage = !language && selectedLanguage === 'auto' ? detectLanguage(value) : '';
  const effectiveLanguage = language || (selectedLanguage === 'auto' ? detectedLanguage : selectedLanguage);
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const initialValue = useRef(value);
  const configuration = useRef(new Compartment());
  const languageSlot = useRef(new Compartment());

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      doc: initialValue.current,
      extensions: [basicSetup, Prec.highest(keymap.of([indentWithTab])), indentUnit.of('    '), EditorState.tabSize.of(4),
        configuration.current.of([]), languageSlot.current.of([]),
        EditorView.updateListener.of(update => {
          if (update.docChanged && !update.transactions.some(transaction => transaction.annotation(externalChange))) changeRef.current?.(update.state.doc.toString());
        }),
      ],
    });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const configure = () => {
      const dark = document.documentElement.classList.contains('dark');
      view.dispatch({ effects: configuration.current.reconfigure([
        ...(dark ? [oneDark] : []),
        EditorView.theme({
          '&': { backgroundColor: 'transparent', color: 'var(--well-text)', fontSize: '12px', minHeight, height: '100%' },
          '&.cm-focused': { outline: 'none' },
          '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', overflow: 'auto', maxHeight, minHeight },
          '.cm-content': { padding: '12px 0', caretColor: 'var(--text-primary)' },
          '.cm-gutters': { backgroundColor: 'var(--well-header-bg)', color: 'var(--text-muted)', borderRight: '1px solid var(--border-color)' },
          '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: readOnly ? 'transparent' : 'var(--control-panel-bg)' },
          '.cm-cursor': { display: readOnly ? 'none' : 'block' },
          '.cm-panels, .cm-tooltip': { backgroundColor: 'var(--control-panel-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' },
          '.cm-placeholder': { color: 'var(--text-muted)' },
        }),
        EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly),
        EditorView.contentAttributes.of({ 'aria-label': label, role: readOnly ? 'region' : 'textbox', ...(readOnly ? { tabindex: '0' } : { 'aria-multiline': String(!singleLine) }), spellcheck: 'false' }),
        placeholderExtension(placeholder), ...(wrap ? [EditorView.lineWrapping] : []),
        ...(singleLine || maxLength !== undefined ? [EditorState.transactionFilter.of(transaction => {
          if (!transaction.docChanged || transaction.annotation(externalChange)) return transaction;
          const text = transaction.newDoc.toString();
          if (singleLine && /[\r\n]/.test(text)) return [];
          if (maxLength !== undefined && text.length > maxLength) return [];
          return transaction;
        })] : []),
      ]) });
    };
    configure();
    const observer = new MutationObserver(configure);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [minHeight, maxHeight, readOnly, wrap, label, placeholder, singleLine, maxLength]);

  useEffect(() => {
    let cancelled = false;
    const view = viewRef.current;
    view?.dispatch({ effects: languageSlot.current.reconfigure([]) });
    const loader = languages[effectiveLanguage.toLowerCase()];
    if (loader) void loader().then(extension => {
      if (!cancelled && viewRef.current === view) view?.dispatch({ effects: languageSlot.current.reconfigure(extension as import('@codemirror/state').Extension) });
    }).catch(() => { /* Plain text editing remains available if a language chunk fails to load. */ });
    return () => { cancelled = true; };
  }, [effectiveLanguage]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value }, annotations: externalChange.of(true) });
  }, [value]);
  return <div className="flex flex-col flex-1 min-w-0 w-full h-full">
    {!language && <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
      <label className="flex items-center gap-2">Syntax
        <select aria-label={`${label} syntax language`} value={selectedLanguage} onChange={event => setSelectedLanguage(event.target.value)} className="bg-[var(--well-header-bg)] rounded px-1 py-0.5">
          <option value="auto">Auto{detectedLanguage ? ` (${detectedLanguage})` : ''}</option>
          <option value="">Plain text</option>
          {Object.keys(languages).filter(name => name !== 'js' && name !== 'ts').map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      {!readOnly && <span>Tab / Shift+Tab to indent</span>}
    </div>}
    <div ref={host} className="ide-editor flex-1 min-w-0 w-full min-h-0" />
  </div>;
};
