const BASE_URL = "https://www.kapakli.bel.tr/guncel/";
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

function toAbsoluteUrl(href: string): string {
  if (href.startsWith("http")) return href;
  return `https://www.kapakli.bel.tr${href.startsWith("/") ? "" : "/"}${href}`;
}

export type GuncelIcerikKategori =
  "haberler" | "duyurular" | "ilanlar" | "ihaleler" | "makaleler";

export type GuncelIcerikKaydi = {
  title: string;
  summary: string;
  date: string;
  url: string;
};

// kapakli.bel.tr'nin "Haberler/Duyurular/İlanlar/İhaleler/Makaleler"
// sayfalari ayni ".page-list" sablonunu kullaniyor - baslik, ozet ve tarih
// hep ayni yapida, sadece URL slug'i degisiyor.
export async function getGuncelIcerik(
  kategori: GuncelIcerikKategori,
): Promise<GuncelIcerikKaydi[]> {
  const response = await fetch(`${BASE_URL}${kategori}`, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("İçerik alınamadı");
  }

  const html = await response.text();
  const itemRegex =
    /<a href="([^"]+)" class="page-title">([\s\S]*?)<\/a>\s*<div class="page-summary[^"]*">\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>\s*<div class="page-date">([^<]*)<\/div>/g;

  const kayitlar: GuncelIcerikKaydi[] = [];
  for (const match of html.matchAll(itemRegex)) {
    const [, href, titleRaw, summaryRaw, dateRaw] = match;
    kayitlar.push({
      url: toAbsoluteUrl(href),
      title: decodeEntities(titleRaw).trim(),
      summary: decodeEntities(summaryRaw.replace(/<br\s*\/?>/gi, " ")).trim(),
      date: dateRaw.trim(),
    });
  }

  return kayitlar;
}
