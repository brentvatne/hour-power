import { Platform } from "react-native";

export const colors = {
  light: "#eee",
  neongreen: "#67bd64",
  loading: Platform.OS === "ios" ? "#ccc" : "#7d72b6",
};

export const icons = {};

export const images = {
  background: require("../assets/background.jpg"),
  placeholder: require("../assets/playlist.png"),
};
