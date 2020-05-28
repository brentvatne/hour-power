import React from "react";
import { BorderlessButton } from "react-native-gesture-handler";
import { useSafeArea } from "react-native-safe-area-context";

import DeviceIcon from "../../components/DeviceIcon";
import * as Text from "../../components/Text";
import { Device } from "../../api";

type Props = {
  device: Device | null;
  navigation: any;
};

export default function PlayerControllerDeviceButton({
  device,
  navigation,
}: Props) {
  const insets = useSafeArea();

  if (!device) {
    return null;
  }

  return (
    <BorderlessButton
      borderless={false}
      style={{
        flexDirection: "row",
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 40,
        marginBottom: insets.bottom,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => navigation.navigate("DevicePicker")}
    >
      <DeviceIcon type={device.type} />
      <Text.Regular style={{ fontSize: 18, marginLeft: 8 }} numberOfLines={1}>
        Listening on: {device.name}
      </Text.Regular>
    </BorderlessButton>
  );
}
