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

import { ToolDefinition, CategoryInfo } from '../types';

// Converters
import { JsonYamlTomlConverter } from '../tools/converters/JsonYamlTomlConverter';
import { JsonCsvConverter } from '../tools/converters/JsonCsvConverter';
import { JsonTsConverter } from '../tools/converters/JsonTsConverter';
import { NumberBaseConverter } from '../tools/converters/NumberBaseConverter';
import { CaseConverter } from '../tools/converters/CaseConverter';
import { CurlToCodeConverter } from '../tools/converters/CurlToCodeConverter';
import { PropertiesYamlConverter } from '../tools/converters/PropertiesYamlConverter';

// Encoders
import { Base64Converter } from '../tools/encoders/Base64Converter';
import { UrlEncoder } from '../tools/encoders/UrlEncoder';
import { HtmlEntityEncoder } from '../tools/encoders/HtmlEntityEncoder';
import { GzipCompressor } from '../tools/encoders/GzipCompressor';

// Crypto
import { HashGenerator } from '../tools/crypto/HashGenerator';
import { AesEncryptor } from '../tools/crypto/AesEncryptor';
import { JwtDebugger } from '../tools/crypto/JwtDebugger';
import { PasswordGenerator } from '../tools/crypto/PasswordGenerator';
import { UuidGenerator } from '../tools/crypto/UuidGenerator';

// Formatters
import { JsonFormatter } from '../tools/formatters/JsonFormatter';
import { XmlFormatter } from '../tools/formatters/XmlFormatter';
import { YamlFormatter } from '../tools/formatters/YamlFormatter';
import { SqlFormatter } from '../tools/formatters/SqlFormatter';
import { CodeMinifier } from '../tools/formatters/CodeMinifier';

// DateTime
import { UnixTimestampConverter } from '../tools/datetime/UnixTimestampConverter';
import { WorldClockConverter } from '../tools/datetime/WorldClockConverter';
import { CronParser } from '../tools/datetime/CronParser';
import { TaskReminder } from '../tools/datetime/TaskReminder';

// Text
import { TextDiffChecker } from '../tools/text/TextDiffChecker';
import { RegexTester } from '../tools/text/RegexTester';
import { MarkdownEditor } from '../tools/text/MarkdownEditor';
import { TextInspector } from '../tools/text/TextInspector';
import { StringEscaper } from '../tools/text/StringEscaper';

// Generators
import { RandomGenerator } from '../tools/generators/RandomGenerator';
import { LoremIpsumGenerator } from '../tools/generators/LoremIpsumGenerator';
import { QrCodeGenerator } from '../tools/generators/QrCodeGenerator';

// Network
import { HttpStatusLookup } from '../tools/network/HttpStatusLookup';
import { ChmodCalculator } from '../tools/network/ChmodCalculator';
import { UserAgentParser } from '../tools/network/UserAgentParser';
import { MetaTagsPreviewer } from '../tools/network/MetaTagsPreviewer';

// Frontend
import { CssBoxShadowGenerator } from '../tools/frontend/CssBoxShadowGenerator';
import { CssFlexGridPlayground } from '../tools/frontend/CssFlexGridPlayground';
import { SvgToJsxConverter } from '../tools/frontend/SvgToJsxConverter';

export const categories: CategoryInfo[] = [
  { id: 'converters', name: 'Converters', description: 'JSON, TypeScript, YAML, CSV, bases, case, curl', icon: 'ArrowLeftRight' },
  { id: 'encoders', name: 'Encoders & Decoders', description: 'Base64, URL params, HTML entities, Gzip', icon: 'Binary' },
  { id: 'crypto', name: 'Crypto & Security', description: 'Hash, HMAC, AES, JWT, Passwords, UUIDs', icon: 'ShieldCheck' },
  { id: 'formatters', name: 'Formatters & Minify', description: 'JSON, XML, YAML, SQL, CSS/JS Minifier', icon: 'FileCode' },
  { id: 'datetime', name: 'Date, Time & Cron', description: 'Epoch timestamps, world clock, cron schedules', icon: 'Clock' },
  { id: 'text', name: 'Text & Regex & Diff', description: 'Diff checker, regex, markdown, inspector, escape', icon: 'FileText' },
  { id: 'generators', name: 'Generators & QR', description: 'QR codes, random secrets & tokens, lorem ipsum', icon: 'Sparkles' },
  { id: 'network', name: 'Web & System Tools', description: 'HTTP codes, chmod permissions, UA parser, meta tags', icon: 'Globe' },
  { id: 'frontend', name: 'CSS & Frontend', description: 'Box shadow, flexbox, grid, SVG to JSX', icon: 'Palette' },
];

