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
  const [curl, setCurl] = useState('');
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

    // extract headers
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/gi;
    let hMatch;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      const parts = hMatch[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }

    // extract data
    const dataMatch = clean.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?=\s+-[a-zA-Z]|$)/i);
    if (dataMatch) {
      data = dataMatch[1];
      if (method === 'GET') method = 'POST';
    }

    // extract url
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/i);
    if (urlMatch) url = urlMatch[0];

    return { method, url, headers, data };
  };

  const generateCode = () => {
    const parsed = parseCurl(curl);
    if (!parsed.url) return '// Please enter a valid curl command with a URL';

    if (targetLang === 'fetch') {
      const options: any = {
        method: parsed.method,
        headers: parsed.headers,
      };
      if (parsed.data) {
        try {
          options.body = JSON.parse(parsed.data);
        } catch {
          options.body = parsed.data;
        }
      }
      return `fetch("${parsed.url}", {
  method: "${parsed.method}",
  headers: ${JSON.stringify(parsed.headers, null, 4)},
  ${parsed.data ? `body: JSON.stringify(${parsed.data})` : ''}
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
  headers: ${JSON.stringify(parsed.headers, null, 4)},
  ${parsed.data ? `data: ${parsed.data}` : ''}
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
    }

    if (targetLang === 'python') {
      return `import requests
import json

url = "${parsed.url}"
headers = ${JSON.stringify(parsed.headers, null, 4)}
${parsed.data ? `payload = ${parsed.data}\nresponse = requests.request("${parsed.method}", url, headers=headers, json=payload)` : `response = requests.request("${parsed.method}", url, headers=headers)`}

print(response.status_code)
print(response.json())`;
    }

    if (targetLang === 'go') {
      return `package main

import (
\t"fmt"
\t"net/http"
\t"io"
\t"strings"
)

func main() {
\turl := "${parsed.url}"
\tmethod := "${parsed.method}"

\t${parsed.data ? `payload := strings.NewReader(\`${parsed.data}\`)\n\tclient := &http.Client{}\n\treq, err := http.NewRequest(method, url, payload)` : `client := &http.Client{}\n\treq, err := http.NewRequest(method, url, nil)`}
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\t${Object.entries(parsed.headers).map(([k, v]) => `req.Header.Add("${k}", "${v}")`).join('\n\t')}

\tres, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(string(body))
}`;
    }

    if (targetLang === 'php') {
      return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${parsed.url}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${parsed.method}',
  ${parsed.data ? `CURLOPT_POSTFIELDS => '${parsed.data}',` : ''}
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="flex items-center gap-1.5 text-xs">
          <Terminal className="w-4 h-4 text-emerald-400 mr-1" />
          <span className="text-gray-400 mr-2">Target Code:</span>
          {(['fetch', 'axios', 'python', 'go', 'php'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setTargetLang(lang)}
              className={`px-3 py-1.5 rounded-lg font-medium transition uppercase text-[11px] ${
                targetLang === lang
                  ? 'bg-emerald-500 text-gray-950 font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
          language={targetLang === 'python' ? 'python' : targetLang === 'go' ? 'go' : 'javascript'}
        />
      </div>
    </div>
  );
};
