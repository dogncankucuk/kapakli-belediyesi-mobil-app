import { BASE_URL, resolveMediaUrl } from "./client";
import { Ihale } from "./types";

export async function getIhaleler(): Promise<Ihale[]> {
  const response = await fetch(`${BASE_URL}/ihaleler`);

  if (!response.ok) {
    throw new Error("İhaleler alınamadı");
  }

  const data: Ihale[] = await response.json();

  return data.map((item) => ({
    ...item,
    resimUrlleri: (item.resimUrlleri ?? []).map(resolveMediaUrl),
    dosyaUrlleri: (item.dosyaUrlleri ?? []).map(resolveMediaUrl),
  }));
}
