export type MeclisKararKaydi = {
  year: string;
  title: string;
  url: string;
};

const MECLIS_KARARLARI_URL =
  "https://www.kapakli.bel.tr/guncel/meclis-kararlari";
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
// YYYY Yili Meclis Kararlari" basligi), her kartin icinde de o yilin
// aylarina ait ".agendas-list .inner" bloklari (baslik + "karar detaylari"
// linki) var. Basliga gore split ederek her bolumu kendi yiliyla
// eslestiriyoruz.
function parseKararlar(html: string): MeclisKararKaydi[] {
  const sections = html.split(
    /Kapaklı Belediyesi (\d{4}) Yılı Meclis Kararları/,
  );

  const kararlar: MeclisKararKaydi[] = [];

  for (let i = 1; i < sections.length; i += 2) {
    const year = sections[i];
    const sectionHtml = sections[i + 1] ?? "";
    const entries = sectionHtml.matchAll(
      /<div class="inner">([\s\S]*?)<a href="([^"]+)"[^>]*class="agendas-read-more/gi,
    );

    for (const entry of entries) {
      const title = decodeEntities(entry[1]).trim();
      if (!title) continue;
      kararlar.push({ year, title, url: toAbsoluteUrl(entry[2]) });
    }
  }

  return kararlar;
}

export async function getMeclisKararlariWeb(): Promise<MeclisKararKaydi[]> {
  const response = await fetch(MECLIS_KARARLARI_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Meclis kararları alınamadı");
  }

  return parseKararlar(await response.text());
}
