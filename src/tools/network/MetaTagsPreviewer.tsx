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
import { Search, Share2, Globe, MessageSquare, Code2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const MetaTagsPreviewer: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [author, setAuthor] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [cardType, setCardType] = useState<'summary_large_image' | 'summary'>('summary_large_image');
  const [pageType, setPageType] = useState<'website' | 'article' | 'product'>('website');
  const [robots, setRobots] = useState('index, follow');

  const [previewTab, setPreviewTab] = useState<'serp' | 'twitter' | 'opengraph' | 'discord'>('serp');
  const [codeTab, setCodeTab] = useState<'html' | 'nextjs' | 'jsonld'>('html');

  // Title & description validation counters
  const titleLen = title.length;
  const descLen = description.length;

  const getTitleStatus = () => {
    if (titleLen === 0) return { text: 'Empty', color: 'text-[var(--text-muted)]' };
    if (titleLen < 30) return { text: 'Too short (< 30)', color: 'text-amber-400' };
    if (titleLen <= 60) return { text: 'Optimal (30-60)', color: 'text-emerald-400' };
    return { text: 'Too long (> 60)', color: 'text-rose-400' };
  };

  const getDescStatus = () => {
    if (descLen === 0) return { text: 'Empty', color: 'text-[var(--text-muted)]' };
    if (descLen < 80) return { text: 'Too short (< 80)', color: 'text-amber-400' };
    if (descLen <= 160) return { text: 'Optimal (80-160)', color: 'text-emerald-400' };
    return { text: 'Too long (> 160)', color: 'text-rose-400' };
  };

  // Safe hostname
  let parsedHost = 'example.com';
  try {
    if (url) parsedHost = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {}

  // HTML Meta Code
  const metaHtml = `<!-- Primary Meta Tags -->
<title>${title || 'Page Title'}</title>
<meta name="title" content="${title || 'Page Title'}">
<meta name="description" content="${description}">
<meta name="robots" content="${robots}">
${author ? `<meta name="author" content="${author}">\n` : ''}${url ? `<link rel="canonical" href="${url}">\n` : ''}
<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="${pageType}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title || 'Page Title'}">
<meta property="og:description" content="${description}">
${imageUrl ? `<meta property="og:image" content="${imageUrl}">\n` : ''}${siteName ? `<meta property="og:site_name" content="${siteName}">\n` : ''}
<!-- Twitter / X -->
<meta name="twitter:card" content="${cardType}">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title || 'Page Title'}">
<meta name="twitter:description" content="${description}">
${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">\n` : ''}${twitterHandle ? `<meta name="twitter:site" content="${twitterHandle.startsWith('@') ? twitterHandle : '@' + twitterHandle}">\n` : ''}`;

  // Next.js Metadata
  const nextJsMetadata = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ${JSON.stringify(title || 'Page Title')},
  description: ${JSON.stringify(description)},
  ${robots ? `robots: ${JSON.stringify(robots)},\n  ` : ''}${author ? `authors: [{ name: ${JSON.stringify(author)} }],\n  ` : ''}${url ? `alternates: { canonical: ${JSON.stringify(url)} },\n  ` : ''}openGraph: {
    type: ${JSON.stringify(pageType)},
    url: ${JSON.stringify(url)},
    title: ${JSON.stringify(title || 'Page Title')},
    description: ${JSON.stringify(description)},
    ${siteName ? `siteName: ${JSON.stringify(siteName)},\n    ` : ''}${imageUrl ? `images: [{ url: ${JSON.stringify(imageUrl)} }],\n  ` : ''}},
  twitter: {
    card: ${JSON.stringify(cardType)},
    title: ${JSON.stringify(title || 'Page Title')},
    description: ${JSON.stringify(description)},
    ${imageUrl ? `images: [${JSON.stringify(imageUrl)}],\n    ` : ''}${twitterHandle ? `creator: ${JSON.stringify(twitterHandle.startsWith('@') ? twitterHandle : '@' + twitterHandle)},\n  ` : ''}},
};`;

  // JSON-LD Schema
  const jsonLdSchema = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': pageType === 'article' ? 'Article' : 'WebPage',
      name: title || 'Page Title',
      description: description || undefined,
      url: url || undefined,
      image: imageUrl || undefined,
      author: author ? { '@type': 'Person', name: author } : undefined,
      publisher: siteName ? { '@type': 'Organization', name: siteName } : undefined,
    },
    null,
    2
  );

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {/* Configuration Form Card */}
      <div className="card-3d p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Metadata & OpenGraph Properties</span>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setDescription('');
              setUrl('');
              setImageUrl('');
              setSiteName('');
              setAuthor('');
              setTwitterHandle('');
            }}
            className="text-xs text-[var(--text-muted)] hover:text-rose-400 transition cursor-pointer"
          >
            Clear Fields
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Title */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-secondary)] font-medium">Page Title</label>
              <span className={`text-[10px] ${getTitleStatus().color}`}>
                {titleLen} chars • {getTitleStatus().text}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HappyDev - Modern Offline Developer Utilities Suite"
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Canonical URL */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Canonical URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/blog/article"
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-secondary)] font-medium">Meta Description</label>
              <span className={`text-[10px] ${getDescStatus().color}`}>
                {descLen} chars • {getDescStatus().text}
              </span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a concise, compelling summary of the page content for search engines and social cards..."
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none resize-none"
            />
          </div>

          {/* Social Image URL */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Social Image (OG/Twitter)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Site Name */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="HappyDev"
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Twitter Handle */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Twitter Handle</label>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="@developer"
              className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          {/* Page Type */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Page Type</label>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value as any)}
              className="input-3d w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>

          {/* Twitter Card Type */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Twitter Card Format</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value as any)}
              className="input-3d w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="summary_large_image">summary_large_image (Hero Banner)</option>
              <option value="summary">summary (Square Thumbnail)</option>
            </select>
          </div>

          {/* Robots */}
          <div>
            <label className="text-[var(--text-secondary)] block mb-1 font-medium">Robots Directives</label>
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              className="input-3d w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="index, follow">index, follow (Standard)</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="noindex, nofollow">noindex, nofollow (Private)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Live Previews & Code Export Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Column: Live Previews */}
        <div className="card-3d p-4 rounded-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Live Platform Preview</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewTab('serp')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  previewTab === 'serp' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('twitter')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  previewTab === 'twitter' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                Twitter / X
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('opengraph')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  previewTab === 'opengraph' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                Open Graph
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('discord')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  previewTab === 'discord' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                Discord
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-3 rounded-xl well-3d min-h-[220px]">
            {/* Google SERP Preview */}
            {previewTab === 'serp' && (
              <div data-theme-island className="w-full max-w-lg p-4 rounded-xl bg-white dark:bg-[#1a1e27] space-y-1.5 text-left font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                    {parsedHost.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {parsedHost} <span className="text-gray-400">› {url ? url.replace(/https?:\/\/[^/]+/, '') || 'home' : 'page'}</span>
                  </div>
                </div>
                <div className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
                  {title || 'Example Page Title - Comprehensive Guide'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                  {description || 'Provide a meta description to see how your snippet appears in Google organic search results.'}
                </div>
              </div>
            )}

            {/* Twitter / X Preview */}
            {previewTab === 'twitter' && (
              <div data-theme-island className="w-full max-w-md rounded-2xl overflow-hidden bg-black text-white">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Social Card"
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-tr from-sky-900/40 via-indigo-950/40 to-slate-900 flex items-center justify-center text-xs text-gray-400 font-mono">
                    [1200 x 630 Card Banner]
                  </div>
                )}
                <div className="p-3.5 space-y-1">
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">{parsedHost}</div>
                  <div className="text-sm font-bold text-gray-100 truncate">{title || 'Page Title'}</div>
                  <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{description || 'Page description will be previewed here.'}</div>
                </div>
              </div>
            )}

            {/* Open Graph (Facebook / LinkedIn) */}
            {previewTab === 'opengraph' && (
              <div data-theme-island className="w-full max-w-md rounded-xl overflow-hidden bg-[#242526] text-white">
                {imageUrl ? (
                  <img src={imageUrl} alt="OG Card" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-r from-blue-900/40 to-indigo-900/30 flex items-center justify-center text-xs text-gray-400 font-mono">
                    [OpenGraph Image]
                  </div>
                )}
                <div className="p-3 space-y-1 bg-[#18191a]">
                  <div className="text-[10px] text-gray-400 uppercase">{parsedHost}</div>
                  <div className="text-sm font-semibold text-gray-200 truncate">{title || 'Social Card Title'}</div>
                  <div className="text-xs text-gray-400 line-clamp-2">{description || 'OpenGraph description goes here.'}</div>
                </div>
              </div>
            )}

            {/* Discord Embed */}
            {previewTab === 'discord' && (
              <div data-theme-island className="w-full max-w-md p-3 rounded-lg bg-[#2b2d31] border-l-4 border-emerald-500 space-y-1.5 text-left text-xs font-sans">
                {siteName && <div className="text-[10px] text-gray-400">{siteName}</div>}
                <div className="text-sm font-semibold text-[#00a8fc] hover:underline cursor-pointer">
                  {title || 'Page Title Preview'}
                </div>
                <div className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                  {description || 'Discord preview showing description and media embed.'}
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="Discord Embed" className="rounded-md max-h-36 object-cover mt-2" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Export */}
        <div className="card-3d p-4 rounded-xl flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Export Code</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCodeTab('html')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  codeTab === 'html' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                HTML &lt;head&gt;
              </button>
              <button
                type="button"
                onClick={() => setCodeTab('nextjs')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  codeTab === 'nextjs' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                Next.js (TS)
              </button>
              <button
                type="button"
                onClick={() => setCodeTab('jsonld')}
                className={`btn-3d px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  codeTab === 'jsonld' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
                }`}
              >
                JSON-LD
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{codeTab === 'html' ? 'Standard HTML5 Meta Tags' : codeTab === 'nextjs' ? 'Next.js App Router Metadata' : 'Schema.org JSON-LD'}</span>
              <CopyButton
                text={codeTab === 'html' ? metaHtml : codeTab === 'nextjs' ? nextJsMetadata : jsonLdSchema}
                label="Copy Code"
              />
            </div>
            <pre className="well-3d p-3 rounded-xl flex-1 overflow-auto max-h-[340px] text-xs font-mono text-[var(--well-text)] select-all leading-relaxed">
              {codeTab === 'html' ? metaHtml : codeTab === 'nextjs' ? nextJsMetadata : jsonLdSchema}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
