export type FormBelgesi = {
  title: string;
  url: string;
  // "belge": dogrudan indirilebilir dosya (xls/doc/pdf...), "form": online
  // basvuru sayfasi.
  kind: "belge" | "form";
};

const FORMLAR_URL = "https://www.kapakli.bel.tr/hizmetlerimiz/formlar";
const BASVURU_FORMLARI_URL =
  "https://www.kapakli.bel.tr/kapakli/formlar/basvuru-formlari";
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

function extractLinks(html: string): { href: string; text: string }[] {
  const matches = html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi);
  return Array.from(matches).map((match) => ({
    href: match[1],
    text: decodeEntities(match[2]).trim(),
  }));
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`${url} alınamadı`);
  }

  return response.text();
}

// hizmetlerimiz/formlar sayfasindaki icerik metninin ("content-text") icine
// gomulu dogrudan dosya (xls/doc/pdf) linklerini cikarir.
function parseBelgeler(html: string): FormBelgesi[] {
  const contentMatch = html.match(
    /content-text">([\s\S]*?)<!-- Content Text End -->/i,
  );
  if (!contentMatch) return [];

  const fileExtension = /\.(pdf|docx?|xlsx?)(\?|$)/i;

  return extractLinks(contentMatch[1])
    .filter((link) => link.text && fileExtension.test(link.href))
    .map((link) => ({
      title: link.text,
      url: toAbsoluteUrl(link.href),
      kind: "belge" as const,
    }));
}

// basvuru-formlari sayfasindaki sol menu (sidebar) listesindeki online
// basvuru formu sayfalarini cikarir. Listenin ilk ogesi hep sayfanin
// kendisine donen baslik linki oldugu icin atlaniyor.
function parseFormlar(html: string): FormBelgesi[] {
  const sidebarMatch = html.match(/sidebar[^"]*">([\s\S]*?)<\/ul>/i);
  if (!sidebarMatch) return [];

  return extractLinks(sidebarMatch[1])
    .slice(1)
    .filter((link) => link.text)
    .map((link) => ({
      title: link.text,
      url: toAbsoluteUrl(link.href),
      kind: "form" as const,
    }));
}

export async function getFormBelgeleri(): Promise<FormBelgesi[]> {
  const [formlarHtml, basvuruHtml] = await Promise.all([
    fetchHtml(FORMLAR_URL),
    fetchHtml(BASVURU_FORMLARI_URL),
  ]);

  return [...parseBelgeler(formlarHtml), ...parseFormlar(basvuruHtml)];
}
