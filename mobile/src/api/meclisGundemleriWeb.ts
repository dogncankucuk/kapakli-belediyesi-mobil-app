export type MeclisGundemiKaydi = {
  year: string;
  title: string;
  url: string;
};

const MECLIS_GUNDEMLERI_URL =
  "https://www.kapakli.bel.tr/guncel/meclis-gundemleri";
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

// Sayfa, her yil icin bir accordion karti gosteriyor ("Kapakli Belediyesi
// YYYY Yili Meclis Gundemleri" basligi), her kartin icinde de o yilin
// aylarina ait ".agendas-list .inner" bloklari (baslik + "gundem detaylari"
// linki) var - meclisKararlariWeb.ts ile ayni site sablonu.
function parseGundemler(html: string): MeclisGundemiKaydi[] {
  const sections = html.split(
    /Kapaklı Belediyesi (\d{4}) Yılı Meclis Gündemleri/,
  );

  const gundemler: MeclisGundemiKaydi[] = [];

  for (let i = 1; i < sections.length; i += 2) {
    const year = sections[i];
    const sectionHtml = sections[i + 1] ?? "";
    const entries = sectionHtml.matchAll(
      /<div class="inner">([\s\S]*?)<a href="([^"]+)"[^>]*class="agendas-read-more/gi,
    );

    for (const entry of entries) {
      const title = decodeEntities(entry[1]).trim();
      if (!title) continue;
      gundemler.push({ year, title, url: toAbsoluteUrl(entry[2]) });
    }
  }

  return gundemler;
}

export async function getMeclisGundemleriWeb(): Promise<MeclisGundemiKaydi[]> {
  const response = await fetch(MECLIS_GUNDEMLERI_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Meclis gündemleri alınamadı");
  }

  return parseGundemler(await response.text());
}
