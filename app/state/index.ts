import { atom } from "recoil";
import { Device, Playlist, Track } from "../api";

type PlayerSelection = {
  device: null | Device;
  playlist: null | Playlist;
  tracks: Track[];
  trackDuration: number;
};

type PlaybackStatus = {
  playlistId: null | string;
  isPlaying: boolean;
  previousTrack: null | Track;
  currentTrack: null | Track;
  nextTrack: null | Track;
  elapsedTime: number;
};

type CurrentUser = {
  isAuthenticated: boolean | null;
};

export const currentUserState = atom<CurrentUser>({
  key: "CurrentUser",
  default: {
    isAuthenticated: null, // unknown if authenticated
  },
});

export const playerSelectionState = atom<PlayerSelection>({
  key: "PlayerSelection",
  default: {
    device: null,
    playlist: null,
    tracks: [],
    trackDuration: 60000, // default is 60000 for power hour ofc
  },
});

export const playbackStatusState = atom<PlaybackStatus>({
  key: "PlaybackStatus",
  default: {
    playlistId: null,
    isPlaying: false,
    previousTrack: null,
    currentTrack: null,
    nextTrack: null,
    elapsedTime: 0,
  },
});
