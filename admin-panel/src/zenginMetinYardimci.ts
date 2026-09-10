// Zengin metin editoru gelmeden once kaydedilmis eski kayitlar duz metin
// (satirlar \n ile ayrilmis) - editore ilk yuklerken bunlari <p> etiketlerine
// cevirip HTML olarak gostermek icin kullaniliyor. Icerik zaten HTML
// etiketi iceriyorsa (yeni kaydedilmis) oldugu gibi birakilir.
export function metniHtmlYap(metin: string): string {
  if (!metin) return '';
  if (/<[a-z][\s\S]*>/i.test(metin)) return metin;
  return metin
    .split(/\n{2,}/)
    .map((paragraf) => `<p>${paragraf.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
