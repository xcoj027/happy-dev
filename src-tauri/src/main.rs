#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn show_reminder_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
    silent: bool,
) -> Result<(), String> {
    let mut notification = app
        .notification()
        .builder()
        .title(title.chars().take(200).collect::<String>())
        .body(body.chars().take(1000).collect::<String>());
    if !silent {
        let sound = if cfg!(target_os = "windows") {
            "Default"
        } else if cfg!(target_os = "linux") {
            "message-new-instant"
        } else {
            "default"
        };
        notification = notification.sound(sound);
    }
    notification.show().map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![show_reminder_notification])
        .run(tauri::generate_context!())
        .expect("Unable to start HappyDev");
}
