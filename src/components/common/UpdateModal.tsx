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
import {
  X,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Apple,
  Monitor,
  Terminal,
} from 'lucide-react';
import {
  UpdateCheckResult,
  ReleaseAsset,
  UserPlatform,
  isAutoCheckEnabled,
  setAutoCheckEnabled,
  setDismissedVersion,
  GITHUB_RELEASES_URL,
} from '../../services/updateChecker';
import { openExternalUrl } from '../../lib/desktop';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateCheckResult | null;
  isChecking: boolean;
  onCheckAgain: () => void;
}

function getPlatformIcon(platform: UserPlatform) {
  switch (platform) {
    case 'mac':
      return <Apple className="w-4 h-4 shrink-0" />;
    case 'windows':
      return <Monitor className="w-4 h-4 shrink-0" />;
    case 'linux':
      return <Terminal className="w-4 h-4 shrink-0" />;
    default:
      return <Download className="w-4 h-4 shrink-0" />;
  }
}

function getPlatformLabel(platform: UserPlatform): string {
  switch (platform) {
    case 'mac':
      return 'macOS (Universal DMG)';
    case 'windows':
      return 'Windows (64-bit Installer)';
    case 'linux':
      return 'Linux (AppImage)';
    default:
      return 'Universal Package';
  }
}

/**
 * Lightweight safe markdown renderer for release notes
 */
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) {
    return <span className="text-slate-400 italic text-xs">No release notes provided for this version.</span>;
  }

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-slate-900 mt-2.5 mb-1">
              {trimmed.slice(4)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-slate-900 mt-3 mb-1">
              {trimmed.replace(/^#+\s*/, '')}
            </h3>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className="text-emerald-500 font-bold leading-tight select-none">•</span>
              <span className="flex-1">{renderFormattedText(itemText)}</span>
            </div>
          );
        }

        // Regular paragraph
        return <p key={idx}>{renderFormattedText(trimmed)}</p>;
      })}
    </div>
  );
};

/**
 * Format inline bold, code, and links safely
 */
