import assert from "assert";
import server, { sendJSON, Request } from "./server";
import * as Spotify from "./Spotify";
import { updateOrCreateUserAsync } from "./db";

// Just a silly endpoint
server.get("/", async (_req, res) => {
  res.send("Hello 👋");
});

// Tokens: get first token and refresh token
server.post<{
  Body: {
    code: string;
    redirectUri: string;
  };
}>("/token", async (req, res) => {
  if (!req.body.code || !req.body.redirectUri) {
    sendJSON(res, 500, {
      error: `Invalid request body, please include either: code and redirectUri or refreshToken`,
    });

    return;
  }

  try {
    const { token, refreshToken, expiresIn } = await Spotify.fetchTokenAsync({
      code: req.body.code,
      redirectUri: req.body.redirectUri,
    });
    const userInfo = await Spotify.getUserInfoAsync(token);

    const user = await updateOrCreateUserAsync({
      token,
      refreshToken,
      expiresIn,
      id: userInfo.id,
    });
    sendJSON(res, 200, { token: user.token });
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
});

server.get<{
  Headers: {
    "Hour-Power-Token": string;
  };
}>("/playlists", async (req, res) => {
  const token = ensureToken(req);
  try {
    const playlists = await Spotify.fetchPlaylistsAsync(token);
    sendJSON(res, 200, playlists);
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
});

function ensureToken(req: Request): string {
  const token = req.headers["hour-power-token"];
  assert(token, "Missing token");
  return token as string;
}

// Start server. Needs 0.0.0.0 for Heroku
server.listen(process.env.PORT ?? 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
