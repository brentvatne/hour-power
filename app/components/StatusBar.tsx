import * as React from "react";
import { Platform, StatusBar as BaseStatusBar } from "react-native";

type Props = {
  style: "inverted" | "default";
};

export default function StatusBar(props: Props) {
  if (Platform.OS === "android") {
    return (
      <BaseStatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
        animated
      />
    );
  }

  const barStyle =
    props.style === "inverted" ? "light-content" : "dark-content";

  return <BaseStatusBar barStyle={barStyle} animated={true} />;
}
