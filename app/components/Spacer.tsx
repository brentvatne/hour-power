import * as React from "react";
import { View } from "react-native";

export const HR = ({ color = "#eee", size = 1, spaceAround = 15 }) => (
  <View
    style={{
      flex: 1,
      height: size,
      backgroundColor: color,
      marginHorizontal: spaceAround,
    }}
  />
);

export const Vertical = ({ size }: { size: number }) => (
  <View style={{ marginVertical: size / 2 }} />
);

export const Horizontal = ({ size }: { size: number }) => (
  <View style={{ marginHorizontal: size / 2 }} />
);
