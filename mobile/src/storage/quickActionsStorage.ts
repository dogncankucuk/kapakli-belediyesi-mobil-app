import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_QUICK_ACTION_IDS,
  SERVICE_CATALOG,
  ServiceId,
} from "../constants/serviceCatalog";

const STORAGE_KEY = "kapakli:hizliIslemler";

export async function getSeciliHizliIslemler(): Promise<ServiceId[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_QUICK_ACTION_IDS;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_QUICK_ACTION_IDS;

    const gecerliIdler = parsed.filter(
      (id): id is ServiceId =>
        typeof id === "string" &&
        SERVICE_CATALOG.some((service) => service.id === id),
    );
    return gecerliIdler.length > 0 ? gecerliIdler : DEFAULT_QUICK_ACTION_IDS;
  } catch {
    return DEFAULT_QUICK_ACTION_IDS;
  }
}

export async function seciliHizliIslemleriKaydet(
  ids: ServiceId[],
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
