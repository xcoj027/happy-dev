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

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CopyButton } from '../../components/common/CopyButton';
import { QrCode, Download, Wifi, User, Mail, Phone, MessageSquare, MapPin, Link2, FileText, CheckCircle2 } from 'lucide-react';

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
    if (!payload.trim()) {
      setDataUrl('');
      setSvgString('');
      return;
    }

    // Render Data URL (PNG)
    QRCode.toDataURL(
      payload,
      {
        width: size,
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: colorDark,
          light: colorLight,
        },
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );

    // Render SVG
    QRCode.toString(
      payload,
      {
        type: 'svg',
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: colorDark,
          light: colorLight,
        },
      },
      (err, svg) => {
        if (!err && svg) {
          setSvgString(svg);
        }
      }
    );
  }, [payload, colorDark, colorLight, errorLevel, size, margin]);

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
                <input
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
                <textarea
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
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. Office_WiFi_5G"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">WiFi Password</label>
                  <input
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
                  <input
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    placeholder="John Doe"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Organization / Company</label>
                  <input
                    type="text"
                    value={vcardOrg}
                    onChange={(e) => setVcardOrg(e.target.value)}
                    placeholder="Acme Corp"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Job Title</label>
                  <input
                    type="text"
                    value={vcardTitle}
                    onChange={(e) => setVcardTitle(e.target.value)}
                    placeholder="Lead Engineer"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Website</label>
                  <input
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
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="support@example.com"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Subject Line</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Feedback / Inquiry"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Message Body</label>
                  <textarea
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
                <input
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
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">SMS Message</label>
                  <textarea
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
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="37.7749"
                    className="input-3d w-full px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[var(--text-secondary)] block mb-1 font-medium">Longitude</label>
                  <input
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

          {/* QR Design & Style Card */}
          <div className="card-3d p-4 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">Visual Style & Error Correction</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">Error Correction</label>
                <select
                  value={errorLevel}
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
                  value={margin}
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
