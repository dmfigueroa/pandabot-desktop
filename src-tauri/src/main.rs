// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use keyring::Entry;
use tauri::api::shell;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::net::TcpListener;

#[tauri::command]
async fn authenticate(app_handle: AppHandle) -> Result<String, String> {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    shell::open(
        &app_handle.shell_scope(),
        format!(
            "https://pandabot-auth.dfigueroa.workers.dev/auth/twitch?port={}",
            port
        ),
        None,
    )
    .unwrap();
    let (mut stream, _) = listener.accept().await.unwrap();
    let (reader, writer) = stream.split();
    let mut buf_reader = BufReader::new(reader);
    let mut buf = String::new();
    buf_reader.read_line(&mut buf).await.unwrap();
    let url = buf.split_ascii_whitespace().nth(1).unwrap();
    let (_, query) = url.split_once('?').unwrap_or_default();
    writer
        .try_write(b"HTTP/1.1 200 OK\r\n\r\nSuccessfully logged in. You can now close this tab.")
        .unwrap();
    return Ok(query.to_string());
}

#[tauri::command]
fn store_token(token: &str) -> Option<()> {
    match Entry::new("pandabot", "token") {
        Ok(entry) => match entry.set_password(&token) {
            Ok(_) => Some(()),
            Err(_) => None,
        },
        Err(_) => return None,
    }
}

#[tauri::command]
fn load_token() -> Option<String> {
    match Entry::new("pandabot", "token") {
        Ok(entry) => match entry.get_password() {
            Ok(token) => Some(token),
            Err(_) => return None,
        },
        Err(_) => return None,
    }
}

fn main() {
    tauri::Builder::default()
        .manage(keyring::Entry::new("pandabot", "token"))
        .invoke_handler(tauri::generate_handler![
            authenticate,
            store_token,
            load_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
