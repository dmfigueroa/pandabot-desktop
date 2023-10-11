import { Button } from "@nextui-org/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useDarkMode } from "usehooks-ts";
import "./App.css";
import useTwitchToken, { twitchTokenSchema } from "./hooks/use-twitch-token";
import { safeParse } from "valibot";

function App() {
  const { isDarkMode } = useDarkMode();
  const { tokens, setTokens } = useTwitchToken();

  const parseUrlParamsToTokens = (url: string) => {
    const params = new URLSearchParams(url);

    const data: Record<string, string | number> = {};
    for (const [key, value] of params) {
      if (key === "expires_in") {
        data[key] = Number(value);
      } else {
        data[key] = value;
      }
    }

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
      } text-foreground bg-background min-h-screen flex flex-col justify-center items-center`}
    >
      {tokens ? (
        <p>Logged In</p>
      ) : (
        <Button onClick={login}>Iniciar sesión con Twitch</Button>
      )}
    </div>
  );
}

export default App;
