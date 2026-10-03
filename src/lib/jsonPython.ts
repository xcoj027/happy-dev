/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
const keywords = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const pythonName = (name: string) => {
  let result = name.replace(/[^A-Za-z0-9_]/g, '_');
  if (!result || /^\d/.test(result)) result = `field_${result}`;
  if (keywords.has(result) || result.startsWith('_')) result = `field_${result}`;
  return result;
};
export function jsonToPython(source: string, rootName = 'RootDto', style: 'dataclass' | 'pydantic' = 'dataclass'): string {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(rootName) || keywords.has(rootName)) throw new Error('Enter a valid Python class name.');
  const parsed: unknown = JSON.parse(source);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Use a JSON object as the DTO root. Put a root array inside an object field.');
  const names = new Set<string>();
  const classes: string[] = [];
  const typing = new Set<string>();
  let aliases = false;
  const infer = (values: unknown[], hint: string): string => {
    const present = values.filter(value => value !== null && value !== undefined);
    const nullable = present.length !== values.length;
    let type: string;
    if (!present.length) { typing.add('Any'); type = 'Any'; }
    else if (present.every(value => Array.isArray(value))) type = `list[${infer(present.flatMap(value => value as unknown[]), hint + 'Item')}]`;
    else if (present.every(value => typeof value === 'object' && !Array.isArray(value))) {
      const base = hint;
      let name = base;
      let suffix = 2;
      while (names.has(name)) name = base + suffix++;
      names.add(name);
      const keys = [...new Set(present.flatMap(value => Object.keys(value as object)))];
      const fields = new Set<string>();
      const lines = keys.map(key => {
        const baseField = pythonName(key);
        let fieldName = baseField;
        let suffix = 2;
        while (fields.has(fieldName)) fieldName = baseField + suffix++;
        fields.add(fieldName);
        const fieldType = infer(present.map(value => (value as Record<string, unknown>)[key]), name + fieldName[0].toUpperCase() + fieldName.slice(1));
        let metadata = '';
        if (fieldName !== key) {
          aliases = true;
          metadata = style === 'pydantic' ? ` = Field(alias=${JSON.stringify(key)})` : ` = field(metadata={"json_key": ${JSON.stringify(key)}})`;
        }
        return `    ${fieldName}: ${fieldType}${metadata}`;
      });
      classes.push(`${style === 'dataclass' ? '@dataclass\n' : ''}class ${name}${style === 'pydantic' ? '(BaseModel)' : ''}:\n${lines.join('\n') || '    pass'}`);
      type = name;
    } else if (present.every(value => typeof value === 'string')) type = 'str';
    else if (present.every(value => typeof value === 'boolean')) type = 'bool';
    else if (present.every(value => typeof value === 'number')) type = present.every(Number.isInteger) ? 'int' : 'float';
    else { typing.add('Any'); type = 'Any'; }
    if (nullable && type !== 'Any') { typing.add('Optional'); type = `Optional[${type}]`; }
    return type;
  };
  infer([parsed], rootName);
  const imports = ['from __future__ import annotations', style === 'dataclass' ? `from dataclasses import dataclass${aliases ? ', field' : ''}` : `from pydantic import BaseModel${aliases ? ', Field' : ''}`, ...(typing.size ? [`from typing import ${[...typing].sort().join(', ')}`] : [])];
  return imports.join('\n') + '\n\n\n' + classes.join('\n\n\n') + '\n';
}

