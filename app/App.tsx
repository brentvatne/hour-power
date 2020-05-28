import React from "react";
import { View, Text } from 'react-native';

import { YellowBox } from "react-native";
import { AppLoading } from "expo";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  SourceSansPro_300Light,
  SourceSansPro_400Regular,
  SourceSansPro_400Regular_Italic,
  SourceSansPro_600SemiBold,
  SourceSansPro_700Bold,
} from "@expo-google-fonts/source-sans-pro";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";

import { icons, images } from "./styleguide";
import Navigation from "./navigation";
import StatusBar from "./components/StatusBar";
import PlaybackDaemon from "./components/PlaybackDaemon";
import useAssets from "./hooks/useAssets";
import usePersistedData from "./hooks/usePersistedData";

export default function App() {
  let [fontsLoaded] = useFonts({
    SourceSansPro_300Light,
    SourceSansPro_400Regular,
    SourceSansPro_400Regular_Italic,
    SourceSansPro_600SemiBold,
    SourceSansPro_700Bold,
    ...Fontisto.font,
    ...Ionicons.font,
  });

  let assetsLoaded = useAssets({ ...icons, ...images });
  let [dataLoaded, data] = usePersistedData();

  if (!fontsLoaded || !assetsLoaded || !dataLoaded) {
    return <AppLoading />;
  }

  return (
    <>
      <RecoilRoot>
        <SafeAreaProvider>
          <Navigation initialData={data} />
          <PlaybackDaemon />
        </SafeAreaProvider>
      </RecoilRoot>
      <StatusBar style="default" />
    </>
  );
}

// Note sure where this is coming from, but...
if (__DEV__) {
  YellowBox.ignoreWarnings(["Setting a timer for a long period of time"]);
}
