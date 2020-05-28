import React from 'react';
import { Fontisto } from "@expo/vector-icons";
import { Device } from "../api";

export default function DeviceIcon({ type }: { type: Device["type"] }) {
  let iconName = "codepen";
  if (type === "TV") {
    iconName = "tv";
  } else if (type === "Smartphone") {
    iconName = "mobile-alt";
  } else if (type === "GameConsole") {
    iconName = "codepen";
  } else if (type === "Computer") {
    iconName = "laptop";
  } else if (type === "Tablet") {
    iconName = "tablet";
  } else if (type === "Speaker") {
    iconName = "codepen";
  } else if (type === "Automobile") {
    iconName = "automobile";
  }

  return <Fontisto size={25} name={iconName} />;
}
