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

export const GITHUB_RELEASES_URL = 'https://github.com/xcoj027/happy-dev-releases/releases';
export const GITHUB_LATEST_API_URL = 'https://api.github.com/repos/xcoj027/happy-dev-releases/releases/latest';

export const STORAGE_AUTO_CHECK = 'happydev_auto_check_updates';
export const STORAGE_DISMISSED_VERSION = 'happydev_dismissed_update';
export const STORAGE_LAST_CHECK_TIME = 'happydev_last_update_check_time';
export const STORAGE_CACHED_RESULT = 'happydev_cached_update_result';

export type UserPlatform = 'mac' | 'windows' | 'linux' | 'other';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  formattedSize: string;
  platform: UserPlatform;
  isInstaller: boolean;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  htmlUrl: string;
  assets: ReleaseAsset[];
  recommendedAsset?: ReleaseAsset;
  isLocalDev: boolean;
  checkedAt: number;
  error?: string;
  isOffline?: boolean;
}

/**
 * Detect user's current platform
 */
export function detectUserPlatform(): UserPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform?.toLowerCase()
    || navigator.platform?.toLowerCase()
    || '';

  if (platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os')) return 'mac';
  if (platform.includes('win') || ua.includes('windows')) return 'windows';
  if (platform.includes('linux') || ua.includes('linux')) return 'linux';
  return 'other';
}

/**
 * Format raw byte size into human readable string (e.g. 8.6 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Classify release asset by operating system
 */
export function classifyAsset(filename: string): { platform: UserPlatform; isInstaller: boolean } {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.dmg') || lower.endsWith('.pkg')) {
    return { platform: 'mac', isInstaller: true };
  }
  if (lower.endsWith('.exe') || lower.endsWith('.msi')) {
    return { platform: 'windows', isInstaller: true };
  }
  if (lower.endsWith('.appimage') || lower.endsWith('.deb') || lower.endsWith('.rpm')) {
    return { platform: 'linux', isInstaller: true };
  }
  return { platform: 'other', isInstaller: false };
}

/**
 * Extract integer version counter or semver rank from version string
 * Supports "v.2", "v2", "1.0.2", "v.10", etc.
 */
export function parseVersionRank(versionStr: string): number | null {
  if (!versionStr || versionStr.trim() === '' || versionStr === 'local') return null;
  const clean = versionStr.trim();

  // Match "v.N" or "vN" (e.g. HappyDev "v.2" format)
  const vDotMatch = clean.match(/^v\.?(\d+)$/i);
  if (vDotMatch) {
    return parseInt(vDotMatch[1], 10);
  }

  // Match standard semver "1.0.2" or "v1.0.2"
  const semverParts = clean.replace(/^v\.?/i, '').split('.').map((s) => parseInt(s, 10));
  if (semverParts.length >= 2 && semverParts.every((n) => !isNaN(n))) {
    const major = semverParts[0] || 0;
    const minor = semverParts[1] || 0;
    const patch = semverParts[2] || 0;
    return major * 1000000 + minor * 1000 + patch;
  }

  return null;
}

/**
 * Compare current version with latest release version
 */
export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  if (!latestVersion) return false;
  const latestClean = latestVersion.trim();
  const currentClean = (currentVersion || 'local').trim();

  if (currentClean === 'local') {
    // In local development, any official published release tag is considered newer
    return true;
  }

  const currentRank = parseVersionRank(currentClean);
  const latestRank = parseVersionRank(latestClean);

  if (currentRank !== null && latestRank !== null) {
    return latestRank > currentRank;
  }

  // Fallback: simple case-insensitive difference
  return currentClean.toLowerCase() !== latestClean.toLowerCase();
}

/**
 * Get auto-check setting from localStorage (defaults to true)
 */
export function isAutoCheckEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_AUTO_CHECK);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set auto-check setting in localStorage
 */
export function setAutoCheckEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_AUTO_CHECK, String(enabled));
  } catch {}
}

/**
 * Get dismissed version tag
 */
export function getDismissedVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_DISMISSED_VERSION);
  } catch {
    return null;
  }
}

