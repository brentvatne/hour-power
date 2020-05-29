import AsyncStorage from "@react-native-community/async-storage";
import { PersistedData, Credentials, JsonCompatible } from "../types";

const KEY = "@hourpower/";

export async function setAuthCredentialsAsync(credentials: Credentials) {
  await setAsync("credentials", credentials);
}

export async function getAuthCredentialsAsync(): Promise<Credentials> {
  return getAsync("credentials", {});
}

export async function getTokenAsync() {
  const credentials = await getAuthCredentialsAsync();
  return credentials.token;
}

export async function clearAsync() {
  await AsyncStorage.clear();
}

export async function setAsync<T extends JsonCompatible<T>>(
  key: string,
  value: T
) {
  const data = await loadAsync();
  const updated = {
    ...(data ?? {}),
    [key]: value,
  };

  await saveAsync(updated);
}

export async function getAsync<T>(key: string, fallback: T | null = null) {
  const data = await loadAsync();
  return data?.[key] ?? fallback;
}

export async function saveAsync(data: any) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadAsync(): Promise<PersistedData | null> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
