const PROJELERIMIZ_URL = "https://www.kapakli.bel.tr/projelerimiz";
const BASE_URL = "https://www.kapakli.bel.tr";
// kapakli.bel.tr, tarayici User-Agent'i olmayan istekleri engelliyor.
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ccedil: "ç",
  Ccedil: "Ç",
  ouml: "ö",
  Ouml: "Ö",
  uuml: "ü",
  Uuml: "Ü",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(
      /&(\w+);/g,
      (match, name: string) => NAMED_ENTITIES[name] ?? match,
    );
}

export type ProjeKategorisi = "tamamlanan" | "devamEden" | "yatirim";

export type Proje = {
  title: string;
  url: string;
  imageUrl: string;
  kategori: ProjeKategorisi;
};

function mapKategori(raw: string): ProjeKategorisi {
  if (raw === "devam-eden") return "devamEden";
  if (raw === "yatirim") return "yatirim";
  return "tamamlanan";
}

// Sayfadaki ".isotop-item {kategori}" kartlari (Tamamlanan/Devam Eden/Yatirim
// sekmelerinin filtreledigi ayni liste) - baslik, foto ve proje detay linkini
// iceriyor. Detay sayfasina derinlemesine inmiyoruz, tiklaninca tarayicida acilir.
export async function getProjelerimiz(): Promise<Proje[]> {
  const response = await fetch(PROJELERIMIZ_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Projeler alınamadı");
  }

  const html = await response.text();
  const itemRegex =
    /<div class="isotop-item ([a-z-]+)[^"]*">\s*<a href="([^"]+)" class="project d-block">\s*<div class="project-img-wrapper">\s*<div class="project-name">\s*([\s\S]*?)\s*<\/div>\s*<img src="([^"]+)"/g;

  const projeler: Proje[] = [];
  for (const match of html.matchAll(itemRegex)) {
    const [, kategoriRaw, path, titleRaw, imgPath] = match;
    projeler.push({
      title: decodeEntities(titleRaw).trim(),
      url: `${BASE_URL}${path}`,
      imageUrl: `${BASE_URL}${imgPath}`,
      kategori: mapKategori(kategoriRaw),
    });
  }

  return projeler;
}