// Parse annotation declarations only. Input Python code is never executed.
export function pythonToJson(source: string, rootName = ''): string {
  const split = (value: string, separator: string): string[] => {
    const parts: string[] = [];
    let start = 0, depth = 0, quote = '';
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      if (quote) { if (char === '\\') i++; else if (char === quote) quote = ''; continue; }
      if (char === '"' || char === "'") quote = char;
      else if ('[({'.includes(char)) depth++;
      else if ('])}'.includes(char)) depth--;
      else if (char === separator && depth === 0) { parts.push(value.slice(start, i).trim()); start = i + 1; }
    }
    if (depth !== 0 || quote) throw new Error('Unbalanced brackets or quotes in Python annotation.');
    parts.push(value.slice(start).trim());
    return parts;
  };
  const stringValue = (value: string): string => {
    if (value.startsWith('"')) return JSON.parse(value);
    return value.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  };
  const clean = source.replace(/#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, match => match.startsWith('#') ? '' : match);
  const classes = new Map<string, { key: string; type: string }[]>();
  let current: string | null = null;
  let classIndent = 0;
  let fieldIndent: number | null = null;
  const lines = clean.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const indent = line.match(/^\s*/)?.[0].replace(/\t/g, '    ').length || 0;
    const declaration = line.trim().match(/^class\s+([A-Za-z_]\w*)\s*(?:\([^)]*\))?\s*:/);
    if (declaration) {
      if (current && indent > classIndent) throw new Error('Use top-level DTO classes; nested class declarations are not supported.');
      current = declaration[1]; classIndent = indent; fieldIndent = null;
      classes.set(current, []);
      const inline = line.trim().slice(declaration[0].length).trim();
      if (inline && inline !== 'pass' && inline !== '...') throw new Error('Put DTO fields on separate indented lines.');
      continue;
    }
    if (!line.trim()) continue;
    if (current && indent <= classIndent) current = null;
    if (!current) continue;
    if (fieldIndent === null) fieldIndent = indent;
    if (indent !== fieldIndent || !/^\s*[A-Za-z_]\w*\s*:/.test(line)) continue;
    // Continue multiline annotations/defaults until brackets and quotes balance.
    for (;;) {
      try { split(line, '='); break; }
      catch { if (++i >= lines.length) throw new Error('Unclosed Python field declaration.'); line += ' ' + lines[i].trim(); }
    }
    const field = line.trim().match(/^([A-Za-z_]\w*)\s*:\s*([\s\S]+)$/)!;
    const parts = split(field[2], '=');
    if (/^(?:typing\.)?ClassVar\[/.test(parts[0])) continue;
    const alias = parts.slice(1).join('=').match(/(?:alias\s*=|["']json_key["']\s*:)\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
    classes.get(current)!.push({ key: alias ? stringValue(alias[1]) : field[1], type: parts[0] });
  }
  if (!classes.size) throw new Error('Paste Python classes with annotated fields, such as name: str.');
  const root = rootName.trim() || [...classes.keys()].at(-1)!;
  if (!classes.has(root)) throw new Error(`Class ${root} was not found.`);
  const sample = (raw: string, visited: string[]): unknown => {
    let type = raw.trim().replace(/\btyping\./g, '');
    if (/^(["']).*\1$/.test(type)) type = stringValue(type);
    const unions = split(type, '|').filter(value => value !== 'None' && value !== 'NoneType');
    if (unions.length > 1 || type.includes('|')) return unions.length ? sample(unions[0], visited) : null;
    const generic = type.match(/^(\w+)\[([\s\S]*)\]$/);
    if (generic) {
      const args = split(generic[2], ',');
      switch (generic[1]) {
        case 'Optional': case 'Annotated': return sample(args[0], visited);
        case 'Union': return sample(args.find(arg => !['None', 'NoneType'].includes(arg)) || 'None', visited);
        case 'list': case 'List': case 'set': case 'Set': case 'Sequence': return [sample(args[0], visited)];
        case 'dict': case 'Dict': case 'Mapping': return { key: sample(args[1] || 'Any', visited) };
        case 'tuple': case 'Tuple': return args.filter(arg => arg !== '...').map(arg => sample(arg, visited));
        case 'Literal': {
          const literal = args[0];
          if (/^["']/.test(literal)) return stringValue(literal);
          if (literal === 'True' || literal === 'False') return literal === 'True';
          return /^-?\d+(?:\.\d+)?$/.test(literal) ? Number(literal) : null;
        }
        default: return null;
      }
    }
    if (classes.has(type)) {
      if (visited.includes(type)) return null;
      return Object.fromEntries(classes.get(type)!.map(field => [field.key, sample(field.type, [...visited, type])]));
    }
    switch (type) {
      case 'str': return 'sample';
      case 'int': case 'float': case 'Decimal': return 0;
      case 'bool': return true;
      case 'date': case 'datetime.date': return '2026-01-01';
      case 'datetime': case 'datetime.datetime': return '2026-01-01T00:00:00Z';
      case 'UUID': return '00000000-0000-0000-0000-000000000000';
      default: return null;
    }
  };
  return JSON.stringify(sample(root, []), null, 2);
}
