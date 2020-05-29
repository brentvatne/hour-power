import React, { useMemo } from "react";
import {
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useRecoilState } from "recoil";

import * as Text from "../components/Text";
import * as Spacer from "../components/Spacer";
import TrackImage from "./TrackImage";
import { playbackStatusState, playerSelectionState } from "../state";

export const PLAYER_STATUS_BOTTOM_CONTROL_HEIGHT = 65;

export default function PlayerStatusBottomControl() {
  const insets = useSafeArea();
  const navigation = useNavigation();

  const [playbackStatus] = useRecoilState(playbackStatusState);
  const [playerSelection] = useRecoilState(playerSelectionState);

  const memoizedControl = useMemo(() => {
    if (!playbackStatus.currentTrack || !playerSelection.playlist) {
      return null;
    }

    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate("Player")}>
        <View
          style={[
            styles.container,
            {
              height: PLAYER_STATUS_BOTTOM_CONTROL_HEIGHT + insets.bottom,
              alignItems: "center",
              paddingLeft: 15,
              paddingBottom: insets.bottom,
              flexDirection: "row",
            },
          ]}
        >
          <TrackImage
            track={playbackStatus.currentTrack}
            style={{ width: 45, height: 45, borderRadius: 3 }}
          />
          <Spacer.Horizontal size={12} />
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              alignContent: "space-between",
            }}
          >
            <Text.Bold
              style={{ color: "#fff", fontSize: 16, marginTop: -1 }}
              numberOfLines={1}
            >
              {playerSelection.playlist.name}
            </Text.Bold>
            <Text.Regular
              style={{ color: "#fff", fontSize: 16 }}
              numberOfLines={1}
            >
              <Text.Bold>{playbackStatus.currentTrack.name}</Text.Bold> &mdash;{" "}
              {playbackStatus.currentTrack.artists.join(",")}
            </Text.Regular>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }, [playbackStatus.currentTrack, playerSelection.playlist, navigation]);

  return memoizedControl;
}

const styles = StyleSheet.create({
  // @ts-ignore: position fixed is fine
  container: {
    backgroundColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
    ...Platform.select({
      web: {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
      },
      default: {
        elevation: 3,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      },
    }),
  },
});
