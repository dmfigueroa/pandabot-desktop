import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import {
  Output,
  isoTimestamp,
  object,
  safeParse,
  string,
  transform,
} from "valibot";

export const twitchTokenSchema = object({
  access_token: string(),
  expires_at: transform(string([isoTimestamp()]), (date) => new Date(date)),
  refresh_token: string(),
});
type TwitchToken = Output<typeof twitchTokenSchema>;

export const useTwitchToken = () => {
  const [tokens, setToken] = useState<TwitchToken | null>(null);

  useEffect(() => {
    invoke("load_token")
      .then((token) => {
        if (!token) return;
        const tokenResult = safeParse(
          twitchTokenSchema,
          JSON.parse(token as string)
        );
        if (tokenResult.success) setToken(tokenResult.output);
      })
      .catch((err) => console.error(err));
  }, []);

  const setTokens = (token: TwitchToken) => {
    invoke("store_token", { token: JSON.stringify(token) })
      .then(() => setToken(token))
      .catch((err) => console.error(err));
  };

  return { tokens, setTokens };
};
