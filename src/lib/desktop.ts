import { invoke, isTauri } from '@tauri-apps/api/core';
import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

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
