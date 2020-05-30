import * as React from "react";
import { TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useRecoilState } from "recoil";
import * as Linking from "expo-linking";
import { Fontisto } from "@expo/vector-icons";

import SignIn from "../screens/SignIn";
import MyPlaylists from "../screens/MyPlaylists";
import DevicePicker from "../screens/DevicePicker";
import PlayerController from "../screens/PlayerController";
import { playerSelectionState, currentUserState } from "../state";

const RootStack = createStackNavigator();
const PlayerStack = createStackNavigator();

export function Root() {
  const [currentUser] = useRecoilState(currentUserState);

  const authenticatedRoutes = (
    <>
      <RootStack.Screen name="MyPlaylists" component={MyPlaylists} />
      <RootStack.Screen name="Player" component={Player} />
    </>
  );

  return (
    <RootStack.Navigator
      initialRouteName={currentUser.isAuthenticated ? "MyPlaylists" : "SignIn"}
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="SignIn" component={SignIn} />
      {currentUser.isAuthenticated ? authenticatedRoutes : null}
    </RootStack.Navigator>
  );
}

function Player() {
  const [playerSelection] = useRecoilState(playerSelectionState);

  return (
    <PlayerStack.Navigator
      initialRouteName={
        playerSelection.device ? "PlayerController" : "DevicePicker"
      }
      screenOptions={({ navigation }: any) => {
        if (navigation.dangerouslyGetState().routes.length === 1) {
          return {
            headerLeft: () => <ClosePlayerButton navigation={navigation} />,
          };
        } else {
          return {};
        }
      }}
    >
      <PlayerStack.Screen
        name="DevicePicker"
        component={DevicePicker}
        options={{
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

function ClosePlayerButton({ navigation }: any) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("MyPlaylists")}
      hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
      style={{ width: 40, marginLeft: 20, marginTop: 2 }}
    >
      <Fontisto name="close-a" size={16} />
    </TouchableOpacity>
  );
}

// TODO: if not authenticated, always go to sign in...
const linking = {
  prefixes: [Linking.makeUrl()],
  config: {
    SignIn: "/sign-in",
    MyPlaylists: "/",
    Player: {
      screens: {
        DevicePicker: "/devices",
        PlayerController: "/playing",
      },
    },
  },
};

export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <Root />
    </NavigationContainer>
  );
}
