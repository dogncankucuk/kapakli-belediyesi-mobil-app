const OZGECMIS_URL = "https://www.kapakli.bel.tr/baskan/ozgecmis";
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

// Bir <p>...</p> parcasini duz metne cevirir: sadece <img> iceren
// paragraflari bos dondurur (foto ayrica cikartiliyor), <strong> etiketini
// kaldirip icerigini korur, <br> satirlarini yeni satira cevirir.
function cleanParagraph(raw: string): string {
  const trimmed = raw.trim();
  if (/^<img/i.test(trimmed)) return "";
  const withoutTags = trimmed
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "$1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(withoutTags)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type BaskanBilgisi = {
  name: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
};

// Sayfa "Ozgecmis" icerigini 3 paragraf halinde sunuyor: 1) isim + kisa
// tanitim yazisi, 2) sadece profil fotografi, 3) "•" ile ayrilmis ozgecmis
// maddeleri + son cumle. Bu sabit yapiya gore parcaliyoruz.
function parseBaskanBilgisi(html: string): BaskanBilgisi {
  const contentMatch = html.match(
    /<div class="content-text[^"]*">([\s\S]*?)<!--\s*Content Text End\s*-->/i,
  );
  if (!contentMatch) {
    throw new Error("Başkan bilgileri alınamadı");
  }
  const inner = contentMatch[1];

  const imgMatch = inner.match(/<img[^>]*src="([^"]+)"/i);
  const photoUrl = imgMatch ? toAbsoluteUrl(imgMatch[1]) : null;

  const paragraphs = Array.from(inner.matchAll(/<p>([\s\S]*?)<\/p>/gi))
    .map((match) => cleanParagraph(match[1]))
    .filter(Boolean);

  const [nameLine, ...introLines] = (paragraphs[0] ?? "").split("\n\n");
  const [bulletsBlock, kapanisText] = (paragraphs[1] ?? "").split("\n\n");
  const maddeler = bulletsBlock
    ? bulletsBlock
        .split("•")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    name: (nameLine ?? "").trim(),
    photoUrl,
    introText: introLines.join("\n\n").trim(),
    maddeler,
    kapanisText: (kapanisText ?? "").trim(),
  };
}

export async function getBaskanBilgisi(): Promise<BaskanBilgisi> {
  const response = await fetch(OZGECMIS_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Başkan bilgileri alınamadı");
  }

  return parseBaskanBilgisi(await response.text());
}
