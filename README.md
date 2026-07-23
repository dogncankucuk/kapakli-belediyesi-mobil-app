# Kapaklı Belediyesi Mobil Uygulaması

Kapaklı Belediyesi'nin sunduğu hizmetlerin (fatura ödeme, randevu, harita, duyuru, ulaşım vb.) tek bir mobil uygulama üzerinden, **giriş yapma zorunluluğu olmadan** erişilebilir hale getirilmesini hedefleyen proje deposu.

> **Durum:** 🚧 Geliştirme aşaması — `mobile/` altında `design.md`'deki 30 ekranlık onaylı tasarım (Google Stitch "bel-app" çıktısı) `/team` süreciyle koda döküldü: 5 sekmelik bottom-tab yapısı, paylaşılan UI bileşen kütüphanesi (`mobile/src/components/`), Giriş ekranı (misafir modu) ve global Yan Menü dahil 30 ekranın tamamı gerçek layout/navigasyon ile çalışıyor. Backend'de artık 13 içerik/işlem modülü var: `announcements`, `appointments`, `requests`, `pharmacies`, `meclis-kararlari`, `vefat-edenler`, `wifi-noktalari`, `sehir-kameralari`, `ulasim-hatlari`, `su-hizmetleri` (barajlar + planlı kesintiler), `kent-lokantasi`, `camiler`, `onemli-kurumlar` — hepsi public GET + `admin-panel` üzerinden CONTENT_MANAGER/APPOINTMENT_OPERATOR rolleriyle yönetilen CRUD içeriyor. Mobil tarafta 15 ekran gerçek API'ye bağlandı: `HomeScreen`, `AnnouncementsScreen`, `HaberlerVeEtkinliklerScreen` (Haberler + Etkinlikler segmentleri), `RandevuAlScreen`, `YeniTalepOlusturScreen`, `TaleplerimScreen`, `NobetciEczanelerScreen`, `MeclisKararlariScreen`, `VefatEdenlerScreen`, `WifiNoktalariScreen`, `SehirKameralariScreen`, `UlasimHizmetleriScreen`, `SuHizmetleriScreen`, `KentLokantasiScreen`, `MapScreen` (Eczaneler/Wi-Fi/Camiler/Kurumlar katmanları gerçek veri, Parklar/Tarihi Yerler hâlâ mock). `backend/` altında NestJS + MongoDB kuruldu; admin paneli AdminJS'ten özel bir React+Vite SPA'sına (`admin-panel/`) geçirildi (RBAC + TOTP 2FA, arayüz tamamen Türkçe, bkz. `backend/README.md`) ve artık 11 içerik türü için ayrı yönetim sayfası içeriyor.
>
> **Mobil uygulamayı çalıştırma notu:** `npx expo run:android` (native prebuild) şu an Windows'ta bir NDK/CMake linker hatası nedeniyle ÇALIŞMIYOR (kullanıcı adında boşluk olan Windows path'leriyle ilgili bilinen bir toolchain sorunu, henüz çözülmedi). Bunun yerine `mobile/` içinde `npx expo start --android` çalıştırıp Expo Go üzerinden açın — proje şu an için Expo Go ile tam uyumlu (özel native modül yok, harita için `react-native-webview` + Leaflet/OpenStreetMap kullanılıyor).

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
| Harita | react-native-webview + Leaflet/OpenStreetMap (Expo Go uyumluluğu için — bkz. not aşağıda) |
| Dosya depolama | Cloudinary |
| Bildirim | Expo Notifications |
| Hata izleme | Sentry |
| Admin panel | Özel React + Vite SPA (`admin-panel/`), NestJS içinden statik servis edilir |

Detaylı gerekçeler ve alternatiflerle karşılaştırma için [`architecture.md`](./architecture.md) ve [`tech.md`](./tech.md) dosyalarına bakın.

## Güvenlik ve Uyumluluk Öncelikleri

- Mobil istemci veritabanına **asla doğrudan bağlanmaz**; tüm iş mantığı ve yetkilendirme backend'de toplanır
- Ödeme kartı bilgileri kendi sunucularımıza/veritabanımıza **asla dokunmaz** — PCI-DSS sertifikalı bir gateway (iyzico/PayTR) üzerinden işlenir
- KVKK kapsamında aydınlatma yükümlülüğü, açık rıza, ilgili kişi hakları (görme/düzeltme/silme talebi) ve veri ihlali bildirim süreçleri tasarlanmıştır
- **Açık risk:** Kamu kurumu verisi için yurt içi barındırma zorunluluğu olup olmadığı belediye ile teyit edilme aşamasındadır (bkz. `architecture.md` §9)

## Sıradaki Adımlar

