import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "@kapakli/push_token";

export function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export function setStoredPushToken(token: string): Promise<void> {
  return AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
}

export function clearStoredPushToken(): Promise<void> {
  return AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}

export async function requestPermissionsAndGetToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    // TODO: EAS projectId / Firebase FCM V1 service account henuz yapilandirilmadi - bkz. proje sahibiyle gorusulecek adim
    console.warn("EAS projectId bulunamadi, push token alinamadi.");
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  return token;
}
