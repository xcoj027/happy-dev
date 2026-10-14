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

