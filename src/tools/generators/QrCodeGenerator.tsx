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

import { TextArea, TextInput } from '../../components/common/TextInput';
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { CopyButton } from '../../components/common/CopyButton';
import { QrCode, Download, Wifi, User, Mail, Phone, MessageSquare, MapPin, Link2, FileText } from 'lucide-react';

type QrType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'geo';

export const QrCodeGenerator: React.FC = () => {
  const [qrType, setQrType] = useState<QrType>('url');

  // Payload inputs
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // WiFi payload
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard payload
  const [vcardName, setVcardName] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  // Email payload
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone & SMS
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Geo
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Appearance options
  const [colorDark, setColorDark] = useState('#000000');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(2);

  const [logo, setLogo] = useState<{ dataUrl: string; name: string } | null>(null);
  const [logoSize, setLogoSize] = useState(18);
  const [logoPadding, setLogoPadding] = useState(2);
  const [logoError, setLogoError] = useState('');
  const [renderError, setRenderError] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const logoRequest = useRef(0);
  useEffect(() => () => { logoRequest.current++; }, []);

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    const request = ++logoRequest.current;
    setLogoError('');
    setLogoLoading(true);
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG, or WebP logo.');
      if (file.size > 5 * 1024 * 1024) throw new Error('Logo must be 5 MB or smaller.');
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Unable to read the logo.'));
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = data;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 16000000) throw new Error('Use a logo with at most 16 megapixels.');
      const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image rendering is unavailable.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (request === logoRequest.current) setLogo({ dataUrl: canvas.toDataURL('image/png'), name: file.name });
    } catch (cause) {
      if (request === logoRequest.current) setLogoError(cause instanceof Error ? cause.message : 'Unable to load logo.');
    } finally {
      if (request === logoRequest.current) setLogoLoading(false);
    }
  };

  // Output
  const [dataUrl, setDataUrl] = useState('');
  const [svgString, setSvgString] = useState('');

  // Construct raw payload
  const getQrPayload = (): string => {
    switch (qrType) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput;
      case 'wifi':
        if (!wifiSsid.trim()) return '';
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        if (!vcardName.trim()) return '';
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          vcardOrg ? `ORG:${vcardOrg}` : '',
          vcardTitle ? `TITLE:${vcardTitle}` : '',
          vcardPhone ? `TEL:${vcardPhone}` : '',
          vcardEmail ? `EMAIL:${vcardEmail}` : '',
          vcardUrl ? `URL:${vcardUrl}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');
      case 'email':
        if (!emailTo.trim()) return '';
        const params = new URLSearchParams();
        if (emailSubject) params.set('subject', emailSubject);
        if (emailBody) params.set('body', emailBody);
        const query = params.toString();
        return `mailto:${emailTo}${query ? `?${query}` : ''}`;
      case 'phone':
        if (!phoneNumber.trim()) return '';
        return `tel:${phoneNumber.trim()}`;
      case 'sms':
        if (!phoneNumber.trim()) return '';
        return `smsto:${phoneNumber.trim()}:${smsMessage}`;
      case 'geo':
        if (!latitude.trim() || !longitude.trim()) return '';
        return `geo:${latitude.trim()},${longitude.trim()}`;
      default:
        return '';
    }
  };

  const payload = getQrPayload();

  useEffect(() => {
    let cancelled = false;
    setDataUrl('');
    setSvgString('');
    setRenderError('');
    if (!payload.trim()) return;
    const render = async () => {
      try {
        const options = {
          width: size,
          margin: logo ? Math.max(4, margin) : margin,
          errorCorrectionLevel: logo ? 'H' as const : errorLevel,
          color: { dark: colorDark, light: colorLight },
        };
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, payload, options);
        let svg = await QRCode.toString(payload, { ...options, type: 'svg' });
        if (logo) {
          const image = new Image();
          image.src = logo.dataUrl;
          await image.decode();
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Image rendering is unavailable.');
          const box = canvas.width * logoSize / 100;
          const padding = canvas.width * logoPadding / 100;
          const x = (canvas.width - box) / 2;
          const available = box - padding * 2;
          const scale = available / Math.max(image.naturalWidth, image.naturalHeight);
          const width = image.naturalWidth * scale;
          const height = image.naturalHeight * scale;
          context.fillStyle = colorLight;
          context.fillRect(x, x, box, box);
          context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
          const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
          if (!viewBox) throw new Error('Unable to embed logo in SVG.');
          const factor = Number(viewBox[1]) / canvas.width;
          const overlay = `<rect x="${x * factor}" y="${x * factor}" width="${box * factor}" height="${box * factor}" fill="${colorLight}"/><image href="${logo.dataUrl}" x="${(canvas.width - width) / 2 * factor}" y="${(canvas.height - height) / 2 * factor}" width="${width * factor}" height="${height * factor}" preserveAspectRatio="xMidYMid meet"/>`;
          svg = svg.replace('</svg>', `${overlay}</svg>`);
        }
        if (!cancelled) { setDataUrl(canvas.toDataURL('image/png')); setSvgString(svg); }
      } catch (cause) {
        if (!cancelled) setRenderError(cause instanceof Error ? cause.message : 'Unable to generate QR code.');
      }
    };
    void render();
    return () => { cancelled = true; };
  }, [payload, colorDark, colorLight, errorLevel, size, margin, logo, logoSize, logoPadding]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode_${Date.now()}.png`;
    a.click();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full space-y-4">
      {renderError && <div role="alert" className="rounded-xl p-3 text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400">{renderError}</div>}
      {/* Payload Type Selector */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => setQrType('url')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'url' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-pink-400" />
          <span>Website URL</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('text')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'text' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Plain Text</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('wifi')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'wifi' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-sky-400" />
          <span>WiFi Network</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('vcard')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'vcard' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>Contact (vCard)</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('email')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'email' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Email</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('phone')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'phone' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Phone Call</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('sms')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'sms' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
          <span>SMS Message</span>
        </button>
        <button
          type="button"
          onClick={() => setQrType('geo')}
          className={`btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            qrType === 'geo' ? 'btn-3d-active' : 'text-[var(--text-secondary)]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Geo Location</span>
        </button>
      </div>

      {/* Main Grid: Inputs on Left, QR Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="card-3d p-4 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">QR Payload Content</span>

            {/* URL */}
            {qrType === 'url' && (
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 text-xs">Target URL</label>
                <TextInput
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://github.com/my-repo"
                  className="input-3d w-full px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                />
              </div>
            )}

            {/* Plain Text */}
            {qrType === 'text' && (
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 text-xs">Plain Text Content</label>
                <TextArea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type any message, token, secret or text string..."
                  className="input-3d w-full px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none resize-none"
                />
              </div>
            )}

            {/* WiFi */}
            {qrType === 'wifi' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Network SSID (Name)</label>
                  <TextInput
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. Office_WiFi_5G"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">WiFi Password</label>
                  <TextInput
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Wireless password"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Security Encryption</label>
                  <select
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value as any)}
                    className="input-3d w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="wifiHidden"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="rounded accent-sky-500 cursor-pointer"
                  />
                  <label htmlFor="wifiHidden" className="text-[var(--text-secondary)] cursor-pointer select-none">
                    Hidden SSID network
                  </label>
                </div>
              </div>
            )}

            {/* vCard */}
            {qrType === 'vcard' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Full Name *</label>
                  <TextInput
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    placeholder="John Doe"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Organization / Company</label>
                  <TextInput
                    type="text"
                    value={vcardOrg}
                    onChange={(e) => setVcardOrg(e.target.value)}
                    placeholder="Acme Corp"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Job Title</label>
                  <TextInput
                    type="text"
                    value={vcardTitle}
                    onChange={(e) => setVcardTitle(e.target.value)}
                    placeholder="Lead Engineer"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Phone Number</label>
                  <TextInput
                    type="tel"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Email Address</label>
                  <TextInput
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Website</label>
                  <TextInput
                    type="url"
                    value={vcardUrl}
                    onChange={(e) => setVcardUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {qrType === 'email' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Recipient Email</label>
                  <TextInput
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="support@example.com"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Subject Line</label>
                  <TextInput
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Feedback / Inquiry"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Message Body</label>
                  <TextArea
                    rows={2}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Pre-filled email body..."
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            {qrType === 'phone' && (
              <div>
                <label className="text-[var(--text-secondary)] block mb-1 text-xs">Phone Number</label>
                <TextInput
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="input-3d w-full px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                />
              </div>
            )}

            {/* SMS */}
            {qrType === 'sms' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Phone Number</label>
                  <TextInput
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">SMS Message</label>
                  <TextArea
                    rows={2}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Text message to pre-fill..."
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Geo */}
            {qrType === 'geo' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Latitude</label>
                  <TextInput
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="37.7749"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Longitude</label>
                  <TextInput
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-122.4194"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="card-3d p-4 rounded-xl space-y-3">
            <label htmlFor="qr-logo-upload" className="block text-xs font-semibold text-[var(--text-primary)]">Center logo</label>
            <input id="qr-logo-upload" type="file" accept="image/png,image/jpeg,image/webp" className="input-3d w-full p-2 rounded-lg text-xs text-[var(--text-secondary)]" onChange={e => { void uploadLogo(e.target.files?.[0]); e.target.value = ''; }} />
            {logoLoading && <p role="status" className="text-xs text-[var(--text-secondary)]">Loading logo…</p>}
            {logoError && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{logoError}</p>}
            {logo && <>
              <div className="flex items-center gap-3">
                <img src={logo.dataUrl} alt="Uploaded logo" className="w-12 h-12 object-contain rounded bg-white" data-theme-island data-keep-white />
                <span className="flex-1 min-w-0 truncate text-xs text-[var(--text-secondary)]">{logo.name}</span>
                <button type="button" onClick={() => { logoRequest.current++; setLogo(null); setLogoError(''); setLogoLoading(false); }} className="btn-3d rounded-lg px-3 py-1.5 text-xs cursor-pointer">Remove logo</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <label className="space-y-1">Logo area: {logoSize}%
                  <input aria-label="Logo size" type="range" min="10" max="25" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} className="block w-full" />
                </label>
                <label className="space-y-1">Logo padding: {logoPadding}%
                  <input aria-label="Logo padding" type="range" min="0" max="4" value={logoPadding} onChange={e => setLogoPadding(Number(e.target.value))} className="block w-full" />
                </label>
              </div>
              <p className="text-xs text-[var(--text-muted)]">High error correction and a standard quiet zone are enabled for logos. Keep the logo small and scan-test your final QR code.</p>
            </>}
            <p className="text-xs text-[var(--text-muted)]">PNG, JPEG, or WebP, up to 5 MB. Logos stay on your device and are embedded in PNG and SVG exports.</p>
          </div>

          {/* QR Design & Style Card */}
          <div className="card-3d p-4 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Visual Style & Error Correction</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Error Correction</label>
                <select
                  value={logo ? 'H' : errorLevel}
                  disabled={!!logo}
                  onChange={(e) => setErrorLevel(e.target.value as any)}
                  className="input-3d w-full px-2 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="L">L (7% Recovery)</option>
                  <option value="M">M (15% Recovery)</option>
                  <option value="Q">Q (25% Recovery)</option>
                  <option value="H">H (30% Recovery)</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Resolution: {size}px</label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="input-3d w-full px-2 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value={200}>200 x 200</option>
                  <option value={300}>300 x 300</option>
                  <option value={500}>500 x 500</option>
                  <option value={1000}>1000 x 1000 (HD)</option>
                </select>
              </div>
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Quiet Zone (Margin)</label>
                <select
                  value={logo ? Math.max(4, margin) : margin}
                  disabled={!!logo}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="input-3d w-full px-2 py-1.5 rounded text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value={1}>1 Module (Compact)</option>
                  <option value={2}>2 Modules</option>
                  <option value={4}>4 Modules (Standard)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="color"
                    value={colorDark}
                    onChange={(e) => setColorDark(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[var(--text-secondary)] text-[11px]">Dark</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="color"
                    value={colorLight}
                    onChange={(e) => setColorLight(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[var(--text-secondary)] text-[11px]">Light</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="card-3d p-4 rounded-xl flex-1 flex flex-col items-center justify-between text-center min-h-[360px]">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Live QR Preview</span>

            <div data-theme-island data-keep-white className="my-auto p-4 rounded-2xl bg-white flex items-center justify-center">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Generated QR Code"
                  className="max-w-[240px] max-h-[240px] object-contain"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-gray-400 gap-2">
                  <QrCode className="w-12 h-12 opacity-30" />
                  <span className="text-xs text-gray-500">Enter payload to render QR</span>
                </div>
              )}
            </div>

            <div className="w-full space-y-2 pt-2">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={!dataUrl}
                  onClick={downloadPng}
                  className="btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-pink-400" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  disabled={!svgString}
                  onClick={downloadSvg}
                  className="btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download SVG</span>
                </button>
              </div>

              {svgString && (
                <div className="flex items-center justify-center gap-2">
                  <CopyButton text={svgString} label="Copy SVG Code" />
                  <CopyButton text={payload} label="Copy Raw Payload" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
