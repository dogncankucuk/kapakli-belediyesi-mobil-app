import { BASE_URL } from "./client";
import { FaturaOdemeKurumu } from "./types";

export async function getFaturaOdemeKurumlari(): Promise<
  FaturaOdemeKurumu[]
> {
  const response = await fetch(`${BASE_URL}/fatura-odeme`);

  if (!response.ok) {
    throw new Error("Fatura ödeme kurumları alınamadı");
  }

  return response.json();
}
