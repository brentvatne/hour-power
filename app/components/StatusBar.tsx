import * as React from "react";
import { Platform } from "react-native";
import { StatusBar as ExpoStatusBar, StatusBarProps } from "expo-status-bar";

export default function StatusBar(props: StatusBarProps) {
  if (Platform.OS === "android") {
    return <ExpoStatusBar />;
  }

  return <ExpoStatusBar />;
}
