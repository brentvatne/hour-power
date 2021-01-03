import SpotifyWebApi from "spotify-web-api-node";
import fetch from "node-fetch";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set"
  );
}

// Get user id and other info (which we mostly discard) from the Spotify API
export async function getUserInfoAsync(token: string) {
  const client = new SpotifyWebApi();
  client.setAccessToken(token);
  const response = await client.getMe();
  return response.body;
}

// Given the code and redirectUri, get the token and refresh token from Spotify
// This is used the first time the user authenticates
export async function fetchTokenAsync({
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
export async function refreshTokenAsync(refreshToken: string) {
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
