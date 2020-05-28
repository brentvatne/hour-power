import * as React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { enableScreens } from "react-native-screens";
import { useRecoilState } from "recoil";

import { PersistedData } from "../types";
import SignIn from "../screens/SignIn";
import MyPlaylists from "../screens/MyPlaylists";
import DevicePicker from "../screens/DevicePicker";
import PlayerController from "../screens/PlayerController";
import { playerSelectionState } from "../state";

enableScreens();
const RootStack = createNativeStackNavigator();
const PlayerStack = createNativeStackNavigator();

type Props = {
  initialData: null | PersistedData;
};

export function Root(props: Props) {
  return (
    <RootStack.Navigator
      initialRouteName={
        props.initialData?.credentials?.token ? "MyPlaylists" : "SignIn"
      }
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      <RootStack.Screen
        name="SignIn"
        component={SignIn}
        options={{ stackAnimation: "fade" }}
      />
      <RootStack.Screen
        name="MyPlaylists"
        component={MyPlaylists}
        options={{}}
      />
      <RootStack.Screen
        name="Player"
        component={Player}
        options={{ stackPresentation: "modal" }}
      />
    </RootStack.Navigator>
  );
}

function Player(props: Props) {
  const [playerSelection] = useRecoilState(playerSelectionState);

  return (
    <PlayerStack.Navigator
      initialRouteName={
        // Jump straight to player if we have device selected already
        playerSelection.device ? "PlayerController" : "DevicePicker"
      }
      screenOptions={{
        headerTintColor: "#000",
        headerShown: Platform.OS === "ios" ? false : true,
        headerHideShadow: true,
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      <PlayerStack.Screen
        name="DevicePicker"
        component={DevicePicker}
        options={{
          stackPresentation: "modal",
          stackAnimation: playerSelection.device ? "default" : "fade",
          title: "Select a device",
        }}
      />
      <PlayerStack.Screen
        name="PlayerController"
        options={{ title: "Now Playing" }}
        component={PlayerController}
      />
    </PlayerStack.Navigator>
  );
}

export default function Navigation(props: Props) {
  return (
    <NavigationContainer>
      <Root initialData={props.initialData} />
    </NavigationContainer>
  );
}
