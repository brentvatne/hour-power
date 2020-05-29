import { useEffect, useRef, useCallback } from "react";
import { useRecoilState } from "recoil";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useAppState } from "@react-native-community/hooks";

import useInterval from "../hooks/useInterval";
import { playerSelectionState, playbackStatusState } from "../state";
import { Playlist, playTrackAsync, pauseAsync } from "../api";
import alertAsync from "../util/alertAsync";

// A power hour in ms
const ONE_HOUR = 60000 * 60;

export default function PlaybackDaemon() {
  const [playbackStatus, setPlaybackStatus] = useRecoilState(
    playbackStatusState
  );
  const [playerSelection, setPlayerSelection] = useRecoilState(
    playerSelectionState
  );

  const selectedPlaylistRef = useRef<Playlist | null>(playerSelection.playlist);
  const isPlayingRef = useRef<boolean>(playbackStatus.isPlaying);

  const handleAppBackgrounded = useCallback(() => {
    if (playbackStatus.isPlaying) {
      alertAsync({
        title: "Power hour paused",
        message:
          "The Hour Power app needs to be open and in the foreground while you're doing the power hour! You can resume now that you're back. Just, uh, don't go away again.",
      });

      setPlaybackStatus((oldPlaybackStatus) => ({
        ...oldPlaybackStatus,
        isPlaying: false,
      }));
    }
  }, [playbackStatus.isPlaying, setPlaybackStatus]);

  const appState = useAppState();
  useEffect(() => {
    // TODO(web): remove this requirement by playing sound on repeat in background
    if (appState === "background") {
      handleAppBackgrounded();
    }
  }, [appState]);

  // Keep the screen active while playing
  useEffect(() => {
    if (playbackStatus.isPlaying) {
      activateKeepAwake();
    } else {
      deactivateKeepAwake();
    }
  }, [playbackStatus.isPlaying]);

  // Update the elapsed time while playing
  useInterval(
    () => {
      setPlaybackStatus((oldPlaybackStatus) => ({
        ...oldPlaybackStatus,
        elapsedTime: oldPlaybackStatus.elapsedTime + 1000,
      }));
    },
    playbackStatus.isPlaying ? 1000 : null
  );

  const playTrackForTimeAsync = useCallback(
    async (elapsedTime, selection) => {
      const realTrackNumber = Math.floor(elapsedTime / selection.trackDuration);
      const trackIndex = realTrackNumber % selection.tracks.length;
      const track = selection.tracks[trackIndex];
      const trackTime = elapsedTime - realTrackNumber * selection.trackDuration;

      const nextTrackIndex = (trackIndex + 1) % selection.tracks.length;
      const nextTrack = selection.tracks[nextTrackIndex];

      const previousTrackIndex = (trackIndex - 1) % selection.tracks.length;
      const previousTrack =
        elapsedTime < selection.trackDuration
          ? null
          : selection.tracks[previousTrackIndex];

      if (!track || !nextTrack) {
        console.error("No track or next track..");
        return;
      }

      try {
        await playTrackAsync({
          uri: track.uri,
          deviceId: selection.device?.id!,
          time: trackTime,
        });
      } catch (e) {
        alertAsync({
          title: "Uh oh!",
          message: `Something went wrong when playing the track, maybe double check that the device you want to use is still available.`,
        });

        // Something went wrong so we need to pause, can't keep playing
        setPlaybackStatus((oldPlaybackStatus) => ({
          ...oldPlaybackStatus,
          isPlaying: false,
        }));
        return;
      }

      setPlaybackStatus((oldPlaybackStatus) => ({
        ...oldPlaybackStatus,
        previousTrack,
        currentTrack: track,
        nextTrack,
      }));
    },
    [setPlaybackStatus]
  );

  // Handle any changes in isPlaying or playlist or device
  useEffect(() => {
    // Reset elapsed time if playlist changes
    const newPlaylistId = playerSelection.playlist?.id;
    const oldPlaylistId = selectedPlaylistRef.current?.id;
    if (newPlaylistId && newPlaylistId !== oldPlaylistId) {
      setPlaybackStatus((oldPlaybackStatus) => ({
        ...oldPlaybackStatus,
        elapsedTime: 0,
        previousTrack: null,
        currentTrack: null,
        nextTrack: null,
      }));
    } else if (!newPlaylistId && oldPlaylistId) {
      // good bye, playlist!?? do nothing here for now I guess?
    }

    // Play or pause
    const { playlistId, isPlaying } = playbackStatus;
    const { playlist, device } = playerSelection;
    const wasPlaying = isPlayingRef.current;
    if (
      (!wasPlaying && isPlaying) ||
      (playlistId !== playlist?.id && isPlaying && playlist && device)
    ) {
      playTrackForTimeAsync(playbackStatus.elapsedTime, playerSelection);
    } else if (!isPlaying && wasPlaying) {
      try {
        pauseAsync();
      } catch (e) {
        // TODO: check if error....
      }
    }

    selectedPlaylistRef.current = playerSelection.playlist;
    isPlayingRef.current = playbackStatus.isPlaying;
  }, [
    playbackStatus.isPlaying,
    playerSelection.playlist,
    playerSelection.device,
  ]);

  // Switch tracks every time we hit a certain duration
  useEffect(() => {
    if (playbackStatus.elapsedTime > ONE_HOUR) {
      alertAsync({
        title: "Power hour completed!",
        message:
          "Wow, how anti-climactic. Maybe in a future update this will be more interesting.",
      });

      setPlaybackStatus((oldPlaybackStatus) => ({
        ...oldPlaybackStatus,
        isPlaying: false,
        // add a completed flag? or derive it? I dunno whatever
      }));
      return;
    }

    if (
      playbackStatus.isPlaying &&
      playbackStatus.elapsedTime % playerSelection.trackDuration === 0
    ) {
      playTrackForTimeAsync(playbackStatus.elapsedTime, playerSelection);
    }
  }, [playbackStatus.elapsedTime, playerSelection]);

  return null;
}