export const toolsRegistry: ToolDefinition[] = [
  // 1. Converters
  {
    id: 'json-yaml-converter',
    name: 'JSON ⇄ YAML Converter',
    description: 'Convert between JSON and YAML with syntax validation and indentation control.',
    category: 'converters',
    roles: ['Backend', 'Fullstack', 'SA'],
    icon: 'RefreshCw',
    tags: ['json', 'yaml', 'convert', 'yml', 'config'],
    isPopular: true,
    component: JsonYamlTomlConverter,
  },
  {
    id: 'json-csv-converter',
    name: 'JSON ⇄ CSV / TSV Converter',
    description: 'Convert JSON arrays to tabular CSV/TSV and parse spreadsheets back to JSON.',
    category: 'converters',
    roles: ['DBA', 'BA', 'QA', 'Backend'],
    icon: 'Table',
    tags: ['csv', 'tsv', 'excel', 'json', 'table', 'export'],
    isPopular: true,
    component: JsonCsvConverter,
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert numbers across Binary, Octal, Decimal, and Hex with arbitrary precision.',
    category: 'converters',
    roles: ['Backend', 'Fullstack'],
    icon: 'Binary',
    tags: ['binary', 'hex', 'octal', 'decimal', 'base', 'radix', 'bigint'],
    component: NumberBaseConverter,
  },
  {
    id: 'json-ts-converter',
    name: 'JSON ⇄ TypeScript Converter',
    description: 'Two-way conversion between JSON objects and TypeScript types or interfaces.',
    category: 'converters',
    roles: ['Frontend', 'Backend', 'Fullstack'],
    icon: 'Code2',
    tags: ['json', 'typescript', 'ts', 'interface', 'type', 'convert', 'types'],
    isPopular: true,
    component: JsonTsConverter,
  },
  {
    id: 'case-converter',
    name: 'String Case Converter',
    description: 'Transform identifiers into camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE.',
    category: 'converters',
    roles: ['Frontend', 'Backend', 'DBA'],
    icon: 'Type',
    tags: ['case', 'camel', 'snake', 'kebab', 'pascal', 'uppercase', 'lowercase'],
    component: CaseConverter,
  },
  {
    id: 'curl-to-code',
    name: 'cURL to Code Converter',
    description: 'Convert cURL terminal commands into JavaScript Fetch, Axios, Python, Go, and PHP.',
    category: 'converters',
    roles: ['Backend', 'Frontend', 'QA', 'SA'],
    icon: 'Terminal',
    tags: ['curl', 'fetch', 'axios', 'python', 'go', 'php', 'http', 'api'],
    isPopular: true,
    component: CurlToCodeConverter,
  },
  {
    id: 'properties-yaml-converter',
    name: 'Properties ⇄ YAML Converter',
    description: 'Bidirectional conversion between Java .properties files and structured YAML with indentation & array options.',
    category: 'converters',
    roles: ['Backend', 'Fullstack', 'SA'],
    icon: 'FileText',
    tags: ['properties', 'yaml', 'yml', 'spring', 'springboot', 'java', 'config', 'configuration', 'convert', 'flatten'],
    isPopular: true,
    component: PropertiesYamlConverter,
  },

  // 2. Encoders & Decoders
  {
    id: 'base64-converter',
    name: 'Base64 Text & File Encoder',
    description: 'Encode and decode strings and images to/from standard and URL-safe Base64.',
    category: 'encoders',
    roles: ['All'],
    icon: 'Binary',
    tags: ['base64', 'encode', 'decode', 'btoa', 'atob'],
    isPopular: true,
    component: Base64Converter,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder & Query Inspector',
    description: 'Percent-encode/decode URLs and inspect query parameters in an interactive table.',
    category: 'encoders',
    roles: ['Backend', 'Frontend', 'QA'],
    icon: 'Globe',
    tags: ['url', 'uri', 'encode', 'query', 'params', 'querystring'],
    component: UrlEncoder,
  },
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder / Decoder',
    description: 'Escape and unescape special HTML characters and reserved XML entities.',
    category: 'encoders',
    roles: ['Frontend', 'Fullstack'],
    icon: 'Code',
    tags: ['html', 'entities', 'escape', 'unescape', 'sanitize'],
    component: HtmlEntityEncoder,
  },
  {
    id: 'gzip-compressor',
    name: 'Gzip & Deflate Streamer',
    description: 'Compress and decompress text to Base64 with compression ratio telemetry.',
    category: 'encoders',
    roles: ['Backend', 'SA'],
    icon: 'Gauge',
    tags: ['gzip', 'deflate', 'zlib', 'compress', 'stream', 'zip'],
    component: GzipCompressor,
  },

  // 3. Cryptography & Security
  {
    id: 'hash-generator',
    name: 'Hash & HMAC Generator',
    description: 'Calculate MD5, SHA-1, SHA-256, SHA-512, and RIPEMD hashes with secret HMAC keys.',
    category: 'crypto',
    roles: ['Backend', 'SA', 'QA'],
    icon: 'Hash',
    tags: ['hash', 'sha256', 'md5', 'sha512', 'hmac', 'crypto'],
    isPopular: true,
    component: HashGenerator,
  },
  {
    id: 'aes-encryptor',
    name: 'AES Symmetric Encryption',
    description: 'Encrypt and decrypt plaintext with AES-256 using customizable passphrases.',
    category: 'crypto',
    roles: ['Backend', 'QA'],
    icon: 'Lock',
    tags: ['aes', 'encryption', 'decryption', 'secret', 'passphrase', 'cipher'],
    component: AesEncryptor,
  },
  {
    id: 'jwt-debugger',
    name: 'JWT Debugger & Inspector',
    description: 'Decode and inspect JWT headers, claims payloads, signature, and expiration times.',
    category: 'crypto',
    roles: ['Backend', 'Frontend', 'QA', 'SA'],
    icon: 'KeyRound',
    tags: ['jwt', 'token', 'auth', 'bearer', 'decode', 'claims', 'expired'],
    isPopular: true,
    component: JwtDebugger,
  },
  {
    id: 'password-generator',
    name: 'Secure Password Generator',
    description: 'Generate entropy-scored cryptographically secure passwords and API secrets.',
    category: 'crypto',
    roles: ['All'],
    icon: 'Key',
    tags: ['password', 'generator', 'secret', 'entropy', 'random', 'security'],
    isPopular: true,
    component: PasswordGenerator,
  },
  {
    id: 'uuid-generator',
    name: 'UUID / NanoID / ULID Generator',
    description: 'Generate cryptographically secure UUID v4, time-ordered UUID v7, NanoID, and ULID with format validator.',
    category: 'crypto',
    roles: ['Backend', 'DBA', 'Fullstack'],
    icon: 'Sparkles',
    tags: ['uuid', 'guid', 'v4', 'v7', 'nanoid', 'ulid', 'id'],
    isPopular: true,
    component: UuidGenerator,
  },

  // 4. Formatters & Minifiers
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Key Sorter',
    description: 'Beautify, minify, alphabetically sort keys, and query paths in JSON.',
    category: 'formatters',
    roles: ['All'],
    icon: 'FileCode',
    tags: ['json', 'format', 'prettify', 'minify', 'beautify', 'sort'],
    isPopular: true,
    component: JsonFormatter,
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter & Minifier',
    description: 'Format, indent, fold tags, and minify XML/SOAP payloads.',
    category: 'formatters',
    roles: ['Backend', 'BA', 'SA'],
    icon: 'FileCode',
    tags: ['xml', 'soap', 'format', 'indent', 'minify'],
    component: XmlFormatter,
  },
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter & Validator',
    description: 'Validate and beautify YAML syntax with customizable indentation.',
    category: 'formatters',
    roles: ['Backend', 'SA'],
    icon: 'FileCode',
    tags: ['yaml', 'yml', 'format', 'lint', 'k8s'],
    component: YamlFormatter,
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter & Beautifier',
    description: 'Format PostgreSQL, MySQL, SQLite, and T-SQL queries with keyword casing control.',
    category: 'formatters',
    roles: ['DBA', 'Backend', 'BA'],
    icon: 'Database',
    tags: ['sql', 'postgres', 'mysql', 'sqlite', 'query', 'format', 'beautify'],
    isPopular: true,
    component: SqlFormatter,
  },
  {
    id: 'code-minifier',
    name: 'HTML / CSS / JS Minifier',
    description: 'Rapidly strip comments, whitespaces, and compress web assets on-the-fly.',
    category: 'formatters',
    roles: ['Frontend', 'Fullstack'],
    icon: 'Gauge',
    tags: ['minify', 'compress', 'css', 'js', 'html', 'strip'],
    component: CodeMinifier,
  },

  // 5. Date, Time & Timezones
  {
    id: 'unix-timestamp',
    name: 'Unix Epoch & Timestamp Converter',
    description: 'Convert between Unix epoch (s, ms, µs, ns) and human-readable dates with timezone inspector.',
    category: 'datetime',
    roles: ['Backend', 'DBA', 'QA', 'All'],
    icon: 'Clock',
    tags: ['timestamp', 'epoch', 'unix', 'time', 'date', 'iso8601', 'converter'],
    isPopular: true,
    component: UnixTimestampConverter,
  },
  {
    id: 'world-clock',
    name: 'Timezone Converter & Team Planner',
    description: 'Interactive timezone converter with 24-hour team slider, search across global cities, and working hours.',
    category: 'datetime',
    roles: ['SA', 'BA', 'Fullstack', 'All'],
    icon: 'Globe',
    tags: ['timezone', 'world', 'clock', 'utc', 'meeting', 'time', 'converter', 'dst'],
    isPopular: true,
    component: WorldClockConverter,
  },
  {
    id: 'cron-parser',
    name: 'Cron Expression Parser & Schedule',
    description: 'Translates cron syntax to plain English and computes the next upcoming executions.',
    category: 'datetime',
    roles: ['Backend', 'QA', 'SA'],
    icon: 'Calendar',
    tags: ['cron', 'schedule', 'quartz', 'job', 'timer'],
    isPopular: true,
    component: CronParser,
  },
  {
    id: 'task-reminder',
    name: 'Dev Task Reminder & Alarm',
    description: 'Set developer task reminders with offline audio chime, repeatable schedules (daily, weekdays), and up to 10 tasks.',
    category: 'datetime',
    roles: ['All', 'Backend', 'Frontend', 'Fullstack'],
    icon: 'BellRing',
    tags: ['reminder', 'task', 'alarm', 'schedule', 'todo', 'notification', 'timer', 'alert'],
    isPopular: true,
    component: TaskReminder,
  },

  // 6. Text & Regex & Diff
  {
    id: 'text-diff',
    name: 'Text & Code Diff Checker',
    description: 'Compare two text snippets side-by-side with line and word-level change highlighting.',
    category: 'text',
    roles: ['All'],
    icon: 'GitCompare',
    tags: ['diff', 'compare', 'text', 'code', 'patch'],
    isPopular: true,
    component: TextDiffChecker,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester & Match Inspector',
    description: 'Test regular expressions with flags (g, i, m, s) and detailed capture group breakdown.',
    category: 'text',
    roles: ['All'],
    icon: 'Regex',
    tags: ['regex', 'regexp', 'match', 'pattern', 'test'],
    isPopular: true,
    component: RegexTester,
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Live Preview & Editor',
    description: 'Live split-screen Markdown editor with GitHub-flavored table and HTML export.',
    category: 'text',
    roles: ['All', 'BA'],
    icon: 'FileText',
    tags: ['markdown', 'md', 'preview', 'gfm', 'editor'],
    component: MarkdownEditor,
  },
  {
    id: 'text-inspector',
    name: 'Text Inspector & Hidden Chars',
    description: 'Counts words, characters, byte sizes, and detects rogue zero-width Unicode characters.',
    category: 'text',
    roles: ['QA', 'BA', 'Frontend'],
    icon: 'FileSearch',
    tags: ['text', 'count', 'words', 'unicode', 'hidden', 'characters'],
    component: TextInspector,
  },
  {
    id: 'string-escaper',
    name: 'String Escaper / Unescaper',
    description: 'Escape and unescape quotes, tabs, and special characters for JSON, Java, C#, and SQL.',
    category: 'text',
    roles: ['Backend', 'DBA', 'Frontend'],
    icon: 'Braces',
    tags: ['escape', 'unescape', 'string', 'slash', 'sql', 'json'],
    component: StringEscaper,
  },

  // 7. Generators & QR Tools
  {
    id: 'random-generator',
    name: 'Random Utils & Secrets Generator',
    description: 'Cryptographic tokens, passphrases, random bytes, numbers, IP/MAC, ports, and colors.',
    category: 'generators',
    roles: ['All', 'QA', 'Backend', 'Frontend'],
    icon: 'Sparkles',
    tags: ['random', 'token', 'bytes', 'passphrase', 'numbers', 'network', 'ip', 'generator'],
    isPopular: true,
    component: RandomGenerator,
  },
  {
    id: 'qr-code-generator',
    name: 'Offline QR Code Generator',
    description: 'Generate customizable QR codes for WiFi, vCard, URLs, email, text with SVG/PNG download.',
    category: 'generators',
    roles: ['Frontend', 'QA', 'All'],
    icon: 'QrCode',
    tags: ['qr', 'qrcode', 'barcode', 'generator', 'wifi', 'vcard', 'svg'],
    isPopular: true,
    component: QrCodeGenerator,
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Dummy Text',
    description: 'Generate customized dummy placeholder paragraphs, sentences, and words.',
    category: 'generators',
    roles: ['Frontend', 'BA'],
    icon: 'FileText',
    tags: ['lorem', 'ipsum', 'dummy', 'text', 'placeholder'],
    component: LoremIpsumGenerator,
  },

  // 8. Web & Network Utilities
  {
    id: 'http-status-lookup',
    name: 'HTTP Status Codes Reference',
    description: 'Complete offline guide to 1xx-5xx HTTP status codes, headers, and RFC specs.',
    category: 'network',
    roles: ['Backend', 'Frontend', 'QA', 'SA'],
    icon: 'Globe',
    tags: ['http', 'status', 'rest', 'api', 'codes', '404', '500'],
    component: HttpStatusLookup,
  },
  {
    id: 'chmod-calculator',
    name: 'UNIX Chmod Permission Calculator',
    description: 'Interactive permission matrix builder (rwxr-xr-x, 755, 644) and command generator.',
    category: 'network',
    roles: ['Backend', 'SA'],
    icon: 'Terminal',
    tags: ['chmod', 'permissions', 'unix', 'linux', 'octal', '755'],
    component: ChmodCalculator,
  },
  {
    id: 'user-agent-parser',
    name: 'User-Agent & Device Inspector',
    description: 'Offline parsing of browser version, OS, device form factor, and rendering engine.',
    category: 'network',
    roles: ['Frontend', 'QA'],
    icon: 'Monitor',
    tags: ['useragent', 'ua', 'browser', 'device', 'os'],
    component: UserAgentParser,
  },
  {
    id: 'meta-tags-previewer',
    name: 'Meta Tags & OpenGraph Preview',
    description: 'Preview Twitter cards, Facebook OpenGraph, and Google search SERPs with code export.',
    category: 'network',
    roles: ['Frontend', 'QA'],
    icon: 'Share2',
    tags: ['seo', 'meta', 'opengraph', 'twitter', 'social', 'preview'],
    component: MetaTagsPreviewer,
  },

  // 9. Frontend & Visual Design Tools
  {
    id: 'css-box-shadow',
    name: 'CSS Box Shadow Generator',
    description: 'Visual shadow layers and glassmorphism builder with direct CSS export.',
    category: 'frontend',
    roles: ['Frontend'],
    icon: 'Layers',
    tags: ['css', 'shadow', 'boxshadow', 'glassmorphism', 'ui'],
    component: CssBoxShadowGenerator,
  },
  {
    id: 'css-flex-grid',
    name: 'CSS Flexbox & Grid Playground',
    description: 'Interactive playground to test flex and grid alignments, gaps, and generated CSS.',
    category: 'frontend',
    roles: ['Frontend'],
    icon: 'LayoutGrid',
    tags: ['css', 'flexbox', 'grid', 'layout', 'alignment'],
    component: CssFlexGridPlayground,
  },
  {
    id: 'svg-to-jsx',
    name: 'SVG to JSX & Data URI',
    description: 'Convert SVG markup into clean React TypeScript JSX components and CSS Data URIs.',
    category: 'frontend',
    roles: ['Frontend'],
    icon: 'Code2',
    tags: ['svg', 'jsx', 'react', 'datauri', 'vector'],
    component: SvgToJsxConverter,
  },
];
