import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "kapakli:onboardingGorulduMu";

export async function getOnboardingGorulduMu(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === "true";
}

export async function onboardingGorulduIsaretle(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, "true");
}
