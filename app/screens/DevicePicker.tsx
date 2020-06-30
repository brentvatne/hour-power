import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useQuery } from "react-query";
import {
  BorderlessButton,
  ScrollView,
  RectButton,
} from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import { useRecoilState } from "recoil";
import { useNavigation } from "@react-navigation/native";
import { Transitioning, Transition } from "react-native-reanimated";
import { useAppState } from "@react-native-community/hooks";

import { Device, fetchDevicesAsync } from "../api";
import { colors } from "../styleguide";
import DeviceIcon from "../components/DeviceIcon";
import StatusBar from "../components/StatusBar";
import * as Text from "../components/Text";
import * as Spacer from "../components/Spacer";
import * as Button from "../components/Button";
import useInterval from "../hooks/useInterval";
import { playerSelectionState } from "../state";

const transition =
  Platform.OS === "ios" ? (
    <Transition.Together>
      <Transition.Out type="fade" durationMs={100} />
      <Transition.Change interpolation="easeInOut" />
      <Transition.In type="fade" durationMs={500} />
    </Transition.Together>
  ) : null;

export default function DevicePicker({ navigation, route }: any) {
  const { data, isFetching, refetch } = useQuery("devices", fetchDevicesAsync, {
    manual: true,
  });
  const items = (data ?? []).map((item: Device) => (
    <DeviceItem data={item} key={item.id ?? item.name} />
  ));

  // Refetch when the app foregrounds
  const currentAppState = useAppState();
  useEffect(() => {
    if (currentAppState === "active") {
      refetch();
    }
  }, [currentAppState]);

  // Refetch every 10 seconds when app is active
  useInterval(
    () => {
      refetch();
    },
    currentAppState === "active" ? 10000 : null
  );

  const transtioningRef = React.useRef<any>();

  if (Platform.OS === "ios") {
    transtioningRef.current?.animateNextTransition();
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {Platform.OS === "ios" ? (
        <DevicePickerHeaderIOS navigation={navigation} />
      ) : (
        <Spacer.Vertical size={25} />
      )}

      <Transitioning.View ref={transtioningRef} transition={transition}>
        {isFetching && !data ? <LoadingPlaceholder /> : items}
        <Spacer.Vertical size={25} />
        <Spacer.HR />
        <Spacer.Vertical size={45} />
        <StatusBar style={Platform.OS === "android" ? "auto" : "inverted"} />
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 15,
            justifyContent: "center",
          }}
        >
          <Text.SemiBold style={{ fontSize: 20, textAlign: "center" }}>
            Don't see your device listed here?
          </Text.SemiBold>
          <Text.Secondary style={{ textAlign: "center" }}>
            Open the Spotify app and then come back here!
          </Text.Secondary>
          <Spacer.Vertical size={30} />
          <Button.OpenSpotify />
        </View>
      </Transitioning.View>
    </ScrollView>
  );
}

function LoadingPlaceholder() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 30,
      }}
    >
      <ActivityIndicator size="large" color={colors.loading} />
    </View>
  );
}

function DevicePickerHeaderIOS({ navigation }: any) {
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
          style={{ width: 40 }}
        >
          <Fontisto name="close-a" size={18} />
        </BorderlessButton>
        <View
          style={{
            flex: 1,
            marginRight: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text.Title>Select a device</Text.Title>
        </View>
      </View>
    </>
  );
}

function DeviceItem({ data }: { data: Device }) {
  const [playerSelection, setPlayerSelection] = useRecoilState(
    playerSelectionState
  );
  const navigation = useNavigation();
  const isSelected = playerSelection.device?.id === data?.id;
  const NameTextComponent = isSelected ? Text.Bold : Text.Regular;

  return (
    <RectButton
      onPress={() => {
        setPlayerSelection((oldPlayerSelection) => ({
          ...oldPlayerSelection,
          device: data,
        }));

        // When we show the DevicePicker prior to the player controller, we want to replace
        // it with PlayerController when we move away from it. But when the PlayerController
        // presents the DevicePicker (by selecting it from the PlayerController screen) then
        // we want to navigate to it (so we jump back to it rather than add a second entry).
        if (navigation.dangerouslyGetState().routes.length > 1) {
          navigation.navigate("PlayerController");
        } else {
          // @ts-ignore
          navigation.replace("PlayerController");
        }
      }}
      style={{
        opacity: data.isRestricted ? 0.5 : 1,
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 15,
        paddingVertical: 15,
      }}
    >
      <View
        style={{
          width: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DeviceIcon type={data.type} />
      </View>
      <NameTextComponent style={{ fontSize: 20 }} numberOfLines={1}>
        {data.name}
      </NameTextComponent>
    </RectButton>
  );
}
