import { BASE_URL, resolveMediaUrl } from "./client";

export type MeclisKarari = {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
};

export async function getMeclisKararlari(): Promise<MeclisKarari[]> {
  const response = await fetch(`${BASE_URL}/meclis-kararlari`);

  if (!response.ok) {
    throw new Error("Meclis kararları alınamadı");
  }

  const data: MeclisKarari[] = await response.json();

  return data.map((item) => ({
    ...item,
    dosyaUrlleri: (item.dosyaUrlleri ?? []).map(resolveMediaUrl),
  }));
}