function renderFormattedText(text: string): React.ReactNode {
  // Regex to match URLs: https://...
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => openExternalUrl(part)}
          className="text-emerald-600 hover:text-emerald-700 underline font-medium inline-flex items-center gap-0.5 mx-0.5 cursor-pointer"
        >
          <span>{part.length > 50 ? `${part.slice(0, 48)}…` : part}</span>
          <ExternalLink className="w-2.5 h-2.5 inline" />
        </button>
      );
    }

    // Bold formatting **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={i}>
        {boldParts.map((bPart, j) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return (
              <strong key={j} className="font-semibold text-slate-800">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          // Inline code `code`
          const codeParts = bPart.split(/(`[^`]+`)/g);
          return codeParts.map((cPart, k) => {
            if (cPart.startsWith('`') && cPart.endsWith('`')) {
              return (
                <code
                  key={k}
                  className="px-1 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]"
                >
                  {cPart.slice(1, -1)}
                </code>
              );
            }
            return cPart;
          });
        })}
      </React.Fragment>
    );
  });
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  isChecking,
  onCheckAgain,
}) => {
  const [autoCheck, setAutoCheck] = useState<boolean>(isAutoCheckEnabled());
  const [showOtherAssets, setShowOtherAssets] = useState(false);

  if (!isOpen) return null;

  const handleToggleAutoCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setAutoCheck(val);
    setAutoCheckEnabled(val);
  };

  const handleDismiss = () => {
    if (updateInfo?.hasUpdate && updateInfo.latestVersion) {
      setDismissedVersion(updateInfo.latestVersion);
    }
    onClose();
  };

  const handleDownload = (url: string) => {
    openExternalUrl(url);
  };

  const handleViewReleases = () => {
    openExternalUrl(updateInfo?.htmlUrl || GITHUB_RELEASES_URL);
  };

  const hasUpdate = Boolean(updateInfo?.hasUpdate);
  const isError = Boolean(updateInfo?.error);
  const isUpToDate = !isChecking && !isError && updateInfo && !hasUpdate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                hasUpdate
                  ? 'bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-emerald-200 text-emerald-600'
                  : isUpToDate
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  : 'bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              {isChecking ? (
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              ) : hasUpdate ? (
                <Sparkles className="w-5 h-5 text-emerald-600" />
              ) : isUpToDate ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isChecking
                  ? 'Checking for Updates…'
                  : hasUpdate
                  ? 'New HappyDev Update Available'
                  : isUpToDate
                  ? 'HappyDev is Up to Date'
                  : 'Software Update Check'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isChecking
                  ? 'Connecting to GitHub Releases…'
                  : hasUpdate
                  ? `A newer version (${updateInfo?.latestVersion}) is ready to download.`
                  : isUpToDate
                  ? `You are running the newest version (${updateInfo?.currentVersion}).`
                  : 'Check status and latest releases.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Loading state */}
          {isChecking && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Checking GitHub for releases…</p>
              <p className="text-xs text-slate-400">Comparing version against github.com/xcoj027/happy-dev-releases</p>
            </div>
          )}

          {/* Error / Offline state */}
          {!isChecking && isError && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-amber-900">Unable to Check for Updates</h3>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    {updateInfo?.error}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onCheckAgain}
                  className="btn-3d px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewReleases}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Releases Page</span>
                </button>
              </div>
            </div>
          )}

          {/* Up to date state */}
          {!isChecking && isUpToDate && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No New Updates Available</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  HappyDev <span className="font-mono font-semibold text-slate-700">{updateInfo?.currentVersion}</span> is currently up to date with the latest release.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCheckAgain}
                  className="btn-3d px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewReleases}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View GitHub Releases</span>
                </button>
              </div>
            </div>
          )}

          {/* Update Available state */}
          {!isChecking && hasUpdate && updateInfo && (
            <>
              {/* Version Comparison Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current</span>
                    <div className="font-mono text-xs font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {updateInfo.currentVersion}
                    </div>
                  </div>

                  <span className="text-slate-300 font-bold text-base select-none">→</span>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Latest</span>
                    <div className="font-mono text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                      <span>{updateInfo.latestVersion}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-200/70 text-emerald-800 font-sans font-semibold">New</span>
                    </div>
                  </div>
                </div>

                {updateInfo.publishedAt && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Released</span>
                    <div className="text-xs text-slate-600 font-medium">
                      {new Date(updateInfo.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Installer Download Button */}
              {updateInfo.recommendedAsset && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/60 border border-emerald-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      {getPlatformIcon(updateInfo.recommendedAsset.platform)}
                      <span>Recommended for Your System:</span>
                      <span className="text-emerald-700 font-semibold">{getPlatformLabel(updateInfo.recommendedAsset.platform)}</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      {updateInfo.recommendedAsset.formattedSize}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownload(updateInfo.recommendedAsset!.browser_download_url)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {updateInfo.recommendedAsset.name}</span>
                  </button>
                </div>
              )}

              {/* Other Assets Expandable Accordion */}
              {updateInfo.assets && updateInfo.assets.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setShowOtherAssets(!showOtherAssets)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>All Download Packages & Checksums ({updateInfo.assets.length})</span>
                    </div>
                    {showOtherAssets ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showOtherAssets && (
                    <div className="border-t border-slate-100 p-2.5 space-y-1.5 bg-slate-50/50">
                      {updateInfo.assets.map((asset) => (
                        <div
                          key={asset.name}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200/80 text-xs hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {getPlatformIcon(asset.platform)}
                            <span className="font-mono text-[11px] text-slate-700 truncate" title={asset.name}>
                              {asset.name}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              ({asset.formattedSize})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownload(asset.browser_download_url)}
                            className="btn-3d px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Release Notes Changelog */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Release Notes & Changelog
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 max-h-48 overflow-y-auto">
                  <SimpleMarkdown content={updateInfo.releaseNotes} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Auto-check preference toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={handleToggleAutoCheck}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Check for updates automatically on open</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleViewReleases}
              className="btn-3d px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on GitHub</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="btn-3d px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-300/80 transition cursor-pointer shadow-2xs"
            >
              {hasUpdate ? 'Remind Me Later' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