- [ ] Belediyeden veri lokasyonu (yurt içi barındırma) teyidi alınması
- [ ] TESKİ/GAZDAŞ/TREPAŞ gerçek API erişiminin sağlanması (şimdilik mock veriyle ilerlenecek)
- [x] `/team` süreciyle React Native proje iskeletinin kurulması (`mobile/` — Expo TS, React Navigation, tema tokenleri, 5 placeholder ekran)
- [x] NestJS backend + AdminJS proje iskeletinin kurulması (`backend/` — RBAC + TOTP 2FA, `announcements`/`appointments` şemaları; kurulum ve ilk admin hesabı için `backend/README.md`)
- [x] `/team` süreciyle 30 ekranın tasarıma göre implementasyonu (`mobile/src/screens/`, `mobile/src/components/`, `mobile/src/navigation/`) — mock veriyle, backend bağlantısı yok
- [x] İlk public API bağlantısı: `GET /announcements` ve `POST /appointments` (auth yok, misafir erişimi) eklendi; `HomeScreen`, `AnnouncementsScreen`, `HaberlerVeEtkinliklerScreen` ("Haberler" segmenti) ve `RandevuAlScreen` gerçek veriye bağlandı
- [x] AdminJS kaldırılıp yerine özel React+Vite admin paneli (`admin-panel/`) inşa edildi — TOTP 2FA + RBAC ile duyuru/randevu CRUD
- [x] `requests` modülü (backend) + `YeniTalepOlusturScreen`/`TaleplerimScreen` gerçek veriye bağlandı: `POST /requests` ile talep oluşturuluyor, takip numarası cihazda (`AsyncStorage`) saklanıyor, `GET /requests/:id` ile durum sorgulanıyor; belediye personeli talep durumunu (`beklemede`/`islemde`/`tamamlandi`) `admin-panel`'den güncelleyebiliyor (`admin-api/requests`, `appointmentOperator` rolü)
- [x] 8 yeni içerik modülü (backend + admin-panel CRUD sayfası + mobil ekran bağlantısı) eklendi: `pharmacies` (Nöbetçi Eczaneler — architecture.md §3'te zaten planlanmıştı, bugün nöbetçi olanları tarihe göre filtreler), `meclis-kararlari`, `vefat-edenler`, `wifi-noktalari`, `sehir-kameralari`, `ulasim-hatlari` (not: gerçek GPS/canlı takip YOK, "canlı" alanı admin'in elle işaretlediği bir bayrak), `su-hizmetleri` (barajlar + planlı kesintiler, iki alt kaynak), `kent-lokantasi` (günün menüsü). Hepsi CONTENT_MANAGER rolüyle yönetiliyor (architecture.md §9 "İçerik Yöneticisi: announcements, harita POI verileri" tanımına uygun genişletme).
- [x] `HaberlerVeEtkinliklerScreen`'in "Etkinlikler" segmenti gerçek veriye bağlandı — ayrı bir koleksiyon açılmadı, mevcut `announcements`'ın `kategori` alanı `"etkinlik"` değeriyle filtrelendi (admin panelden duyuru girilirken bu kategori seçilirse Etkinlikler'de, aksi halde Haberler'de görünür)
- [x] `Hakkimizda`, `BizeUlasin`, `EngelliYasliHizmetleri`, `FormlarVeDilekceler` ekranları kapakli.bel.tr'den çekilen gerçek kurumsal içerikle dolduruldu (başkan özgeçmişi, tarihçe, güncel nüfus (147.610, TÜİK 2025), gerçek adres/telefon/WhatsApp/e-posta, Evde Bakım Hizmeti kapsamı, sitede fiilen yayında olan 4 başvuru formu — bunlar admin-panel'den yönetilmiyor, statik içerik olarak kaldı çünkü nadiren değişen kurumsal bilgiler). `YardimMerkezi`'nin "Popüler Sorular" listesi bilinçli olarak dokunulmadı (site SSS'i değil, uygulamanın kendi işlevlerine dair app-içi sorular).
- [x] `HavaKalitesiDetay` ekranı gerçek zamanlı resmi veriye bağlandı — backend'de yeni `hava-kalitesi` modülü, T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı'nın SİM (Sürekli İzleme Merkezi, `sim.csb.gov.tr`) API'sini sunucu tarafında proxy'liyor (10 dk cache, dış servis çökerse son bilinen veriyi döndürüyor). Kapaklı'nın kendi istasyonu yok; en yakın resmi istasyon olan Tekirdağ-Çerkezköy MTHM kullanılıyor. AQI, durum (İyi/Orta/Hassas/Sağlıksız/Kötü/Tehlikeli + renk), baskın kirletici ve PM2.5/PM10/NO2/SO2/CO/O3 ham değerleri gerçek. **`HavaDurumuDetay` (genel hava durumu — sıcaklık/nem/rüzgar) hâlâ mock** — bu SİM sistemi sadece hava kalitesi ölçüyor, ayrı bir meteoroloji kaynağı gerekiyor.
- [x] `HavaDurumuDetay` ekranı (ve Ana Sayfa'daki üst-sağ hava durumu widget'ı) gerçek zamanlı resmi veriye bağlandı — backend'de yeni `hava-durumu` modülü, T.C. Meteoroloji Genel Müdürlüğü'nün (MGM, `servis.mgm.gov.tr`) ücretsiz resmi web servisini proxy'liyor (15 dk cache, aynı "son bilinen veriyi döndür" fallback stratejisi). **Kapaklı'nın kendi MGM istasyonu var** (merkezId 95902) — Tekirdağ/Kapaklı sorgusuyla doğrulandı. Anlık sıcaklık/hissedilen/nem/rüzgar + 5 günlük min/max tahmin + MGM'nin kendi "hadise kodu" (AB/PB/Y/KY/GSY vb.) → Türkçe açıklama eşlemesi gerçek.
- [ ] Kalan ekranlar: `FaturaOdeme` (TESKİ/GAZDAŞ/TREPAŞ — PRD'de gerçek API erişimi sağlanana kadar bilinçli olarak mock), `GirisEkrani`/`Profile`/`HesapBilgilerim`/`Ayarlar` (gerçek vatandaş kimlik doğrulaması — `users` koleksiyonu + JWT — henüz kurulmadı, kapsamlı/güvenlik-kritik bir iş olduğu için bilinçli olarak bu tura dahil edilmedi)
- [x] `MapScreen` gerçek veriye bağlandı: `pharmacies`/`wifi-noktalari` şemalarına `lat`/`lng` eklendi; iki yeni backend modülü (`camiler`, `onemli-kurumlar` — OpenStreetMap Overpass API'den doğrulanmış gerçek koordinatlarla seed edildi: T.C. Kapaklı Belediye Başkanlığı, Kaymakamlık, İlçe Emniyet Müdürlüğü, Zabıta Müdürlüğü, PTT Şubesi, 2 gerçek cami) eklenip admin-panel'e CRUD sayfaları (`CamilerPage`, `OnemliKurumlarPage`) ve Nöbetçi Eczaneler/Wi-Fi formlarına lat/lng alanları eklendi. Mobilde harita artık 6 katman gösteriyor: Parklar/Tarihi Yerler (hâlâ mock, gerçek Kapaklı koordinatlarına taşındı) + Eczaneler/Wi-Fi/Camiler/Kurumlar (backend'den canlı çekiliyor). Katman seçici, önceki 3-segmentlik `SegmentedControl`'den 6 ikonlu bir sekme satırına çevrildi (kullanıcının "camii imgesine tıklayınca sadece camiler görünsün" isteğine birebir uygun). Ayrıca haritanın merkez koordinatı düzeltildi — eski mock veri yanlışlıkla Silivri/İstanbul civarını (`41.05, 28.15`) gösteriyordu, gerçek Kapaklı `~41.33, 27.97`'ye taşındı.
- [x] `ServicesScreen`'de React Navigation'ın deprecated ettiği `navigate({ name, params })` tek-nesne kalıbı (10 kart) `navigate(name, params)` iki-argümanlı forma çevrildi (konsol uyarısı doğrulanarak kapatıldı).
- [x] React Navigation'da önceden var olan bir hata düzeltildi: her tab (`Home`/`Services`/`Map`/`Announcements`/`Profile`) kendi iç stack'inde AYNI isimli bir kök ekran barındırıyordu (örn. tab `Home` → `HomeStack` içinde ekran adı da `Home`), bu da "Found screens with the same name nested inside one another" uyarısına ve geri tuşunda tutarsız davranışa yol açıyordu. İç ekran isimleri `HomeMain`/`ServicesMain`/`MapMain`/`AnnouncementsMain`/`ProfileMain` olarak yeniden adlandırıldı, tek doğrudan referans (`BizeUlasinScreen`'deki "Haritada Gör") güncellendi.
- [ ] Public `POST /appointments` ve `POST /requests` uç noktalarına rate limiting eklenmesi (production öncesi gerekli, code review'da tespit edildi)
- [ ] Vatandaş kimlik doğrulama sistemi (`users` koleksiyonu, JWT access+refresh token, `expo-secure-store`) — architecture.md'de tasarlanmış ama henüz kodlanmadı

## İletişim / Kaynak

- Referans belediye web sitesi: [kapakli.bel.tr](https://www.kapakli.bel.tr/)
- UI tasarımı: Google Stitch ("bel-app" projesi)
