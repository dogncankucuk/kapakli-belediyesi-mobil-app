# Kapaklı Belediyesi Mobil Uygulaması

Kapaklı Belediyesi'nin sunduğu hizmetlerin (fatura ödeme, randevu, harita, duyuru, ulaşım vb.) tek bir mobil uygulama üzerinden, **giriş yapma zorunluluğu olmadan** erişilebilir hale getirilmesini hedefleyen proje deposu.

> **Durum:** 📋 Dokümantasyon / planlama aşaması — henüz kod yazılmadı. UI tasarımı Google Stitch ile tamamlandı, mimari ve teknoloji kararları netleşti. Sıradaki adım `/team` süreciyle React Native uygulamasının kodlanmasıdır.

## Bu Depo Ne İçeriyor?

Kod yazılmadan önce projenin dört temel dokümanı hazırlandı; her biri farklı bir soruya cevap verir:

| Doküman | Soru | İçerik |
|---|---|---|
| [`PRD.md`](./PRD.md) | Ne inşa ediyoruz, neden? | Problem tanımı, hedef kitle, özellik kapsamı, kullanıcı senaryoları, erişilebilirlik gereksinimleri, riskler |
| [`design.md`](./design.md) | Nasıl görünüyor ve davranıyor? | Marka kimliği (logo/renk/tipografi), 30 ekranlık tasarım envanteri, no-scroll navigasyon kuralları, Stitch'in ürettiği nihai tasarım tokenleri |
| [`architecture.md`](./architecture.md) | Sistem nasıl kurulu? | 3 katmanlı mimari, MongoDB şema tasarımı, güvenlik kontrolleri, KVKK uyumluluğu, push bildirim/offline stratejisi |
| [`tech.md`](./tech.md) | Hangi teknoloji, hangi kuralla? | Kesinleşen teknoloji yığını, klasör yapısı, test stratejisi, CI/CD, ortam değişkenleri |

Bu dört doküman birbirine çapraz referans verir ve `/team` sürecindeki ajanların (researcher, tech-lead-orchestrator, implementer, code-reviewer, qa-tester) doğrudan referans alacağı teknik brief olarak tasarlanmıştır.

## Proje Özeti

**Hedef kullanıcı:** Kapaklı ilçesi sakinleri, geniş yaş aralığı (18–70+). Bu nedenle erişilebilirlik (WCAG 2.1 AA hedefi: ekran okuyucu desteği, punto büyütme, renk körlüğü desteği, yüksek kontrast) ve KVKK uyumluluğu (6698 sayılı Kanun — kamu kurumu olarak ağırlaştırılmış sorumluluk) bu proje için **temel, ödünsüz gereksinimlerdir**, sonradan eklenecek özellikler değil.

**Kapsanan hizmet alanları (30 ekran, 5 sekmelik tab bar):**
- **Ana Sayfa** — duyuru özeti, hızlı erişim
- **Hizmetler** — TESKİ/GAZDAŞ/TREPAŞ fatura ödeme, su hizmetleri, randevu sistemi (nikah dairesi, spor salonları), talep/dilekçe oluşturma, engelli ve yaşlı hizmetleri
- **Harita** — park/bahçe doluluk sistemi, tarihi yerler (QR kod yönlendirmeli), nöbetçi eczaneler, ulaşım, hava durumu/kalitesi, Wi-Fi noktaları, şehir kameraları ve genişletilmiş POI kategorileri (sağlık ocakları, camiler, noterler, itfaiye vb.)
- **Duyurular** — haberler, etkinlikler, meclis kararları
- **Profil** — opsiyonel giriş (misafir kullanım destekli), hesap bilgileri, ayarlar, kurumsal bilgiler (Hakkımızda, Bize Ulaşın, Kapaklı tarihi/nüfus bilgileri)

## Teknoloji Yığını (özet)

| Katman | Teknoloji |
|---|---|
| Mobil istemci | React Native (Expo) + TypeScript, React Navigation, TanStack Query |
| Backend | NestJS (Node.js + TypeScript) |
| Veritabanı | MongoDB (MongoDB Atlas) |
| Harita | react-native-maps (Google Maps) |
| Dosya depolama | Cloudinary |
| Bildirim | Expo Notifications |
| Hata izleme | Sentry |

Detaylı gerekçeler ve alternatiflerle karşılaştırma için [`architecture.md`](./architecture.md) ve [`tech.md`](./tech.md) dosyalarına bakın.

## Güvenlik ve Uyumluluk Öncelikleri

- Mobil istemci veritabanına **asla doğrudan bağlanmaz**; tüm iş mantığı ve yetkilendirme backend'de toplanır
- Ödeme kartı bilgileri kendi sunucularımıza/veritabanımıza **asla dokunmaz** — PCI-DSS sertifikalı bir gateway (iyzico/PayTR) üzerinden işlenir
- KVKK kapsamında aydınlatma yükümlülüğü, açık rıza, ilgili kişi hakları (görme/düzeltme/silme talebi) ve veri ihlali bildirim süreçleri tasarlanmıştır
- **Açık risk:** Kamu kurumu verisi için yurt içi barındırma zorunluluğu olup olmadığı belediye ile teyit edilme aşamasındadır (bkz. `architecture.md` §9)

## Sıradaki Adımlar

- [ ] Belediyeden veri lokasyonu (yurt içi barındırma) teyidi alınması
- [ ] TESKİ/GAZDAŞ/TREPAŞ gerçek API erişiminin sağlanması (şimdilik mock veriyle ilerlenecek)
- [ ] `/team` süreciyle React Native + NestJS proje iskeletinin kurulması ve ekranların kodlanması

## İletişim / Kaynak

- Referans belediye web sitesi: [kapakli.bel.tr](https://www.kapakli.bel.tr/)
- UI tasarımı: Google Stitch ("bel-app" projesi)
