import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PUSH_TOKEN_KEY = "@kapakli/push_token";
const NOTIFICATIONS_DISABLED_BY_USER_KEY = "notifications_disabled_by_user";

export function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export function setStoredPushToken(token: string): Promise<void> {
  return AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
}

export function clearStoredPushToken(): Promise<void> {
  return AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}

export function setNotificationsDisabledByUser(
  disabled: boolean,
): Promise<void> {
  return AsyncStorage.setItem(
    NOTIFICATIONS_DISABLED_BY_USER_KEY,
    disabled ? "true" : "false",
  );
}

export async function getNotificationsDisabledByUser(): Promise<boolean> {
  const value = await AsyncStorage.getItem(NOTIFICATIONS_DISABLED_BY_USER_KEY);
  return value === "true";
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
