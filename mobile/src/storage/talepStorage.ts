import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth yok; misafir kullanıcının kendi oluşturduğu talepleri "Taleplerim"de
// görebilmesi için takip numaraları (Mongo ObjectId - tahmin edilemez) yalnızca
// cihazda saklanır. Sunucuda liste/arama endpoint'i yok (bkz. backend requests.service.ts).
const STORAGE_KEY = "kapakli:taleplerim";

export async function getTakipNumaralari(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export async function takipNumarasiEkle(id: string): Promise<void> {
  const mevcut = await getTakipNumaralari();
  if (mevcut.includes(id)) return;

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([id, ...mevcut]));
}
