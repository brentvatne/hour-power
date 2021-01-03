import assert from "assert";
import SpotifyWebApi from "spotify-web-api-node";
import fetch from "node-fetch";
import { findUserByToken } from "./db";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables must be set"
  );
}

export type Playlist = {
  id: string;
  name: string;
  href: string;
  author: string;
  description: string | null;
  trackCount: any;
  images: string[];
  uri: string;
};

export type Track = {
  id: string;
  name: string;
  uri: string;
  images: string[];
  artists: string[];
  isPlayable: boolean;
  durationMs: number;
};

export type Device = {
  id: string | null;
  name: string;
  type:
    | "Computer"
    | "Tablet"
    | "Smartphone"
    | "Speaker"
    | "TV"
    | "AVR"
    | "STB"
    | "AudioDongle"
    | "GameConsole"
    | "CastVideo"
    | "CastAudio"
    | "Automobile"
    | "Unknown";
  isActive: boolean;
  isRestricted: boolean;
};

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

// Get playlists
export async function fetchPlaylistsAsync(token: string): Promise<Playlist[]> {
  const client = await _getClientAsync(token);
  const result = await client.getUserPlaylists({ limit: 50 });

  return result.body.items.map(
    (p: typeof result.body.items[0]) =>
      ({
        id: p.id,
        name: p.name,
        author: p.owner.display_name,
        description: p.description!,
        trackCount: p.tracks.total,
        href: p.href,
        uri: p.uri,
        images: p.images.map((image: typeof p.images[0]) => image.url),
      } as Playlist)
  );
}

async function _getClientAsync(token: string) {
  const user = await findUserByToken(token);
  assert(user, "No user found for token");
  const client = new SpotifyWebApi();
  client.setAccessToken(user.spotifyToken);
  return client;
}
