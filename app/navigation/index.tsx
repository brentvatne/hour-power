import * as React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "react-native-screens/native-stack";
import { enableScreens } from "react-native-screens";
import { useRecoilState } from "recoil";

import SignIn from "../screens/SignIn";
import MyPlaylists from "../screens/MyPlaylists";
import DevicePicker from "../screens/DevicePicker";
import PlayerController from "../screens/PlayerController";
import { playerSelectionState, currentUserState } from "../state";

enableScreens();
const RootStack = createNativeStackNavigator();
const PlayerStack = createNativeStackNavigator();

export function Root() {
  const [currentUser] = useRecoilState(currentUserState);

  return (
    <RootStack.Navigator
      initialRouteName={currentUser.isAuthenticated ? "MyPlaylists" : "SignIn"}
      screenOptions={{
        headerTopInsetEnabled: true,
        headerStyle: { backgroundColor: '#000', },
        headerTintColor: '#fff',
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
        options={{ stackPresentation: "modal", headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

function Player() {
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
        headerTopInsetEnabled: true,
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

export default function Navigation() {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
}
