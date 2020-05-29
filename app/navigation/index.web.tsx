import * as React from "react";
import { TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useRecoilState } from "recoil";
import * as Linking from "expo-linking";
import { Fontisto } from "@expo/vector-icons";

import { PersistedData } from "../types";
import SignIn from "../screens/SignIn";
import MyPlaylists from "../screens/MyPlaylists";
import DevicePicker from "../screens/DevicePicker";
import PlayerController from "../screens/PlayerController";
import { playerSelectionState } from "../state";

type Props = {
  initialData: null | PersistedData;
};

const RootStack = createStackNavigator();
const PlayerStack = createStackNavigator();

export function Root(props: Props) {
  return (
    <RootStack.Navigator
      initialRouteName={
        props.initialData?.credentials?.token ? "MyPlaylists" : "SignIn"
      }
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="SignIn" component={SignIn} />
      <RootStack.Screen name="MyPlaylists" component={MyPlaylists} />
      <RootStack.Screen name="Player" component={Player} />
    </RootStack.Navigator>
  );
}

function Player({ navigation, route }: any) {
  const [playerSelection] = useRecoilState(playerSelectionState);

  return (
    <PlayerStack.Navigator
      initialRouteName={"DevicePicker"}
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

// URLs maybe don't make a lot of sense here...
const linking = {
  prefixes: [Linking.makeUrl()],
  config: {
    SignIn: "/sign-in",
    MyPlaylists: "/",
    Player: {
      screens: {
        DevicePicker: "/devices",
        PlayerController: "/now-playing",
      },
    },
  },
};

export default function Navigation(props: Props) {
  return (
    <NavigationContainer linking={linking}>
      <Root initialData={props.initialData} />
    </NavigationContainer>
  );
}
