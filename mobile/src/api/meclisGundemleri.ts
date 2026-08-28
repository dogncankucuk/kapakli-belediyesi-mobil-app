import { BASE_URL, resolveMediaUrl } from "./client";
import { MeclisGundemi } from "./types";

export async function getMeclisGundemleri(): Promise<MeclisGundemi[]> {
  const response = await fetch(`${BASE_URL}/meclis-gundemleri`);

  if (!response.ok) {
    throw new Error("Meclis gündemleri alınamadı");
  }

  const data: MeclisGundemi[] = await response.json();

  return data.map((doc) => ({
    ...doc,
    dosyaUrlleri: (doc.dosyaUrlleri ?? []).map(resolveMediaUrl),
  }));
}
