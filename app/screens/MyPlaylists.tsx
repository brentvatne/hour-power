import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Image,
  View,
  Animated,
} from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "react-query";
import { useSafeArea } from "react-native-safe-area-context";
import { useResetRecoilState, useRecoilState } from "recoil";
import { Fontisto } from "@expo/vector-icons";

import * as Button from "../components/Button";
import * as LocalStorage from "../state/LocalStorage";
import * as Text from "../components/Text";
import * as Spacer from "../components/Spacer";
import confirmAsync from "../util/confirmAsync";
import StatusBar from "../components/StatusBar";
import PlayerStatusBottomControl, {
  PLAYER_STATUS_BOTTOM_CONTROL_HEIGHT,
} from "../components/PlayerStatusBottomControl";
import { fetchPlaylistsAsync, fetchTracksAsync, Playlist, Track } from "../api";
import { PlaylistItem } from "../components/playlists";
import {
  playbackStatusState,
  playerSelectionState,
  currentUserState,
} from "../state";
import { colors, images } from "../styleguide";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function MyPlaylistsHeader({
  animatedScrollValue,
}: {
  animatedScrollValue: Animated.Value;
}) {
  const insets = useSafeArea();
  const navigation = useNavigation();
  const resetPlayerSelection = useResetRecoilState(playerSelectionState);
  const resetPlaybackStatus = useResetRecoilState(playbackStatusState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  const clearAllState = useCallback(() => {
    LocalStorage.clearAsync();
    resetPlaybackStatus();
    resetPlayerSelection();
    setCurrentUser({ isAuthenticated: false });
    // We can't reset isAuthenticated or it will become null... Need to reset to false
    // @ts-ignore
    navigation.replace("SignIn");
  }, [navigation, resetPlaybackStatus, resetPlayerSelection]);

  const imageScale = useMemo(
    () =>
      animatedScrollValue.interpolate({
        inputRange: [-400, 0],
        outputRange: [5, 1],
        extrapolateRight: "clamp",
      }),
    [animatedScrollValue]
  );

  const textScale = useMemo(
    () =>
      animatedScrollValue.interpolate({
        inputRange: [-400, 0],
        outputRange: [2, 1],
        extrapolateRight: "clamp",
      }),
    [animatedScrollValue]
  );

  const textOpacity = useMemo(
    () =>
      animatedScrollValue.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.1],
        extrapolateRight: "clamp",
      }),
    [animatedScrollValue]
  );

  const buttonOpacity = useMemo(
    () =>
      animatedScrollValue.interpolate({
        inputRange: [-200, 0, 100],
        outputRange: [0.1, 1, 0.1],
        extrapolate: "clamp",
      }),
    [animatedScrollValue]
  );

  return (
    <View
      style={{
        height: 200,
        paddingTop: insets.top + 10,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <Animated.Image
        source={images.background}
        style={{
          transform: [{ scale: imageScale }],
          position: "absolute",
          resizeMode: "cover",
          top: -150,
          left: 0,
          right: 0,
          bottom: -30,
        }}
      />
      <Animated.View style={{ opacity: textOpacity, transform: [{ scale: textScale }] }}>
        <Text.Title style={{ color: "#fff", fontSize: 30, zIndex: 1000 }}>
          Your Playlists
        </Text.Title>
      </Animated.View>
      <Animated.View
        style={{
          opacity: buttonOpacity,
          position: "absolute",
          top: insets.top + (Platform.OS === "ios" ? 15 : 25),
          right: 25,
        }}
      >
        <BorderlessButton
          onPress={async () => {
            if (
              await confirmAsync({
                title: "Sign out?",
                message:
                  "Are you sure you want to sign out? I mean, it doesn't really matter, just thought I'd check in with you.",
                confirmButtonText: "Continue",
              })
            ) {
              clearAllState();
            }
          }}
        >
          <Fontisto name="player-settings" size={20} color="#fff" />
        </BorderlessButton>
      </Animated.View>
    </View>
  );
}

function LoadingPlaceholder() {
  const dimensions = Dimensions.get("window");

  return (
    <View
      style={{
        height: dimensions.height - 100,
        paddingTop: 60,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#fff",
        paddingBottom: 30,
      }}
    >
      <ActivityIndicator size="large" color={colors.loading} />
    </View>
  );
}

function TrackLoadingOverlay() {
  let appearValue = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(appearValue.current, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        // On web the container size will grow as the FlatList grows and so
        // centering on vertical axis will result in the loading text going off
        // screen
        ...Platform.select({
          web: {
            position: "fixed",
            paddingTop: "30vh",
          },
          default: {
            position: "absolute",
            justifyContent: "center",
          },
        }),
        alignItems: "center",
        paddingBottom: 150,
        backgroundColor: "rgba(0,0,0,0.7)",
        opacity: appearValue.current,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ActivityIndicator size="large" color={colors.loading} />
      <Text.SemiBold style={{ color: "#fff", fontSize: 20, marginTop: 20 }}>
        Fetching playlist tracks...
      </Text.SemiBold>
    </Animated.View>
  );
}

function EmptyListPlaceholder() {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#fff",
        minHeight: 300,
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 15,
      }}
    >
      <Text.Title style={{ fontSize: 24 }}>
        Uh oh, you don't seem to have any playlists on your account.
      </Text.Title>
      <Spacer.Vertical size={10} />
      <Text.Secondary style={{ fontSize: 16 }}>
        Go ahead and open Spotify and save some playlists or make some, then
        come back.
      </Text.Secondary>
      <Spacer.Vertical size={45} />
      <Button.OpenSpotify />
    </View>
  );
}

