import { BASE_URL, resolveMediaUrl } from "./client";
import { Haber } from "./types";

export async function getHaberler(): Promise<Haber[]> {
  const response = await fetch(`${BASE_URL}/haberler`);

  if (!response.ok) {
    throw new Error("Haberler alınamadı");
  }

  const data: Haber[] = await response.json();

  return data.map((item) => ({
    ...item,
    resimUrlleri: (item.resimUrlleri ?? []).map(resolveMediaUrl),
    dosyaUrlleri: (item.dosyaUrlleri ?? []).map(resolveMediaUrl),
  }));
}
