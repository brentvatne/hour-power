import React from "react";
import { StyleSheet, Image } from "react-native";
// @ts-ignore
import FadeIn from "react-native-fade-in-image";

import { Track } from "../api";
import { images } from "../styleguide";

export default function TrackImage({
  track,
  size,
  style,
  faded,
}: {
  track: Track | null;
  size?: "large";
  style?: any;
  faded?: boolean;
}) {
  let source;
  if (!track || track === null) {
    source = images.placeholder;
  } else {
    source = track.images[0] ? { uri: track.images[0] } : images.placeholder;
  }

  return (
    <FadeIn style={[size === "large" && styles.large, faded && styles.faded]}>
      <Image source={source} style={[{ height: 120, width: 120 }, style]} />
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  large: {
    transform: [{ scale: 1.8 }],
    elevation: 2,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.4,
  },
  faded: {
    opacity: 0.6,
  }
});
