import { Button } from "@nextui-org/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useDarkMode } from "usehooks-ts";
import { safeParse } from "valibot";
import "./App.css";
import { twitchTokenSchema, useTwitchToken } from "./hooks/use-twitch-token";

function App() {
  const { isDarkMode } = useDarkMode();
  const { tokens, setTokens } = useTwitchToken();

  const parseUrlParamsToTokens = (url: string) => {
    const params = new URLSearchParams(url);

    const data: Record<string, string | Date> = {};
    for (const [key, value] of params) data[key] = value;

    return safeParse(twitchTokenSchema, data);
  };

  const login = async () => {
    try {
      const sessionToken = await invoke<string>("authenticate");
      const tokens = parseUrlParamsToTokens(sessionToken);
      if (!tokens.success) {
        console.error(tokens.issues);
        throw new Error("Error al obtener los tokens");
      }

      setTokens(tokens.output);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "dark" : ""
      } text-foreground bg-background min-h-screen flex flex-col p-8 items-center`}
    >
      {tokens ? (
        <p>Logged In</p>
      ) : (
        <Button onClick={() => void login()}>Iniciar sesión con Twitch</Button>
      )}
    </div>
  );
}

export default App;
