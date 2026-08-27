import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth yok; misafir kullanıcının kendi oluşturduğu başvuruları "Başvurularım"da
// görebilmesi için id'ler (Mongo ObjectId - tahmin edilemez) yalnızca cihazda
// saklanır. Sunucuda liste/arama endpoint'i yok (bkz. backend requests.service.ts).
const STORAGE_KEY = "kapakli:basvurularim";

export async function getBasvuruIdleri(): Promise<string[]> {
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

export async function basvuruIdEkle(id: string): Promise<void> {
  const mevcut = await getBasvuruIdleri();
  if (mevcut.includes(id)) return;

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([id, ...mevcut]));
}