function List({
  playlists,
  isFetchingPlaylists,
  animatedScrollValue,
}: {
  playlists: Playlist[] | undefined;
  isFetchingPlaylists: boolean;
  animatedScrollValue: Animated.Value;
}) {
  const insets = useSafeArea();
  const navigation = useNavigation();
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);
  const [playerSelection, setPlayerSelection] = useRecoilState(
    playerSelectionState
  );

  // This is a big boy function - lots going on here. It's scary.
  const handlePressItem = useCallback(
    async (item: Playlist) => {
      // If a playlist is already selected and playing, ensure user wants to stop it rather than just switching playlists willy nilly
      if (playerSelection.playlist && playerSelection.playlist.id !== item.id) {
        if (
          !(await confirmAsync({
            title: `Start a new playlist?`,
            message: `You previously selected "${playerSelection.playlist?.name}", if you continue we will switch to "${item.name}".`,
            confirmButtonText: "Continue",
          }))
        ) {
          return;
        }
      }

      try {
        setIsFetchingTracks(true);
        // Switching playlists!
        if (playerSelection.playlist?.id !== item.id) {
          const tracks = await fetchTracksAsync(item.id);
          const filteredTracks = tracks.filter((track: Track | undefined) => {
            if (!track || track.durationMs < 60000 || !track.isPlayable) {
              return false;
            }
            return true;
          }) as Track[];

          setPlayerSelection((oldPlayerSelection) => ({
            ...oldPlayerSelection,
            playlist: item,
            tracks: filteredTracks,
          }));
        }

        requestAnimationFrame(() => {
          navigation.navigate("Player");
        });
      } catch (e) {
        alert("Something went wrong while fetching playlist tracks! Ruh roh..");
      } finally {
        setIsFetchingTracks(false);
      }
    },
    [playerSelection, setPlayerSelection, navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Playlist; index: number }) => (
      <PlaylistItem
        data={item}
        key={item.id}
        onPress={() => requestAnimationFrame(() => handlePressItem(item))}
        style={[
          // rounded corners on the top of the first row
          index === 0
            ? { borderTopLeftRadius: 10, borderTopRightRadius: 10 }
            : null,
          // rounded corners on the bottom of the last row
          index === playlists!.length - 1
            ? {
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }
            : null,
        ]}
      />
    ),
    [playlists, handlePressItem]
  );

  const ListHeaderComponent = useMemo(
    () => <MyPlaylistsHeader animatedScrollValue={animatedScrollValue} />,
    [animatedScrollValue]
  );

  const ListEmptyComponent = useMemo(
    () =>
      isFetchingPlaylists ? <LoadingPlaceholder /> : <EmptyListPlaceholder />,
    [isFetchingPlaylists]
  );

  return (
    <View style={{ flex: 1 }}>
      <AnimatedFlatList
        // @ts-ignore: something about Animated FlatList breaks data type?
        data={playlists}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: animatedScrollValue } } }],
          {
            useNativeDriver: true,
          }
        )}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={(item: Playlist) => item.id}
        renderItem={renderItem}
        style={{ flex: 1, backgroundColor: "#000" }}
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + PLAYER_STATUS_BOTTOM_CONTROL_HEIGHT - 5,
        }}
      />
      {isFetchingTracks ? null : <PlayerStatusBottomControl />}
      {isFetchingTracks ? <TrackLoadingOverlay /> : null}
    </View>
  );
}

export default function MyPlaylists(props: any) {
  const { data, isFetching } = useQuery("playlists", fetchPlaylistsAsync);
  const insets = useSafeArea();
  const scrollValue = useRef(new Animated.Value(0));
  const underlayOpacity = useMemo(
    () =>
      scrollValue.current.interpolate({
        inputRange: [0, 200],
        outputRange: [0, 0.7],
        extrapolate: "clamp",
      }),
    [scrollValue.current]
  );

  return (
    <View style={{ flex: 1 }}>
      <List
        playlists={data}
        isFetchingPlaylists={isFetching}
        animatedScrollValue={scrollValue.current}
      />
      <StatusBar style="inverted" />
      <Animated.View
        style={{
          opacity: underlayOpacity,
          height: insets.top,
          backgroundColor: "#000",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      />
    </View>
  );
}