/**
 * Record a dismissed version tag so user isn't prompted repeatedly on open
 */
export function setDismissedVersion(tag: string): void {
  try {
    localStorage.setItem(STORAGE_DISMISSED_VERSION, tag);
  } catch {}
}

/**
 * Clear dismissed version tag
 */
export function clearDismissedVersion(): void {
  try {
    localStorage.removeItem(STORAGE_DISMISSED_VERSION);
  } catch {}
}

/**
 * Check GitHub releases for updates
 */
export async function checkForUpdates(options?: { force?: boolean }): Promise<UpdateCheckResult> {
  const currentVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'local';
  const isLocal = currentVersion === 'local';
  const now = Date.now();
  const userPlatform = detectUserPlatform();

  // If not forcing a check, check cached result (cache valid for 15 minutes)
  if (!options?.force) {
    try {
      const cachedTime = localStorage.getItem(STORAGE_LAST_CHECK_TIME);
      const cachedData = localStorage.getItem(STORAGE_CACHED_RESULT);
      if (cachedTime && cachedData && now - Number(cachedTime) < 15 * 60 * 1000) {
        const parsed: UpdateCheckResult = JSON.parse(cachedData);
        // Refresh recommended asset in case platform changed
        parsed.recommendedAsset = parsed.assets?.find((a) => a.platform === userPlatform && a.isInstaller);
        return parsed;
      }
    } catch {
      // Ignore cache read failures
    }
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(GITHUB_LATEST_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: '',
          releaseName: '',
          releaseNotes: '',
          publishedAt: '',
          htmlUrl: GITHUB_RELEASES_URL,
          assets: [],
          isLocalDev: isLocal,
          checkedAt: now,
          error: 'No releases found on GitHub repository.',
        };
      }

      if (response.status === 403) {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: '',
          releaseName: '',
          releaseNotes: '',
          publishedAt: '',
          htmlUrl: GITHUB_RELEASES_URL,
          assets: [],
          isLocalDev: isLocal,
          checkedAt: now,
          error: 'GitHub API rate limit exceeded. Please check back later or visit the releases page directly.',
        };
      }

      throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latestVersion = (data.tag_name || '').trim();
    const releaseName = (data.name || latestVersion || 'HappyDev Release').trim();
    const releaseNotes = (data.body || '').trim();
    const publishedAt = data.published_at || data.created_at || '';
    const htmlUrl = data.html_url || `${GITHUB_RELEASES_URL}/tag/${latestVersion}`;

    const rawAssets: Array<{ name: string; browser_download_url: string; size: number }> = data.assets || [];
    const assets: ReleaseAsset[] = rawAssets.map((asset) => {
      const { platform, isInstaller } = classifyAsset(asset.name);
      return {
        name: asset.name,
        browser_download_url: asset.browser_download_url,
        size: asset.size,
        formattedSize: formatFileSize(asset.size),
        platform,
        isInstaller,
      };
    });

    // Pick recommended asset matching user platform
    const recommendedAsset = assets.find((a) => a.platform === userPlatform && a.isInstaller)
      || assets.find((a) => a.isInstaller);

    const hasUpdate = isNewerVersion(currentVersion, latestVersion);

    const result: UpdateCheckResult = {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseName,
      releaseNotes,
      publishedAt,
      htmlUrl,
      assets,
      recommendedAsset,
      isLocalDev: isLocal,
      checkedAt: now,
    };

    // Cache the successful result
    try {
      localStorage.setItem(STORAGE_LAST_CHECK_TIME, String(now));
      localStorage.setItem(STORAGE_CACHED_RESULT, JSON.stringify(result));
    } catch {}

    return result;
  } catch (err: unknown) {
    window.clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isOffline = !navigator.onLine || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('abort');

    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: '',
      releaseName: '',
      releaseNotes: '',
      publishedAt: '',
      htmlUrl: GITHUB_RELEASES_URL,
      assets: [],
      isLocalDev: isLocal,
      checkedAt: now,
      error: isOffline
        ? 'Could not connect to GitHub. Please check your internet connection.'
        : `Update check failed: ${errorMessage}`,
      isOffline,
    };
  }
}
