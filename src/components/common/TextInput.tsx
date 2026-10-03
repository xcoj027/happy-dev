/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Code2 } from 'lucide-react';
import { IdeEditor } from './IdeEditor';

// Keep native single-line behavior and validation, with an optional expanded editor.
export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', onChange, ...props }) => {
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const layout = className.split(/\s+/).filter(token => /^(?:[\w-]+:)*(?:w-|min-w-|max-w-|flex-|col-span-|grow|shrink)/.test(token)).join(' ');
  const title = props['aria-label'] || props.placeholder || (props.id ? (document.getElementById(props.id) as HTMLInputElement | null)?.labels?.[0]?.textContent : '') || 'Text input';
  const close = () => { dialog.current?.close(); setOpen(false); input.current?.focus(); };
  return <>
    <span className={`relative inline-flex min-w-0 ${layout}`}>
      <input {...props} ref={input} onChange={onChange} className={`${className} pr-8`} />
      <button type="button" title="Open editor" aria-label={`Open editor: ${title}`} disabled={props.disabled} onClick={event => {
        event.preventDefault(); setDraft(input.current?.value || ''); setOpen(true); dialog.current?.showModal();
      }} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-emerald-500 cursor-pointer disabled:opacity-40">
        <Code2 className="w-3.5 h-3.5" />
      </button>
    </span>
    {createPortal(<dialog aria-label={title} ref={dialog} className="text-input-editor-dialog rounded-xl p-0 border border-[var(--border-color)] bg-[var(--surface-card)] text-[var(--text-primary)] w-[min(800px,90vw)]" onCancel={close}>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3"><span className="font-medium text-sm truncate">{title}</span><button type="button" className="btn-3d rounded-lg px-3 py-1.5 text-xs" onClick={close}>Close</button></div>
        {open && <IdeEditor value={draft} onChange={setDraft} label="Expanded text editor" minHeight="240px" maxHeight="50vh" singleLine maxLength={props.maxLength} readOnly={props.readOnly} />}
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]"><span>Single-line field · Ctrl/Cmd+F to search · Esc to close</span>
          {!props.readOnly && <button type="button" className="btn-3d btn-3d-active rounded-lg px-3 py-1.5 cursor-pointer" onClick={() => {
            const element = input.current;
            if (element && onChange) {
              const next = props.maxLength === undefined ? draft : draft.slice(0, props.maxLength);
              // Existing utility callbacks consume the normal input change event.
              element.value = next;
              onChange({ target: element, currentTarget: element } as React.ChangeEvent<HTMLInputElement>);
            }
            close();
          }}>Apply</button>}
        </div>
      </div>
    </dialog>, document.body)}
  </>;
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ value, onChange, placeholder, rows = 4, readOnly, disabled, className = '', 'aria-label': ariaLabel }) => (
  <div className={`${className} overflow-hidden`}>
    <IdeEditor value={String(value ?? '')} onChange={next => onChange?.({ target: { value: next }, currentTarget: { value: next } } as React.ChangeEvent<HTMLTextAreaElement>)} label={ariaLabel || placeholder || 'Text input'} placeholder={placeholder} minHeight={`${rows * 22 + 24}px`} maxHeight="360px" readOnly={readOnly || disabled} />
  </div>
);
