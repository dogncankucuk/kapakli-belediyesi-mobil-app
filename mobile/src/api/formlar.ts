import { BASE_URL, resolveMediaUrl } from "./client";

export type FormBelgesi = {
  id: string;
  title: string;
  url: string;
  // "belge": dogrudan indirilebilir dosya (xls/doc/pdf...), "form": online
  // basvuru sayfasi. Artik admin panelden elle giriliyor, kapakli.bel.tr'den
  // canli kazima yapilmiyor.
  kind: "belge" | "form";
};

type BackendFormBelgesi = {
  id: string;
  baslik: string;
  url: string;
  tur: string;
};

export async function getFormBelgeleri(): Promise<FormBelgesi[]> {
  const response = await fetch(`${BASE_URL}/formlar`);

  if (!response.ok) {
    throw new Error("Formlar alınamadı");
  }

  const data: BackendFormBelgesi[] = await response.json();

  return data.map((doc) => ({
    id: doc.id,
    title: doc.baslik,
    url: resolveMediaUrl(doc.url),
    kind: doc.tur === "form" ? "form" : "belge",
  }));
}
