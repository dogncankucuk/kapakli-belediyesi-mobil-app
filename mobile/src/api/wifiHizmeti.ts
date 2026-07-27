const WIFI_HIZMETI_URL =
  "https://www.kapakli.bel.tr/hizmetlerimiz/ucretsiz-wifi-hizmeti";
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

// Sayfadaki "Hizmet Bilgileri" sekmesi (#pills-bilgiler), ucretsiz Wi-Fi
// verilen noktalarin duz bir <ul><li> listesini iceriyor - adres/koordinat
// verilmiyor, sadece nokta adlari.
export async function getUcretsizWifiNoktalari(): Promise<string[]> {
  const response = await fetch(WIFI_HIZMETI_URL, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Wi-Fi noktaları alınamadı");
  }

  const html = await response.text();
  const tabMatch = html.match(/id="pills-bilgiler"[^>]*>([\s\S]*?)<\/div>/i);
  if (!tabMatch) return [];

  const items = tabMatch[1].matchAll(/<li>([^<]+)<\/li>/gi);
  return Array.from(items)
    .map((match) => decodeEntities(match[1]).trim())
    .filter(Boolean);
}
