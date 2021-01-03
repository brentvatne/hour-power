import server, { sendJSON } from "./server";
import * as Spotify from "./Spotify";
import { updateOrCreateUserAsync } from "./db";

// Just a silly endpoint
server.get("/", async (_req, res) => {
  res.send("Hello 👋");
});

// Tokens: get first token and refresh token
// TODO: make it only responsible for first authentication
server.post<{
  Body: {
    code: string;
    redirectUri: string;
    refreshToken?: string;
  };
}>("/token", async (req, res) => {
  if (!(req.body.code && req.body.redirectUri) && !req.body.refreshToken) {
    sendJSON(res, 500, {
      error: `Invalid request body, please include either: code and redirectUri or refreshToken`,
    });

    return;
  }

  try {
    if (!req.body.refreshToken) {
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
      sendJSON(res, 200, { token, refreshToken, expiresIn, other: user });
    } else {
      // Refreshing
      // TODO: remove this entirely from the endpoint, we can refresh before
      // making requests in worker
      const { token, expiresIn } = await Spotify.refreshTokenAsync(
        req.body.refreshToken
      );
      sendJSON(res, 200, { token, expiresIn });
    }
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
});

// Start server. Needs 0.0.0.0 for Heroku
server.listen(process.env.PORT ?? 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
