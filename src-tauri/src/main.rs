#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_notification::NotificationExt;

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct CapturedScreenData {
    pub data_url: String,
    pub width: u32,
    pub height: u32,
}

pub struct CaptureState {
    pub latest: Mutex<Option<CapturedScreenData>>,
}

// Native screen capture helper
fn capture_screen_native(mode: &str) -> Result<CapturedScreenData, String> {
    let temp_dir = std::env::temp_dir();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let temp_file = temp_dir.join(format!("happy_snip_{}.png", timestamp));

    #[cfg(target_os = "macos")]
    {
        let mut cmd = std::process::Command::new("/usr/sbin/screencapture");
        cmd.arg("-x"); // silent, no camera shutter sound
        if mode == "area" {
            cmd.arg("-i"); // interactive region or window selection
            cmd.arg("-s"); // only mouse selection mode
        }
        cmd.arg(&temp_file);

        let status = cmd.status().map_err(|e| format!("Không thể chạy screencapture: {e}"))?;
        if !status.success() || !temp_file.exists() {
            return Err("cancelled".to_string());
        }

        let bytes = std::fs::read(&temp_file).map_err(|e| format!("Lỗi đọc file ảnh: {e}"))?;
        let _ = std::fs::remove_file(&temp_file);

        let img = image::load_from_memory(&bytes).map_err(|e| format!("Lỗi nạp ảnh: {e}"))?;
        let width = img.width();
        let height = img.height();

        use base64::Engine;
        let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
        return Ok(CapturedScreenData {
            data_url: format!("data:image/png;base64,{}", b64),
            width,
            height,
        });
    }

    #[cfg(not(target_os = "macos"))]
    {
        let monitors = xcap::Monitor::all().map_err(|e| format!("Không thể tìm thấy màn hình: {e}"))?;
        let primary = monitors
            .into_iter()
            .find(|m| m.is_primary().unwrap_or(false))
            .or_else(|| xcap::Monitor::all().ok()?.into_iter().next())
            .ok_or_else(|| "Không tìm thấy màn hình chính nào".to_string())?;

        let img = primary
            .capture_image()
            .map_err(|e| format!("Lỗi khi chụp màn hình: {e}"))?;
        let width = img.width();
        let height = img.height();

        let mut png_bytes = Vec::new();
        let encoder = image::codecs::png::PngEncoder::new(&mut png_bytes);
        use image::ImageEncoder;
        encoder
            .write_image(img.as_raw(), width, height, image::ExtendedColorType::Rgba8)
            .map_err(|e| format!("Lỗi mã hoá PNG: {e}"))?;

        use base64::Engine;
        let b64 = base64::engine::general_purpose::STANDARD.encode(&png_bytes);
        Ok(CapturedScreenData {
            data_url: format!("data:image/png;base64,{}", b64),
            width,
            height,
        })
    }
}

#[tauri::command]
fn show_reminder_notification(
    app: AppHandle,
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

#[tauri::command]
async fn capture_screen(app: AppHandle, mode: String) -> Result<CapturedScreenData, String> {
    // 1. Hide main window smoothly so it does not appear in the screenshot
    let main_win = app.get_webview_window("main");
    if let Some(ref win) = main_win {
        let _ = win.hide();
    }

    // 2. Perform native capture on a blocking thread
    let capture_mode = mode.clone();
    let res = tauri::async_runtime::spawn_blocking(move || {
        std::thread::sleep(std::time::Duration::from_millis(220));
        capture_screen_native(&capture_mode)
    })
    .await
    .map_err(|e| format!("Runtime error: {e}"))?;

    // 3. ALWAYS restore and focus main window
    if let Some(ref win) = main_win {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }

    res
}

#[tauri::command]
fn copy_image_to_clipboard(base64_data: String) -> Result<(), String> {
    let clean_b64 = if let Some(idx) = base64_data.find(',') {
        &base64_data[idx + 1..]
    } else {
        &base64_data
    };

    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(clean_b64)
        .map_err(|e| format!("Lỗi giải mã base64: {e}"))?;

    let img = image::load_from_memory(&bytes)
        .map_err(|e| format!("Lỗi tải ảnh: {e}"))?
        .to_rgba8();

    let (w, h) = img.dimensions();
    let img_data = arboard::ImageData {
        width: w as usize,
        height: h as usize,
        bytes: std::borrow::Cow::Borrowed(img.as_raw()),
    };

    let mut clipboard = arboard::Clipboard::new()
        .map_err(|e| format!("Không thể mở clipboard: {e}"))?;

    clipboard
        .set_image(img_data)
        .map_err(|e| format!("Không thể chép ảnh vào clipboard: {e}"))?;

    Ok(())
}

#[tauri::command]
fn save_screenshot_to_file(base64_data: String, filename: Option<String>) -> Result<String, String> {
    let clean_b64 = if let Some(idx) = base64_data.find(',') {
        &base64_data[idx + 1..]
    } else {
        &base64_data
    };

    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(clean_b64)
        .map_err(|e| format!("Lỗi giải mã base64: {e}"))?;

    let downloads_dir = dirs::download_dir().unwrap_or_else(std::env::temp_dir);
    let name = filename.unwrap_or_else(|| {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        format!("HappyDev_Screenshot_{timestamp}.png")
    });

    let target_path = downloads_dir.join(name);
    std::fs::write(&target_path, &bytes)
        .map_err(|e| format!("Không thể lưu file: {e}"))?;

    Ok(target_path.to_string_lossy().to_string())
}

fn main() {
    tauri::Builder::default()
        .manage(CaptureState {
            latest: Mutex::new(None),
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_reminder_notification,
            capture_screen,
            copy_image_to_clipboard,
            save_screenshot_to_file
        ])
        .run(tauri::generate_context!())
        .expect("Unable to start HappyDev");
}
