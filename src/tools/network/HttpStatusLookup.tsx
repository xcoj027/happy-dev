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
import { Search, Globe, ExternalLink } from 'lucide-react';

const statusCodes = [
  { code: 200, name: 'OK', category: '2xx Success', desc: 'Standard response for successful HTTP requests.' },
  { code: 201, name: 'Created', category: '2xx Success', desc: 'Request fulfilled and resulted in a new resource being created (POST/PUT).' },
  { code: 202, name: 'Accepted', category: '2xx Success', desc: 'Request accepted for processing, but processing has not been completed.' },
  { code: 204, name: 'No Content', category: '2xx Success', desc: 'Successfully processed request, not returning any content (common in DELETE/PUT).' },
  { code: 301, name: 'Moved Permanently', category: '3xx Redirection', desc: 'Resource permanently moved to the URI specified in the Location header.' },
  { code: 302, name: 'Found (Temporary Redirect)', category: '3xx Redirection', desc: 'Resource temporarily resides under a different URI.' },
  { code: 304, name: 'Not Modified', category: '3xx Redirection', desc: 'Resource has not been modified since the version specified in If-Modified-Since headers.' },
  { code: 400, name: 'Bad Request', category: '4xx Client Error', desc: 'Server cannot process the request due to client error (malformed syntax, invalid framing).' },
  { code: 401, name: 'Unauthorized', category: '4xx Client Error', desc: 'Authentication is required and has failed or has not yet been provided.' },
  { code: 403, name: 'Forbidden', category: '4xx Client Error', desc: 'Server understood the request, but refuses to authorize it (insufficient permissions).' },
  { code: 404, name: 'Not Found', category: '4xx Client Error', desc: 'The requested resource could not be found on this server.' },
  { code: 405, name: 'Method Not Allowed', category: '4xx Client Error', desc: 'Request method (GET/POST/DELETE) is not supported for the requested resource.' },
  { code: 408, name: 'Request Timeout', category: '4xx Client Error', desc: 'Server timed out waiting for the client request.' },
  { code: 409, name: 'Conflict', category: '4xx Client Error', desc: 'Request could not be processed because of conflict in the current state of the resource.' },
  { code: 422, name: 'Unprocessable Content', category: '4xx Client Error', desc: 'Request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 429, name: 'Too Many Requests', category: '4xx Client Error', desc: 'The user has sent too many requests in a given amount of time (Rate Limited).' },
  { code: 500, name: 'Internal Server Error', category: '5xx Server Error', desc: 'A generic error message when an unexpected condition was encountered on the server.' },
  { code: 502, name: 'Bad Gateway', category: '5xx Server Error', desc: 'Server received an invalid response from the upstream server while acting as a gateway/proxy.' },
  { code: 503, name: 'Service Unavailable', category: '5xx Server Error', desc: 'Server cannot handle the request due to temporary overloading or maintenance.' },
  { code: 504, name: 'Gateway Timeout', category: '5xx Server Error', desc: 'Gateway/proxy did not receive a timely response from upstream server.' },
];

export const HttpStatusLookup: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = statusCodes.filter((item) => {
    const matchesSearch =
      item.code.toString().includes(search) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category.startsWith(categoryFilter);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, name, or description..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {['All', '2xx', '3xx', '4xx', '5xx'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                categoryFilter === cat ? 'bg-emerald-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item) => {
          const color = item.code < 300
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : item.code < 400
            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            : item.code < 500
            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

          return (
            <div
              key={item.code}
              className="p-3.5 bg-gray-900/60 border border-gray-800 rounded-xl space-y-1.5 hover:border-gray-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${color}`}>
                    {item.code}
                  </span>
                  <span className="font-semibold text-gray-200 text-sm">{item.name}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{item.category}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
