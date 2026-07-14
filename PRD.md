# Kapaklı Belediyesi Mobil Uygulaması — Ürün Gereksinimleri Dokümanı (PRD)

> Bu doküman "ne inşa ediyoruz ve neden" sorusuna cevap verir. Nasıl inşa edildiği için bkz. `architecture.md` ve `tech.md`; nasıl göründüğü için bkz. `design.md`.

## 1. Problem / Amaç

Kapaklı Belediyesi'nin sunduğu hizmetler (fatura ödeme, randevu, harita, duyuru, ulaşım vb.) şu anda dağınık kanallarda (web sitesi, telefon, yüz yüze) sunuluyor. Amaç, bu hizmetlerin tamamına tek bir mobil uygulama üzerinden, giriş yapmadan da erişilebilecek şekilde, hızlı ve erişilebilir bir arayüzle ulaşılmasını sağlamak.

## 2. Hedef Kullanıcı Kitlesi

Kapaklı ilçesi sakinleri, geniş yaş aralığı (18–70+). Bu nedenle erişilebilirlik (büyük dokunma hedefleri, yüksek kontrast, punto büyütme, renk körlüğü desteği) bir "nice-to-have" değil, temel gereksinimdir.

## 3. Hedefler

- Vatandaşın en sık ihtiyaç duyduğu belediye işlemlerini (fatura ödeme, randevu, talep oluşturma) uygulama içinden tamamlayabilmesi
- Giriş yapmadan da temel bilgilere (harita, duyuru, hizmet bilgisi) erişilebilmesi
- Tek elden, tutarlı ve kurumsal bir marka deneyimi sunulması

### Hedef Olmayanlar (Non-goals — şimdilik)
- Gerçek zamanlı ödeme işlemi (TESKİ/GAZDAŞ/TREPAŞ) — belediyeden API erişimi sağlanana kadar mock veriyle simüle edilir
- Çoklu dil desteği (şimdilik yalnızca Türkçe)

## 4. Kapsam — Özellik Grupları

Aşağıdaki gruplar, Stitch'te tasarlanan 30 ekranla birebir örtüşür (bkz. `design.md`).

| Grup | Özellikler |
|---|---|
| Giriş & Hesap | Giriş Ekranı (opsiyonel, misafir girişi mevcut), Profil, Ayarlar, Hesap Bilgilerim |
| Navigasyon | Ana Sayfa, Yan Menü (Navigasyon Çekmecesi), Harita, Harita - Menü Açık |
| Fatura & Hizmetler | Fatura Ödeme (TESKİ/GAZDAŞ/TREPAŞ), Su Hizmetleri, Randevu Al, Yeni Talep Oluştur, Taleplerim, Formlar ve Dilekçeler, Engelli ve Yaşlı Hizmetleri, Hizmetler (kaydırılabilir liste) |
| Şehir & Yaşam | Ulaşım Hizmetleri, Nöbetçi Eczaneler, Hava Durumu Detay, Hava Kalitesi Detay, Wi-Fi Noktaları, Şehir Kameraları, Kent Lokantası |
| Duyuru & Kurumsal | Duyurular, Haberler ve Etkinlikler, Meclis Kararları, Hakkımızda (Başkan, Kapaklı Tarihi, Nüfus Bilgileri), Bize Ulaşın, Vefat Edenler, Yardım Merkezi |

## 5. Harita Kategorileri

### 5.1 Temel Harita Özellikleri (ilk kapsam)
- **Park Bahçeler Haritası + Doluluk Sistemi:** Parkların konumu ve anlık doluluk durumu (örn. yeşil/sarı/kırmızı doluluk göstergesi)
- **Tarihi Yerler Haritası:** Tarihi mekanların konumu; her mekanda fiziksel **QR kod** okutulduğunda ilgili web sayfasına (kapakli.bel.tr üzerindeki tarihçe içeriği gibi) yönlendirme
- **Nöbetçi Eczaneler:** Haritalandırma + iletişim + çalışma saatleri

### 5.2 Genişletilmiş POI Kategorileri
Yukarıdakilere ek olarak aşağıdaki nokta (POI) kategorileri harita sekmesine dahil edilecek:

Kan bağışı noktaları, sağlık ocakları, eczaneler, kütüphaneler, camiler, valilik ve kaymakamlık, toplum sağlığı merkezi, özel eğitim ve rehabilitasyon merkezi, veteriner hizmetleri, otogar, sanayiler, noterler, umumi WC, toplanma yerleri, itfaiye karakolu, vergi dairesi, hükümet binası, sosyal tesisler.

## 6. Erişilebilirlik Gereksinimleri

**Öncelik notu:** Bu proje için erişilebilirlik "nice-to-have" değil, **sert bir gereksinimdir** — kurumsal/kamu uygulaması olarak herkesin (yaşlı, görme/işitme zorluğu olan, renk körü vatandaşlar dahil) hizmetlere erişebilmesi temel amaçtır. Hedef seviye: **WCAG 2.1 AA**.

