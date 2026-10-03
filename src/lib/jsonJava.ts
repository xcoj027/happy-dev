/** HappyDev - Offline Developer Utilities Suite
 * @author TNQSW
 * @license MIT (with Trademark Retention Notice)
 * Copyright (c) 2026 TNQSW. Retain TNQ trademark, author credits and notices.
 */
const reserved = new Set('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while record var yield true false null _'.split(' '));
const identifier = (value: string) => {
  let name = value.replace(/[^a-zA-Z0-9_$]+(.)?/g, (_, next: string) => next?.toUpperCase() || '');
  if (!name || !/^[a-zA-Z_$]/.test(name)) name = `_${name}`;
  return reserved.has(name) ? `${name}_` : name;
};

export function jsonToJava(source: string, rootName = 'RootDto'): string {
  if (!/^[A-Za-z_$][\w$]*$/.test(rootName) || reserved.has(rootName)) throw new Error('Enter a valid Java class name.');
  const value: unknown = JSON.parse(source);
  const definitions: string[] = [];
  const names = new Set<string>();
  let listUsed = false;
  let annotationsUsed = false;
  const infer = (values: unknown[], hint: string): string => {
    const present = values.filter(v => v !== null && v !== undefined);
    if (!present.length) return 'Object';
    if (present.every(v => Array.isArray(v))) {
      listUsed = true;
      return `List<${infer(present.flatMap(v => v as unknown[]), hint + 'Item')}>`;
    }
    if (present.every(v => typeof v === 'object' && !Array.isArray(v))) {
      let name = hint[0].toUpperCase() + hint.slice(1);
      const base = name;
      let suffix = 2;
      while (names.has(name)) name = base + suffix++;
      names.add(name);
      const keys = [...new Set(present.flatMap(v => Object.keys(v as object)))];
      const fields = new Set<string>();
      const lines = keys.map(key => {
        let field = identifier(key);
        const baseField = field;
        let i = 2;
        while (fields.has(field)) field = baseField + i++;
        fields.add(field);
        const type = infer(present.map(v => (v as Record<string, unknown>)[key]), name + field[0].toUpperCase() + field.slice(1));
        const annotation = field !== key ? `    @JsonProperty(${JSON.stringify(key)})\n` : '';
        if (annotation) annotationsUsed = true;
        return `${annotation}    public ${type} ${field};`;
      });
      definitions.push(`public ${names.size === 1 && name === rootName ? '' : 'static '}class ${name} {\n${lines.join('\n')}\n}`);
      return name;
    }
    if (present.every(v => typeof v === 'string')) return 'String';
    if (present.every(v => typeof v === 'boolean')) return 'Boolean';
    if (present.every(v => typeof v === 'number')) {
      if (!present.every(v => Number.isSafeInteger(v))) return 'Double';
      return present.every(v => (v as number) >= -2147483648 && (v as number) <= 2147483647) ? 'Integer' : 'Long';
    }
    return 'Object';
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use a JSON object as the DTO root. Put a root array inside an object field.');
  infer([value], rootName);
  const root = definitions.pop()!.replace('public static class', 'public class');
  const nested = definitions.map(d => d.replace(/^public (?:static )?class/, 'public static class').split('\n').map(l => '    ' + l).join('\n'));
  return [listUsed ? 'import java.util.List;' : '', annotationsUsed ? 'import com.fasterxml.jackson.annotation.JsonProperty;' : '', '', root.slice(0, -1) + (nested.length ? '\n' + nested.join('\n\n') + '\n' : '') + '}'].filter((line, i) => line || i === 2).join('\n').trim();
}

// Read declarations only; Java code and field initializers are never executed.
export function javaToJson(source: string, rootName = ''): string {
  const tokens = source.match(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_$][\w$]*|[^\s]/g)?.filter(t => !t.startsWith('//') && !t.startsWith('/*')) || [];
  const classes = new Map<string, { key: string; type: string }[]>();
  const split = (parts: string[], separator: string) => {
    const result: string[][] = [[]];
    let depth = 0;
    for (const token of parts) {
      if (token === separator && depth === 0) result.push([]);
      else {
        result[result.length - 1].push(token);
        if (['<', '(', '[', '{'].includes(token)) depth++;
        if (['>', ')', ']', '}'].includes(token)) depth--;
      }
    }
    return result;
  };
  const field = (parts: string[]): { key: string; type: string }[] => {
    let jsonKey: string | undefined;
    const clean: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '@') {
        let annotation = parts[++i];
        while (parts[i + 1] === '.') { i += 2; annotation = parts[i]; }
        if (parts[i + 1] === '(') {
          i += 2;
          let depth = 1;
          while (i < parts.length && depth) {
            if (annotation === 'JsonProperty' && parts[i].startsWith('"')) jsonKey = JSON.parse(parts[i]);
            if (parts[i] === '(') depth++;
            if (parts[i] === ')') depth--;
            if (depth) i++;
          }
        }
      } else clean.push(parts[i]);
    }
    if (clean.includes('static') || clean.includes('transient')) return [];
    const declaration = clean.filter(t => !['public', 'private', 'protected', 'final', 'volatile'].includes(t));
    const groups = split(declaration, ',');
    let type = '';
    return groups.map((group, index) => {
      const left = group.slice(0, group.includes('=') ? group.indexOf('=') : group.length);
      if (left.includes('(')) return null;
      let end = left.length - 1;
      while (left[end] === ']' || left[end] === '[') end--;
      const key = left[end];
      if (!key || !/^[A-Za-z_$][\w$]*$/.test(key) || (index === 0 && end < 1)) return null;
      if (index === 0) type = left.slice(0, end).join('');
      return { key: jsonKey ?? key, type: type + left.slice(end + 1).join('') };
    }).filter((f): f is { key: string; type: string } => f !== null);
  };
  for (let i = 0; i < tokens.length; i++) {
    if (!['class', 'record'].includes(tokens[i])) continue;
    const kind = tokens[i];
    const name = tokens[++i];
    let start = i + 1;
    while (start < tokens.length && tokens[start] !== (kind === 'record' ? '(' : '{')) start++;
    if (start === tokens.length) throw new Error(`Missing body for ${name}.`);
    const fields: { key: string; type: string }[] = [];
    let depth = 1;
    let segment: string[] = [];
    let end = start + 1;
    for (; end < tokens.length && depth; end++) {
      const token = tokens[end];
      if (token === (kind === 'record' ? '(' : '{')) depth++;
      if (token === (kind === 'record' ? ')' : '}')) depth--;
      if (kind === 'record') { if (depth) segment.push(token); }
      else if (depth === 1 && token === ';') { fields.push(...field(segment)); segment = []; }
      else if (depth === 1 && token === '}') segment = [];
      else if (depth === 1 && token !== '{') segment.push(token);
      else if (depth === 2 && token === '{') segment = [];
    }
    if (depth) throw new Error(`Unclosed declaration for ${name}.`);
    if (kind === 'record') fields.push(...split(segment, ',').flatMap(field));
    classes.set(name, fields);
  }
  if (!classes.size) throw new Error('Paste Java class or record declarations.');
  const root = rootName.trim() || classes.keys().next().value!;
  if (!classes.has(root)) throw new Error(`Class ${root} was not found.`);
  const sample = (raw: string, visited: string[]): unknown => {
    const type = raw.replace(/java\.(?:lang|util|time|math)\./g, '');
    if (type.endsWith('[]')) return [sample(type.slice(0, -2), visited)];
    const generic = type.match(/^(\w+)<(.*)>$/);
    if (generic) {
      const args = split(generic[2].match(/\w+|[^\s]/g) || [], ',').map(p => p.join(''));
      if (['List', 'Set', 'Collection', 'Iterable', 'ArrayList'].includes(generic[1])) return [sample(args[0], visited)];
      if (generic[1] === 'Map' || generic[1] === 'HashMap') return { key: sample(args[1], visited) };
      if (generic[1] === 'Optional') return sample(args[0], visited);
      return null;
    }
    if (classes.has(type)) {
      if (visited.includes(type)) return null;
      return Object.fromEntries(classes.get(type)!.map(f => [f.key, sample(f.type, [...visited, type])]));
    }
    if (['String', 'char', 'Character'].includes(type)) return 'sample';
    if (['boolean', 'Boolean'].includes(type)) return true;
    if (['byte', 'short', 'int', 'long', 'float', 'double', 'Byte', 'Short', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal', 'BigInteger'].includes(type)) return 0;
    if (['LocalDate'].includes(type)) return '2026-01-01';
    if (['Date', 'Instant', 'OffsetDateTime', 'ZonedDateTime'].includes(type)) return '2026-01-01T00:00:00Z';
    if (type === 'LocalDateTime') return '2026-01-01T00:00:00';
    if (type === 'UUID') return '00000000-0000-0000-0000-000000000000';
    return null;
  };
  return JSON.stringify(sample(root, []), null, 2);
}
