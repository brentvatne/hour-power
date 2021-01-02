import fetch from "node-fetch";
import fastify, { FastifyReply } from "fastify";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set"
  );
}

const server = fastify();

function sendJson(res: FastifyReply, code: number, json: any) {
  res
    .status(code)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(json);
}

server.get("/", async (_req, res) => {
  res.send("Hello 👋");
});

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
    if (req.body.refreshToken) {
      const { token, expiresIn } = await refreshTokenAsync(
        req.body.refreshToken
      );
      sendJson(res, 200, { token, expiresIn });
    } else {
      const { token, refreshToken, expiresIn } = await fetchTokenAsync({
        code: req.body.code,
        redirectUri: req.body.redirectUri,
      });
      sendJson(res, 200, { token, refreshToken, expiresIn });
    }
  } catch (e) {
    console.log("error!");
    sendJson(res, 500, { error: e.message });
  }
});

async function postAsync(params: any) {
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

  const result = await postAsync(params);

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

async function refreshTokenAsync(refreshToken: string) {
  const params = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const result = await postAsync(params);

  if (result && result.access_token) {
    return { token: result.access_token, expiresIn: result.expires_in };
  } else {
    throw new Error(JSON.stringify(result));
  }
}

server.listen(process.env.PORT ?? 3000, '0.0.0.0', (err, address) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
