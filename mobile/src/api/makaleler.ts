import { BASE_URL, resolveMediaUrl } from "./client";
import { Makale } from "./types";

export async function getMakaleler(): Promise<Makale[]> {
  const response = await fetch(`${BASE_URL}/makaleler`);

  if (!response.ok) {
    throw new Error("Makaleler alınamadı");
  }

  const data: Makale[] = await response.json();

  return data.map((item) => ({
    ...item,
    resimUrlleri: (item.resimUrlleri ?? []).map(resolveMediaUrl),
    dosyaUrlleri: (item.dosyaUrlleri ?? []).map(resolveMediaUrl),
  }));
}
