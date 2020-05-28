import React from "react";
import { View } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import * as Text from "../../components/Text";

export default function PlayerControllerHeader({ title, navigation }: any) {
  return (
    <>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 30,
          alignItems: "center",
          marginBottom: 30,
          flexDirection: "row",
        }}
      >
        <BorderlessButton
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
          style={{ width: 50 }}
        >
          <Ionicons name="ios-arrow-down" size={25} />
        </BorderlessButton>
        <View
          style={{
            flex: 1,
            marginRight: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text.Title numberOfLines={1} style={{ fontSize: 22 }}>
            {title}
          </Text.Title>
        </View>
      </View>
    </>
  );
}
