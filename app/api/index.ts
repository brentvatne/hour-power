import SpotifyWebApi from "spotify-web-api-js";
import * as LocalStorage from "../state/LocalStorage";

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

/** Our server */

const TOKEN_ENDPOINT = __DEV__
  ? "http://localhost:3000/api/token"
  : "https://YOUR_PRODUCTION_ENDPOINT";

export async function refreshTokenAsync(refreshToken: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  return await response.json();
}

export async function fetchTokenAsync(code: string, redirectUri: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirectUri,
    }),
  });

  return await response.json();
}

/** Spotify */

export type Track = {
  id: string;
  name: string;
  uri: string;
  images: string[];
  artists: string[];
  isPlayable: boolean;
  durationMs: number;
};

export async function fetchTracksAsync(playlistId: string) {
  const client = await _getClientAsync();
  const result = await client.getPlaylistTracks(playlistId, {
    market: "from_token",
    fields:
      "items(track(id,name,uri,is_playable,duration_ms,album(images),artists(name)))",
  });

  return result.items.map((item: typeof result.items[0]) => {
    const { track } = item;
    // Skip podcast episodes I guess?
    if (!track.hasOwnProperty("artists")) {
      return;
    }

    return {
      id: track.id,
      name: track.name,
      uri: track.uri,
      isPlayable: track.is_playable,
      durationMs: track.duration_ms,
      // @ts-ignore
      artists: track.artists?.map((artist) => artist.name) ?? [],
      // @ts-ignore
      images: track.album?.images.map((image) => image.url) ?? [],
    } as Track;
  });
}

export async function playTrackAsync({
  uri,
  deviceId,
  time,
}: {
  uri: string;
  deviceId: string;
  time?: number;
}) {
  const client = await _getClientAsync();
  return await client.play({
    uris: [uri],
    device_id: deviceId,
    position_ms: time ?? 0,
  });
}

export async function fetchPlaylistsAsync(): Promise<Playlist[]> {
  const client = await _getClientAsync();
  // @ts-ignore: the type for this is wrong, the first param should be undefined | Object
  const result = await client.getUserPlaylists({ limit: 50 });

  return result.items.map(
    (p: typeof result.items[0]) =>
      ({
        id: p.id,
        name: p.name,
        author: p.owner.display_name,
        description: p.description!,
        trackCount: p.trackCount,
        href: p.href,
        uri: p.uri,
        images: p.images.map((image: typeof p.images[0]) => image.url),
      } as Playlist)
  );
}

export async function pauseAsync(): Promise<void> {
  const client = await _getClientAsync();
  return await client.pause();
}

export async function fetchDevicesAsync(): Promise<any> {
  const client = await _getClientAsync();
  const result = await client.getMyDevices();
  return result.devices
    .map(
      (d: typeof result.devices[0]) =>
        ({
          id: d.id,
          name: d.name,
          isActive: d.is_active,
          isRestricted: d.is_restricted,
          type: d.type,
        } as Device)
    )
    .sort((a: Device, b: Device) => (a.isActive && b.isActive ? 0 : -1));
}

// Handle refreshing token whenever it's coming due
async function _getValidTokenAsync() {
  const credentials = await LocalStorage.getAuthCredentialsAsync();
  let d = new Date(credentials.lastRefreshed);
  try {
    let lastRefreshedDate = new Date(credentials.lastRefreshed);
    // If there's only 600 seconds left to use token, go ahead and refresh it
    if (
      new Date().getTime() - lastRefreshedDate.getTime() >
      credentials.expiresIn - 600
    ) {
      const result = await refreshTokenAsync(credentials.refreshToken);
      const newAuthCredentials = {
        ...credentials,
        ...result,
      };
      await LocalStorage.setAuthCredentialsAsync(newAuthCredentials);
      return newAuthCredentials.token;
    }
  } catch (e) {
    console.log(e);
  }

  return credentials.token;
}

async function _getClientAsync() {
  const token = await _getValidTokenAsync();
  const client = new SpotifyWebApi();
  client.setAccessToken(token);
  return client;
}
