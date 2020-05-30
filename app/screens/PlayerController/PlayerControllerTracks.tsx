import React from "react";
import { Platform, View } from "react-native";

import { Track } from "../../api";
import * as Text from "../../components/Text";
import TrackImage from "../../components/TrackImage";

type Props = {
  previous: Track | null;
  current: Track | null;
  next: Track | null;
};

export default function PlayerControllerTracks({
  previous,
  current,
  next,
}: Props) {
  return (
    <View style={{ paddingTop: Platform.OS === "ios" ? 0 : 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: 220,
          marginBottom: 20,
        }}
      >
        <TrackImage track={previous} key={"prev"} faded />
        <TrackImage track={current} size="large" key={"current"} />
        <TrackImage track={next} key={"next"} faded />
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: 10,
          marginHorizontal: 30,
        }}
      >
        <Text.Bold numberOfLines={1} style={{ fontSize: 24 }}>
          {current?.name ?? ' '}
        </Text.Bold>
        <Text.Regular numberOfLines={1} style={{ fontSize: 20 }}>
          {current?.artists ?? ' '}
        </Text.Regular>
      </View>
    </View>
  );
}
