import { invoke, isTauri } from '@tauri-apps/api/core';
import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import { openUrl as tauriOpenUrl } from '@tauri-apps/plugin-opener';

export function isDesktopApp() {
  return isTauri();
}

export async function showReminderNotification(payload: { title: string; body: string; silent: boolean }) {
  let granted = await isPermissionGranted();
  if (!granted) granted = (await requestPermission()) === 'granted';
  if (!granted) return false;
  await invoke('show_reminder_notification', payload);
  return true;
}

export async function openExternalUrl(url: string): Promise<void> {
  if (isTauri()) {
    try {
      await tauriOpenUrl(url);
      return;
    } catch (e) {
      console.warn('Failed to open URL via Tauri opener plugin, falling back to window.open:', e);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export interface CapturedScreenData {
  data_url: string;
  width: number;
  height: number;
}

export async function captureScreen(mode: 'area' | 'full' = 'area'): Promise<CapturedScreenData> {
  if (isTauri()) {
    return await invoke<CapturedScreenData>('capture_screen', { mode });
  }
  throw new Error('Chụp màn hình native chỉ khả dụng trên ứng dụng Desktop HappyDev.');
}

export async function copyImageToClipboard(base64Data: string): Promise<void> {
  if (isTauri()) {
    await invoke('copy_image_to_clipboard', { base64Data });
  } else {
    // Web fallback
    const res = await fetch(base64Data);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  }
}

export async function saveScreenshotToFile(base64Data: string, filename?: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('save_screenshot_to_file', { base64Data, filename });
  }
  // Web fallback: download via link
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename || `screenshot_${Date.now()}.png`;
  link.click();
  return link.download;
}