| Gereksinim | Somut Karşılığı |
|---|---|
| Ekran okuyucu desteği | Her interaktif elemanda (buton, kart, form alanı) işlevsel `accessibilityLabel`/`accessibilityRole`; dekoratif görsellerde etiket yok (gürültü yaratmasın) |
| Punto arttırma | Sabit piksel yerine ölçeklenebilir birimler (RN'de `PixelRatio`/dinamik font ölçekleme); kullanıcı sistem yazı boyutunu büyüttüğünde no-scroll layout'un kırılmadığından ekran ekran doğrulama |
| Renk kontrastı | Metin/arkaplan kontrastı min. **4.5:1** (WCAG AA) — `design.md` renk paleti bu ölçüte göre gözden geçirilecek |
| Renk körlüğü desteği | Bilgi asla yalnızca renkle iletilmez; her zaman ikon/metin/şekil farkı eşlik eder (örn. durum rozetlerinde renk + ikon + yazı birlikte) |
| Dokunma hedefi | Minimum 44x44pt (bkz. `design.md` Bölüm 6) |
| Basit dil | Formlar ve bilgilendirme metinleri sade, jargonsuz Türkçe; özellikle yaşlı kullanıcı grubu gözetilir |
| Test | Her ekran, gerçek ekran okuyucu (VoiceOver/TalkBack) açıkken ve sistem yazı boyutu büyütülmüşken manuel olarak QA sürecinde doğrulanır |

## 7. Kullanıcı Senaryoları (örnek)

- Bir vatandaş olarak, **giriş yapmadan** uygulamayı açıp nöbetçi eczane bulabilmek istiyorum.
- Bir vatandaş olarak, TESKİ faturamı görüntüleyip ödeyebilmek istiyorum (ilk aşamada mock veriyle).
- Bir vatandaş olarak, nikah dairesi için randevu alabilmek istiyorum.
- Yaşlı bir vatandaş olarak, yazı boyutunu büyütüp daha rahat okuyabilmek istiyorum.
- Bir vatandaş olarak, belediyeye bir talep/dilekçe oluşturup durumunu takip edebilmek istiyorum.

## 8. Başarı Kriterleri

- Tüm 30 ekran, `design.md`'deki no-scroll/tab-bar kurallarına uygun şekilde çalışır durumda
- Giriş zorunlu olmadan temel özelliklerin (harita, duyuru, hizmet bilgisi) kullanılabilir olması
- Kritik akışların (randevu alma, talep oluşturma) baştan sona hatasız tamamlanabilmesi

## 9. Riskler ve Varsayımlar

| Risk / Varsayım | Etki | Azaltma |
|---|---|---|
| TESKİ/GAZDAŞ/TREPAŞ'tan gerçek API erişimi hiç alınamayabilir veya gecikebilir | Fatura ödeme özelliği canlıya geç çıkar veya mock kalır | Şimdiden mock veriyle UI tamamlanır; entegrasyon bağımsız bir modül olarak eklenecek şekilde tasarlanır (bkz. `architecture.md`) |
| Nöbetçi eczane / hava durumu / hava kalitesi için resmi bir veri kaynağı (API) bulunamayabilir | İlgili ekranlar güncel veri gösteremez | Alternatif kaynaklar (İl Sağlık Müdürlüğü, açık meteoroloji API'leri) araştırılacak; bulunamazsa manuel/admin panelden güncellenen statik veriyle başlanır |
| Geniş yaş aralığı (18-70+) hedefi, tasarımın "sade" olması ile "her hizmetin tek ekrana sığması" (no-scroll) arasında gerilim yaratabilir | Bazı ekranlarda bilgi yoğunluğu fazla gelebilir | Hizmetler ekranında olduğu gibi, gerektiğinde kullanıcı onayıyla scroll istisnası tanınır (bkz. `design.md` Bölüm 7 notu) |
| KVKK kapsamında T.C. kimlik no gibi hassas veri toplanması gerekebilir | Yasal uyumluluk riski | Mümkün olduğunca veri toplanmaz/saklanmaz; zorunluysa field-level encryption (bkz. `architecture.md`) |

## 10. Sözlük

| Terim | Anlamı |
|---|---|
| TESKİ / GAZDAŞ / TREPAŞ | Kapaklı bölgesinde su, doğalgaz ve elektrik dağıtımı yapan kurumlar |
| KVKK | Kişisel Verilerin Korunması Kanunu (Türkiye'nin veri koruma mevzuatı) |
| POI | Point of Interest — haritada işaretlenen ilgi noktası (eczane, park, cami vb.) |
| No-scroll mimari | Ekranların dikey/yanal kaydırma gerektirmeden tek viewport'a sığacak şekilde tasarlanması ilkesi |

## 11. İlgili Dokümanlar

- `design.md` — UI/UX tasarım sistemi ve ekran envanteri
- `architecture.md` — sistem mimarisi ve güvenlik
- `tech.md` — teknoloji yığını ve geliştirme standartları
