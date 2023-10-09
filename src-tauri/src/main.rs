// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::shell;
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::net::TcpListener;

#[tauri::command]
async fn authenticate(app_handle: AppHandle) -> Result<String, String> {
    // create new server
    // port 0 = let the computer find an unused port
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    // open the /login page with the default browser
    shell::open(
        &app_handle.shell_scope(),
        format!(
            "https://pandabot-auth.dfigueroa.workers.dev/auth/twitch?port={}",
            port
        ),
        None,
    )
    .unwrap();
    // wait until incoming request
    let (mut stream, _) = listener.accept().await.unwrap();
    let (reader, writer) = stream.split();
    let mut buf_reader = BufReader::new(reader);
    let mut buf = String::new();
    // get first line of request message
    buf_reader.read_line(&mut buf).await.unwrap();
    // get url (2nd item)
    let url = buf.split_ascii_whitespace().nth(1).unwrap();
    // get query string
    let (_, query) = url.split_once('?').unwrap_or_default();
    for query_pair in query.split('&') {
        // parse query string and find `session_token`
        if let Some(("access_token", value)) = query_pair.split_once('=') {
            // send a success message
            // you can optionally send a redirect response to a proper success page
            // or even a deep/universal link to open the application
            writer
                .try_write(
                    b"HTTP/1.1 200 OK\r\n\r\nSuccessfully logged in. You can now close this tab.",
                )
                .unwrap();
            // return session id as session token
            return Ok(value.to_string());
        }
    }
    Err("Missing session".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![authenticate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
