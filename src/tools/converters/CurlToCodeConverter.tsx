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
import { Terminal } from 'lucide-react';

export const CurlToCodeConverter: React.FC = () => {
  const [curl, setCurl] = useState(`curl -X POST https://api.example.com/v1/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer my-secret-token" \\
  -d '{"name": "Alice", "role": "developer"}'`);
  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'php'>('fetch');

  // Simple, offline parser for cURL commands
  const parseCurl = (cmd: string) => {
    const clean = cmd.replace(/\\\r?\n/g, ' ').trim();
    let method = 'GET';
    let url = '';
    const headers: Record<string, string> = {};
    let data: string | null = null;

    // extract method
    const methodMatch = clean.match(/(?:-X|--request)\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    // extract headers safely
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/gi;
    let hMatch;
    let headerLoopCount = 0;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      if (++headerLoopCount > 100) break;
      const parts = hMatch[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
      if (hMatch.index === headerRegex.lastIndex) headerRegex.lastIndex++;
    }

    // extract data
    const dataMatch = clean.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?=\s+-[a-zA-Z]|$)/i);
    if (dataMatch) {
      data = dataMatch[1];
      if (method === 'GET') method = 'POST';
    }

    // extract url
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/i) || clean.match(/(?:curl\s+)?["']?(https?:\/\/[^"'\s]+)["']?/i);
    if (urlMatch) {
      url = urlMatch[0].replace(/^curl\s+/, '').replace(/['"]/g, '');
    }

    return { method, url, headers, data };
  };

  const generateCode = () => {
    const parsed = parseCurl(curl);
    if (!parsed.url) return '// Please enter a valid curl command containing a URL';

    const safeDataString = parsed.data
      ? (() => {
          try {
            return JSON.stringify(JSON.parse(parsed.data), null, 2);
          } catch {
            return JSON.stringify(parsed.data);
          }
        })()
      : null;

    if (targetLang === 'fetch') {
      return `fetch("${parsed.url}", {
  method: "${parsed.method}",
  headers: ${JSON.stringify(parsed.headers, null, 4)},${safeDataString ? `\n  body: JSON.stringify(${safeDataString}),` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
    }

    if (targetLang === 'axios') {
      return `import axios from 'axios';

axios({
  method: '${parsed.method.toLowerCase()}',
  url: '${parsed.url}',
  headers: ${JSON.stringify(parsed.headers, null, 4)},${safeDataString ? `\n  data: ${safeDataString},` : ''}
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
    }

    if (targetLang === 'python') {
      const headerLines = Object.entries(parsed.headers)
        .map(([k, v]) => `    "${k}": "${v}",`)
        .join('\n');
      return `import requests
import json

url = "${parsed.url}"
headers = {
${headerLines}
}
${safeDataString ? `payload = ${safeDataString}\n` : ''}
response = requests.${parsed.method.toLowerCase()}(
    url,
    headers=headers,${safeDataString ? '\n    json=payload' : ''}
)

print(response.status_code)
print(response.json())`;
    }

    if (targetLang === 'go') {
      return `package main

import (
    "fmt"
    "net/http"
    "io"${safeDataString ? '\n    "strings"' : ''}
)

func main() {
    url := "${parsed.url}"
    ${safeDataString ? `payload := strings.NewReader(\`${parsed.data}\`)\n    req, err := http.NewRequest("${parsed.method}", url, payload)` : `req, err := http.NewRequest("${parsed.method}", url, nil)`}
    if err != nil {
        panic(err)
    }

    ${Object.entries(parsed.headers)
      .map(([k, v]) => `req.Header.Add("${k}", "${v}")`)
      .join('\n    ')}

    res, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer res.Body.Close()

    body, _ := io.ReadAll(res.Body)
    fmt.Println(string(body))
}`;
    }

    if (targetLang === 'php') {
      return `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${parsed.url}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${parsed.method}',
  ${parsed.data ? `CURLOPT_POSTFIELDS => ${JSON.stringify(parsed.data)},` : ''}
  CURLOPT_HTTPHEADER => array(
    ${Object.entries(parsed.headers).map(([k, v]) => `'${k}: ${v}'`).join(',\n    ')}
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }

    return '';
  };

  return (
    <div className="space-y-4">
      {/* Target Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 card-3d rounded-xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Terminal className="w-4 h-4 text-emerald-500 mr-1" />
          <span className="text-[var(--text-secondary)] mr-2 font-medium">Target Code:</span>
          {(['fetch', 'axios', 'python', 'go', 'php'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setTargetLang(lang)}
              className={`px-3 py-1.5 rounded-lg font-medium transition uppercase text-[11px] cursor-pointer ${
                targetLang === lang
                  ? 'btn-3d-active'
                  : 'btn-3d text-[var(--text-secondary)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="cURL Command Input"
          value={curl}
          onChange={setCurl}
          language="bash"
        />
        <CodeEditor
          label={`Generated ${targetLang.toUpperCase()} Code`}
          value={generateCode()}
          readOnly
          language={targetLang === 'python' ? 'python' : targetLang === 'go' ? 'go' : targetLang === 'php' ? 'php' : 'javascript'}
        />
      </div>
    </div>
  );
};
