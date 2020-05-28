import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import HTMLView from "react-native-htmlview";
import { RectButton } from "react-native-gesture-handler";
// @ts-ignore: oh my, no types from my very own library, que verguenza
import FadeIn from "react-native-fade-in-image";
import * as WebBrowser from "expo-web-browser";

import { Playlist } from "../../api";
import * as Text from "../Text";
import * as Spacer from "../Spacer";

export function PlaylistCover({ images }: { images: string[] }) {
  return (
    <FadeIn style={{ borderRadius: 5, overflow: "hidden" }}>
      <Image
        source={
          images[0] ? { uri: images[0] } : require("../../assets/playlist.png")
        }
        style={{
          width: 75,
          height: 75,
          resizeMode: "cover",
          borderRadius: 5,
        }}
      />
    </FadeIn>
  );
}
export function PlaylistDescription({ text }: { text: string | null }) {
  if (!text) {
    return null;
  }

  return (
    <HTMLView
      value={`<div>${text.trim()}</div>`}
      textComponentProps={{ style: styles.description }}
      addLineBreaks={false}
      stylesheet={styles}
      onLinkPress={(url) => {
        WebBrowser.openBrowserAsync(url);
      }}
    />
  );
}

export function PlaylistItem({
  data,
  style,
  onPress,
}: {
  data: Playlist;
  style: any;
  onPress: any;
}) {
  return (
    <View style={[style, { backgroundColor: "#fff" }]}>
      <RectButton activeOpacity={0.1} onPress={onPress}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            paddingVertical: 20,
            paddingHorizontal: 15,
          }}
        >
          <PlaylistCover images={data.images} />
          <Spacer.Horizontal size={15} />
          <View style={{ flex: 1 }}>
            <Text.SemiBold style={styles.title}>{data.name}</Text.SemiBold>
            <Text.Secondary>by {data.author}</Text.Secondary>
            <Spacer.Vertical size={5} />
            <PlaylistDescription text={data.description || "🎶"} />
          </View>
        </View>
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: add back a support by overriding the component is uses to render and
  // use borderlessbutton instead, so it works with rectbutton row wrapper
  a: {
    color: "#000",
  },
  description: {
    fontFamily: "SourceSansPro_400Regular",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    flexWrap: "wrap",
  },
});
