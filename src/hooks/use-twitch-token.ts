import { invoke } from "@tauri-apps/api";
import { useLocalStorage } from "usehooks-ts";
import { Output, number, object, safeParse, string } from "valibot";

export const twitchTokenSchema = object({
  access_token: string(),
  expires_in: number(),
  refresh_token: string(),
});
type TwitchToken = Output<typeof twitchTokenSchema>;

export default function useTwitchToken() {
  const [tokens, setToken] = useLocalStorage<TwitchToken | null>("token", null);

  invoke("load_token").then((token) => {
    const tokenResult = safeParse(twitchTokenSchema, token);
    if (tokenResult.success) setToken(tokenResult.output);
  });

  const setTokens = (token: TwitchToken) => {
    invoke("store_token", token);
    setToken(token);
  };

  return { tokens, setTokens };
}
