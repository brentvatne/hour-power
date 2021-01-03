import fetch from "node-fetch";
import fastify, { FastifyReply } from "fastify";
import SpotifyWebApi from "spotify-web-api-node";
import { PrismaClient, User } from "@prisma/client";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set"
  );
}

const prisma = new PrismaClient();
const server = fastify();

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
  res.headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers":
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  });

  if (req.method === "OPTIONS") {
    res.status(200);
    res.send();
    return;
  }

  if (!(req.body.code && req.body.redirectUri) && !req.body.refreshToken) {
    sendJson(res, 500, {
      error: `Invalid request body, please include either: code and redirectUri or refreshToken`,
    });

    return;
  }

  try {
    // First authentication attempt
    if (!req.body.refreshToken) {
      const { token, refreshToken, expiresIn } = await fetchTokenAsync({
        code: req.body.code,
        redirectUri: req.body.redirectUri,
      });
      const userInfo = await getUserInfoAsync(token);
      const user = await updateOrCreateUserAsync({
        token,
        refreshToken,
        expiresIn,
        id: userInfo.id,
      });
      sendJson(res, 200, { token, refreshToken, expiresIn, other: user });
    } else {
      // Refreshing
      // TODO: remove this entirely from the endpoint, we can refresh before
      // making requests in worker
      const { token, expiresIn } = await refreshTokenAsync(
        req.body.refreshToken
      );
      sendJson(res, 200, { token, expiresIn });
    }
  } catch (e) {
    console.log("error!");
    sendJson(res, 500, { error: e.message });
  }
});

// Get the db user from the given params
async function updateOrCreateUserAsync(options: {
  id: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}): Promise<User> {
  const params = {
    spotifyUserId: options.id,
    spotifyToken: options.token,
    spotifyRefreshToken: options.refreshToken,
    spotifyTokenExpiration: new Date(Date.now() + options.expiresIn * 1000),
  };

  return await prisma.user.upsert({
    create: params,
    update: params,
    where: {
      spotifyUserId: params.spotifyUserId,
    },
  });
}

// Get user id and other info (which we mostly discard) from the Spotify API
async function getUserInfoAsync(token: string) {
  const client = new SpotifyWebApi();
  client.setAccessToken(token);
  const response = await client.getMe();
  return response.body;
}

// Given the code and redirectUri, get the token and refresh token from Spotify
// This is used the first time the user authenticates
async function fetchTokenAsync({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}) {
  const params = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const result = await requestTokenAsync(params);
  if (result && result.access_token) {
    return {
      token: result.access_token,
      refreshToken: result.refresh_token,
      expiresIn: result.expires_in,
    };
  } else {
    throw new Error(JSON.stringify(result));
  }
}

// Given refresh token, get new token and expiration
async function refreshTokenAsync(refreshToken: string) {
  const params = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const result = await requestTokenAsync(params);

  if (result && result.access_token) {
    return { token: result.access_token, expiresIn: result.expires_in };
  } else {
    throw new Error(JSON.stringify(result));
  }
}

// Actually make the API call to Spotify to get the token
async function requestTokenAsync(params: any) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  return await response.json();
}

// Helper for JSON responses
function sendJson(res: FastifyReply, code: number, json: any) {
  res
    .status(code)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(json);
}

// Start server. Needs 0.0.0.0 for Heroku
server.listen(process.env.PORT ?? 3000, "0.0.0.0", (err, address) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
