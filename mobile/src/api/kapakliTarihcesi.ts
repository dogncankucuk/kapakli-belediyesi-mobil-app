const TARIHCE_URL = "https://www.kapakli.bel.tr/kapakli/kapaklinin-tarihcesi";
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
  bull: "•",
  deg: "°",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
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

function toAbsoluteUrl(src: string): string {
  if (src.startsWith("http")) return src;
  return `https://www.kapakli.bel.tr${src.startsWith("/") ? "" : "/"}${src}`;
}

function cleanParagraph(raw: string): string {
  const trimmed = raw.trim();
  if (/^<img/i.test(trimmed)) return "";
  const withoutTags = trimmed
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(withoutTags).trim();
}

export type KapakliTarihcesi = {
  photoUrl: string | null;
  paragraflar: string[];
};

// Sayfa: 1) baslik gorseli, 2) "Tarihce" etiketi, 3+) gercek tarihce metni
// (birden fazla <p>). Gorseli ayri cikartip, sadece etiket-metni olan
// paragrafi (== "Tarihce") atlayarak geri kalan gercek icerigi donduruyoruz.
function parseTarihce(html: string): KapakliTarihcesi {
  const contentMatch = html.match(
    /<div class="content-text[^"]*">([\s\S]*?)<!--\s*Content Text End\s*-->/i,
  );
  if (!contentMatch) {
    throw new Error("Kapaklı'nın tarihçesi alınamadı");
  }
  const inner = contentMatch[1];

  const imgMatch = inner.match(/<img[^>]*src="([^"]+)"/i);
  const photoUrl = imgMatch ? toAbsoluteUrl(imgMatch[1]) : null;

  const paragraflar = Array.from(inner.matchAll(/<p>([\s\S]*?)<\/p>/gi))
    .map((match) => cleanParagraph(match[1]))
    .filter((text) => text.length > 0 && text.toLowerCase() !== "tarihçe");

  return { photoUrl, paragraflar };
}

export async function getKapakliTarihcesi(): Promise<KapakliTarihcesi> {
  const response = await fetch(TARIHCE_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Kapaklı'nın tarihçesi alınamadı");
  }

  return parseTarihce(await response.text());
}
