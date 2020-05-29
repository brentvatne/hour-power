import React, { useEffect } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import { useSafeArea } from "react-native-safe-area-context";
import { currentUserState } from "../state";
import { useRecoilState } from "recoil";

import * as Text from "../components/Text";
import * as Spacer from "../components/Spacer";
import * as Button from "../components/Button";
import useSpotifyAuth from "../hooks/useSpotifyAuth";

export default function SignIn({ navigation }: any) {
  const { isAuthenticated, error, authenticateAsync } = useSpotifyAuth();
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const insets = useSafeArea();

  useEffect(() => {
    navigation.replace("MyPlaylists");
  }, [currentUser.isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentUser({ isAuthenticated: true });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{
        paddingTop: insets.top,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Text.Title>⚡️🎶️️</Text.Title>
      <Text.Title>Hour Power!</Text.Title>
      <Text.Subtitle
        style={{
          marginHorizontal: 20,
          marginTop: 5,
          fontSize: 20,
          textAlign: "center",
        }}
      >
        One song each minute for one hour. Songs all come from the best
        collection in the world &mdash; your own.
      </Text.Subtitle>
      <Spacer.Vertical size={60} />
      <Button.Green onPress={() => authenticateAsync()}>
        <Fontisto name="spotify" size={24} color="black" />
        <Text.Regular style={{ marginLeft: 10, fontSize: 22 }}>
          Sign in with Spotify
        </Text.Regular>
      </Button.Green>
      <Spacer.Vertical size={10} />
      <Text.Secondary>
        <Text.Italic style={{ fontSize: 16 }}>
          *requires a Spotify Premium account
        </Text.Italic>
      </Text.Secondary>
    </ScrollView>
  );
}
