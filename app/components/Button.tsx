import React from "react";
import { Alert, TouchableHighlight, View } from "react-native";
import * as Linking from "expo-linking";
import { Fontisto } from "@expo/vector-icons";

import * as Text from "../components/Text";
import { colors } from "../styleguide";
import alertAsync from "../util/alertAsync";

type ButtonProps =
  | {
      onPress: Function;
      children: any;
      label?: never;
    }
  | {
      onPress: Function;
      label: string;
      children?: never;
    };

export function Green(props: ButtonProps) {
  return (
    <TouchableHighlight
      onPress={() => props.onPress()}
      underlayColor="green"
      style={{
        marginHorizontal: 20,
        backgroundColor: colors.neongreen,
        paddingVertical: 20,
        borderRadius: 5,
        paddingHorizontal: 30,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.label ? (
          <Text.Regular
            style={{ color: "#000", fontSize: 20, textAlign: "center" }}
          >
            {props.label}
          </Text.Regular>
        ) : (
          props.children
        )}
      </View>
    </TouchableHighlight>
  );
}

export function OpenSpotify() {
  return (
    <Green
      onPress={async () => {
        try {
          await Linking.openURL("spotify://");
        } catch (e) {
          alertAsync({
            title: "Unable to open Spotify",
            message:
              "It looks like you do not have Spotify installed! If you do, then, uh, sorry. Go start it manually the old fashioned way.",
          });
        }
      }}
    >
      <Fontisto name="spotify" size={24} color="black" />
      <Text.Regular style={{ marginLeft: 10, fontSize: 22 }}>
        Open the Spotify app
      </Text.Regular>
    </Green>
  );
}
