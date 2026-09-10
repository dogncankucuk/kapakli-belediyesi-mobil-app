// Zengin metin (HTML) icerigini kisa bir onizleme/ozet olarak duz metne
// cevirir - liste ekranlarindaki 1-2 satirlik ozetlerde kullanilir (tam
// bicimlendirme sadece detay/genisletilmis goruntude ZenginMetinGoster ile
// gosterilir).
export function htmlToDuzMetin(html: string): string {
  return html
    .replace(/<(p|div|br|li)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
