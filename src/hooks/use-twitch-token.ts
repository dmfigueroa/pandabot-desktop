import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Output, number, object, safeParse, string } from "valibot";

export const twitchTokenSchema = object({
  access_token: string(),
  expires_in: number(),
  refresh_token: string(),
});
type TwitchToken = Output<typeof twitchTokenSchema>;

export default function useTwitchToken() {
  const [tokens, setToken] = useState<TwitchToken | null>(null);

  useEffect(() => {
    invoke("load_token").then((token) => {
      if (!token) return;
      const tokenResult = safeParse(
        twitchTokenSchema,
        JSON.parse(token as string)
      );
      if (tokenResult.success) setToken(tokenResult.output);
    });
  }, []);

  const setTokens = (token: TwitchToken) => {
    invoke("store_token", { token: JSON.stringify(token) }).then(() => {
      setToken(token);
    });
  };

  return { tokens, setTokens };
}
