import sanitizeHtml from 'sanitize-html';

// Admin panelin zengin metin editorunden (bkz. ZenginMetinEditor.tsx) gelen
// HTML'i kaydetmeden once temizler - editor arayuzu zaten sadece bu
// etiketleri/ozellikleri uretiyor, ama API'ye dogrudan istek atilarak
// (veya ileride baska bir istemciden) kotu amacli script/etiket
// gonderilmesine karsi savunma katmani.
const IZINLI_ETIKETLER = [
  'p', 'br', 'strong', 'em', 'u', 's', 'span',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'a',
];

const HIZA_DESENI = /^(left|center|right|justify)$/;

export function zenginMetinTemizle(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: IZINLI_ETIKETLER,
    allowedAttributes: {
      span: ['style'],
      p: ['style'],
      h1: ['style'],
      h2: ['style'],
      h3: ['style'],
      a: ['href', 'target', 'rel'],
    },
    allowedStyles: {
      span: {
        'font-size': [/^\d+(\.\d+)?(px|em|rem)$/],
        'font-family': [/^[\w\s",'-]+$/],
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\([\d,\s]+\)$/],
        'background-color': [/^#[0-9a-fA-F]{3,8}$/, /^rgb\([\d,\s]+\)$/],
      },
      p: { 'text-align': [HIZA_DESENI] },
      h1: { 'text-align': [HIZA_DESENI] },
      h2: { 'text-align': [HIZA_DESENI] },
      h3: { 'text-align': [HIZA_DESENI] },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
