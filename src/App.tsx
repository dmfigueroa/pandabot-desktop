import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import reactLogo from "./assets/react.svg";

function App() {
  const login = async () => {
    try {
      const sessionToken = await invoke<string>("authenticate");
      localStorage.setItem("session_token", sessionToken);
      console.log(sessionToken);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <button onClick={login}>Iniciar sesión con Twitch</button>
    </div>
  );
}

export default App;
