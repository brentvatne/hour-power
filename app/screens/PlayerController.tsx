import React, { useEffect, useCallback, useMemo } from "react";
import { View } from "react-native";
import { useResetRecoilState, useRecoilState } from "recoil";
import { BorderlessButton } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";

import { playerSelectionState, playbackStatusState } from "../state";
import StatusBar from "../components/StatusBar";
import * as Spacer from "../components/Spacer";
import * as Text from "../components/Text";
import PlayerControllerHeader from "./PlayerController/PlayerControllerHeader";
import PlayerControllerTracks from "./PlayerController/PlayerControllerTracks";
import PlayerControllerDeviceButton from "./PlayerController/PlayerControllerDeviceButton";

// A power hour in ms
const ONE_HOUR = 60000 * 60;

export default function PlayerController({ navigation }: any) {
  const resetPlayerSelection = useResetRecoilState(playerSelectionState);
  const resetPlaybackStatus = useResetRecoilState(playbackStatusState);
  const [playerSelection] = useRecoilState(playerSelectionState);
  const [playbackStatus, setPlaybackStatus] = useRecoilState(
    playbackStatusState
  );

  navigation.setOptions({
    title: playerSelection.playlist?.name,
  });

  useEffect(() => {
    if (!playbackStatus.isPlaying && playbackStatus.elapsedTime === 0) {
      handlePlay();
    }
  }, []);

  const handlePause = useCallback(() => {
    setPlaybackStatus((oldPlaybackStatus) => ({
      ...oldPlaybackStatus,
      isPlaying: false,
    }));
  }, [setPlaybackStatus]);

  const handlePlay = useCallback(() => {
    setPlaybackStatus((oldPlaybackStatus) => ({
      ...oldPlaybackStatus,
      isPlaying: true,
    }));
  }, [setPlaybackStatus]);

  const handleStop = useCallback(() => {
    navigation.navigate("MyPlaylists");
    resetPlayerSelection();
    resetPlaybackStatus();
  }, [resetPlaybackStatus, resetPlayerSelection]);

  const memoizedHeader = useMemo(
    () => (
      <PlayerControllerHeader
        title={playerSelection.playlist?.name}
        navigation={navigation}
      />
    ),
    [navigation, playerSelection.playlist?.name]
  );

  const memoizedTracksDisplay = useMemo(
    () => (
      <PlayerControllerTracks
        previous={playbackStatus.previousTrack}
        current={playbackStatus.currentTrack}
        next={playbackStatus.nextTrack}
      />
    ),
    [
      playbackStatus.previousTrack,
      playbackStatus.currentTrack,
      playbackStatus.nextTrack,
    ]
  );

  const memoizedDeviceControl = useMemo(
    () => (
      <PlayerControllerDeviceButton
        device={playerSelection.device}
        navigation={navigation}
      />
    ),
    [playerSelection.device, navigation]
  );

  const memoizedPlaybackControls = useMemo(
    () => (
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <StopButton onPress={handleStop} />
        <Spacer.Horizontal size={60} />
        {playbackStatus.isPlaying ? (
          <PauseButton onPress={handlePause} />
        ) : (
          <PlayButton onPress={handlePlay} />
        )}
      </View>
    ),
    [handleStop, handlePause, handlePlay, playbackStatus.isPlaying]
  );

  const currentTrackNumber = useMemo(() => {
    return Math.floor(
      playbackStatus.elapsedTime / playerSelection.trackDuration
    );
  }, [playbackStatus.elapsedTime, playerSelection.trackDuration]);

  const totalTracks = useMemo(() => {
    return Math.ceil(ONE_HOUR / playerSelection.trackDuration);
  }, [playerSelection.trackDuration]);

  const memoizedTrackCount = useMemo(
    () => (
      <Text.Regular style={{ marginTop: 5 }}>
        <Text.Secondary>
          Track {currentTrackNumber + 1} of {totalTracks}
        </Text.Secondary>
      </Text.Regular>
    ),
    [currentTrackNumber, totalTracks]
  );

  return (
    <View style={{ flex: 1 }}>
      {memoizedHeader}
      {memoizedTracksDisplay}
      <View style={{ alignItems: "center" }}>
        {memoizedTrackCount}
        <ProgressBar
          elapsedTime={playbackStatus.elapsedTime}
          trackDuration={playerSelection.trackDuration}
        />
        {memoizedPlaybackControls}
      </View>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {memoizedDeviceControl}
      </View>
    </View>
  );
}

type ProgressBarProps = {
  elapsedTime: number;
  trackDuration: number;
};

function ProgressBar(props: ProgressBarProps) {
  const progressTrack =
    ((props.elapsedTime % props.trackDuration) / props.trackDuration) * 100;

  return (
    <View
      style={{
        marginTop: 30,
        marginBottom: 40,
        alignSelf: "center",
        height: 4,
        width: "80%",
        backgroundColor: "#eee",
      }}
    >
      <View
        style={{
          height: 4,
          width: `${progressTrack}%`,
          backgroundColor: "red",
        }}
      />
    </View>
  );
}

type ButtonProps = {
  onPress: () => void;
};

function StopButton({ onPress }: ButtonProps) {
  return (
    <BorderlessButton
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <Fontisto name="stop" size={45} />
    </BorderlessButton>
  );
}

function PauseButton({ onPress }: ButtonProps) {
  return (
    <BorderlessButton
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <Fontisto name="pause" size={45} />
    </BorderlessButton>
  );
}

function PlayButton({ onPress }: ButtonProps) {
  return (
    <BorderlessButton
      onPress={onPress}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
    >
      <Fontisto name="play" size={45} />
    </BorderlessButton>
  );
}
