import { useEffect, useState } from "react";
import { useAuthRequest, makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

import { fetchTokenAsync } from "../api";
import * as LocalStorage from "../state/LocalStorage";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const USE_PROXY = Constants.appOwnership === "standalone" ? false : true;
const REDIRECT_URI = makeRedirectUri({
  useProxy: USE_PROXY,
  native: "hourpower://redirect",
});
const CLIENT_ID = "26e6599e588547c4b4615b0723b0f15f";

export default function useSpotifyAuth() {
  const [error, setError] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authRequest, authResponse, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      usePKCE: false,
      scopes: [
        "streaming",
        "user-read-email",
        "playlist-modify-public",
        "playlist-read-private",
        "user-read-playback-state",
        "app-remote-control",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-library-read",
      ],
      redirectUri: REDIRECT_URI,
      extraParams: {
        // On Android it will just skip right past sign in otherwise
        show_dialog: "true",
      },
    },
    discovery
  );

  useEffect(() => {
    async function updateFromAuthResponseAsync() {
      if (authResponse === null) {
        return;
      } else if (authResponse.type === "error") {
        setError(authResponse.error);
        return;
      } else if (authResponse.type === "success") {
        const result = await fetchTokenAsync(
          authResponse.params.code,
          REDIRECT_URI
        );
        if (result.error || !result.token) {
          setError(result.error ?? "Unknown error");
        } else {
          await LocalStorage.setAuthCredentialsAsync({
            ...result,
            lastRefreshed: new Date(),
          });
          setIsAuthenticated(true);
        }
      }
    }

    if (!isAuthenticated) {
      updateFromAuthResponseAsync();
    }
  }, [authResponse]);

  return {
    error,
    isAuthenticated,
    authenticateAsync: () => promptAsync({ useProxy: USE_PROXY }),
  };
}
