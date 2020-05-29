import fetch from "node-fetch";
import { NowRequest, NowResponse } from "@now/node";

// TODO: move to Vercel secrets
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE";

export default async function handler(req: NowRequest, res: NowResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (!(req.body.code && req.body.redirectUri) && !req.body.refreshToken) {
    res.status(500).json({
      error: `Invalid request body, please include either: code and redirectUri or refreshToken`,
    });
    return;
  }

  try {
    if (req.body.refreshToken) {
      const { token, expiresIn } = await refreshTokenAsync(
        req.body.refreshToken
      );
      res.status(200).json({ token, expiresIn });
    } else {
      const { token, refreshToken, expiresIn } = await fetchTokenAsync({
        code: req.body.code,
        redirectUri: req.body.redirectUri,
      });
      res.status(200).json({ token, refreshToken, expiresIn });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

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

async function refreshTokenAsync(refreshToken) {
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
