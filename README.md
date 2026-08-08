# Kapaklı Belediyesi Mobil Uygulaması

Kapaklı Belediyesi'nin sunduğu hizmetlerin (fatura ödeme, randevu, harita, duyuru, ulaşım vb.) tek bir mobil uygulama üzerinden, **giriş yapma zorunluluğu olmadan** erişilebilir hale getirilmesini hedefleyen proje deposu.

> **Durum:** 🚀 **v3** — vatandaş kimlik doğrulama (T.C. kimlik/telefon/e-posta + şifre, Google ile giriş, Şifremi Unuttum), 6 katmanlı gerçek harita verisi, admin panelinde kullanıcı yönetimi ve kapsamlı bir güvenlik sıkılaştırması ile birlikte. Aşağıdaki **[Sürüm Notları](#sürüm-notları)** bölümü bu sürümde neyin değiştiğini ayrıntılı olarak listeler.

## İçindekiler

- [Bu Depo Ne İçeriyor?](#bu-depo-ne-i̇çeriyor)
- [Proje Özeti](#proje-özeti)
- [Teknoloji Yığını](#teknoloji-yığını-özet)
- [Kurulum](#kurulum)
- [Güvenlik ve Uyumluluk](#güvenlik-ve-uyumluluk-öncelikleri)
- [Sürüm Notları](#sürüm-notları)
- [Bilinen Açık Noktalar](#bilinen-açık-noktalar)

## Bu Depo Ne İçeriyor?

Kod yazılmadan önce projenin dört temel dokümanı hazırlandı; her biri farklı bir soruya cevap verir:

| Doküman | Soru | İçerik |
|---|---|---|
| [`PRD.md`](./PRD.md) | Ne inşa ediyoruz, neden? | Problem tanımı, hedef kitle, özellik kapsamı, kullanıcı senaryoları, erişilebilirlik gereksinimleri, riskler |
| [`design.md`](./design.md) | Nasıl görünüyor ve davranıyor? | Marka kimliği (logo/renk/tipografi), 30 ekranlık tasarım envanteri, no-scroll navigasyon kuralları, Stitch'in ürettiği nihai tasarım tokenleri |
| [`architecture.md`](./architecture.md) | Sistem nasıl kurulu? | 3 katmanlı mimari, MongoDB şema tasarımı, güvenlik kontrolleri, KVKK uyumluluğu, push bildirim/offline stratejisi |
| [`tech.md`](./tech.md) | Hangi teknoloji, hangi kuralla? | Kesinleşen teknoloji yığını, klasör yapısı, test stratejisi, CI/CD, ortam değişkenleri |

## Proje Özeti

**Hedef kullanıcı:** Kapaklı ilçesi sakinleri, geniş yaş aralığı (18–70+). Bu nedenle erişilebilirlik (WCAG 2.1 AA hedefi) ve KVKK uyumluluğu (6698 sayılı Kanun) bu proje için **temel, ödünsüz gereksinimlerdir**.

**Kapsanan hizmet alanları (5 sekmelik tab bar):**
- **Ana Sayfa** — duyuru özeti, gerçek zamanlı hava durumu widget'ı, hızlı erişim
- **Hizmetler** — su hizmetleri, randevu sistemi, talep/dilekçe oluşturma, engelli ve yaşlı hizmetleri, nöbetçi eczaneler, kent lokantası, ulaşım hatları (fatura ödeme hâlâ mock — bkz. Açık Noktalar)
- **Harita** — 6 gerçek veri katmanı: Parklar, Tarihi Yerler, Nöbetçi Eczaneler, Wi-Fi Noktaları, Camiler, Önemli Kurumlar (belediye, kaymakamlık, emniyet, itfaiye, PTT vb.), her biri kendi ikonuyla filtrelenebilir
- **Duyurular** — haberler, etkinlikler, meclis kararları
- **Profil** — T.C. kimlik/telefon/e-posta + şifre veya Google ile giriş (misafir kullanım da destekleniyor), şifremi unuttum akışı, hesap bilgileri, ayarlar, kurumsal bilgiler

## Teknoloji Yığını (özet)

| Katman | Teknoloji |
|---|---|
| Mobil istemci | React Native (Expo) + TypeScript, React Navigation |
| Backend | NestJS (Node.js + TypeScript) + MongoDB |
| Kimlik doğrulama | JWT (vatandaş), oturum + TOTP 2FA (admin panel) |
| Harita | `react-native-webview` + Leaflet/OpenStreetMap |
| Admin panel | Özel React + Vite SPA (`admin-panel/`), NestJS içinden `/admin` altında statik servis edilir |

Detaylı gerekçeler için [`architecture.md`](./architecture.md) ve [`tech.md`](./tech.md) dosyalarına bakın.

## Kurulum

Üç paket de bağımsız `npm install` gerektirir: `backend/`, `mobile/`, `admin-panel/`.

**Backend** (`backend/README.md`'de ayrıntılı kurulum var):
1. `backend/.env.example`'ı `.env` olarak kopyalayın, tüm değerleri doldurun (özellikle `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SESSION_SECRET`).
2. `CORS_ORIGIN`'i **production'da mutlaka** gerçek domain(ler)e ayarlayın — boş bırakılırsa (sadece geliştirme için) tüm originlere izin verilir.
3. `npm run start:dev`

**Mobil**: `mobile/src/api/client.ts`'deki `ANDROID_TARGET` değerini emülatör/fiziksel cihaza göre ayarlayıp `npx expo start` (Expo Go) veya `npx expo run:android` (native build) çalıştırın.

**Admin panel**: `npm run dev` (geliştirme, backend'e proxy'lenir) veya `npm run build` (production, `backend/`'in `/admin` altında servis ettiği `dist/` çıktısını üretir).

## Güvenlik ve Uyumluluk Öncelikleri

- Mobil istemci veritabanına **asla doğrudan bağlanmaz**; tüm iş mantığı ve yetkilendirme backend'de toplanır
- Şifreler bcrypt ile hash'lenir (10 salt round), hiçbir yerde düz metin tutulmaz
- Vatandaş oturumları JWT (7 gün geçerli) ile yönetilir; admin bir hesabı dondurduğunda o hesabın **tüm mevcut oturumları anında geçersiz olur** (`tokenVersion` mekanizması)
- Public uç noktalarda (kayıt, giriş, şifremi unuttum, talep/randevu oluşturma) rate limiting var
- Vatandaş hesapları (T.C. kimlik no, telefon gibi KVKK kapsamında hassas veri içerir) admin panelinde **sadece Süper Yönetici** rolüne açıktır
- Ödeme kartı bilgileri kendi sunucularımıza/veritabanımıza **asla dokunmaz** — PCI-DSS sertifikalı bir gateway (iyzico/PayTR) üzerinden işlenecek şekilde tasarlanmıştır
- **Açık risk:** Kamu kurumu verisi için yurt içi barındırma zorunluluğu olup olmadığı belediye ile teyit edilme aşamasındadır (bkz. `architecture.md` §9)

## Sürüm Notları

### v3 — Vatandaş kimlik doğrulama, gerçek harita verisi, admin kullanıcı yönetimi, güvenlik sıkılaştırması

**Kimlik doğrulama**
- T.C. kimlik no / telefon / e-posta + şifre ile kayıt ve giriş (`POST /auth/register`, `POST /auth/login`)
- Google ile giriş — hem web (tarayıcı tabanlı) hem native Android akışı (`@react-native-google-signin/google-signin`) çalışır durumda
- **Şifremi Unuttum akışı**: telefona SMS ile 6 haneli doğrulama kodu (şu an bir SMS sağlayıcısı henüz bağlanmadı, kod dev ortamında backend logına yazılır — production için `backend/src/modules/users/sms.service.ts`'in gerçek bir sağlayıcıyla (Netgsm, Vatan SMS, Twilio vb.) değiştirilmesi yeterli, çağıran kod hiç değişmez)
- T.C. Kimlik No artık resmi checksum algoritmasıyla doğrulanıyor (önceden sadece "11 haneli mi" kontrol ediliyordu)
- Şifreler en az 8 karakter + harf ve rakam zorunluluğu ile oluşturuluyor

**Harita** — artık 6 katmanın tamamı gerçek veri (önceden Parklar/Tarihi Yerler mock'tu):
- Parklar (92, belediyenin kendi GIS sistemi), Tarihi Yerler (27, OpenStreetMap), Nöbetçi Eczaneler (34, OpenStreetMap), Wi-Fi Noktaları (12, belediye GIS), Camiler (21, belediye GIS), Önemli Kurumlar (8, OpenStreetMap + belediye GIS)

**Admin panel**
- Yeni **Kullanıcılar** sayfası: vatandaş hesaplarını arama, hesap dondurma/aktif etme, kalıcı silme (KVKK "unutulma hakkı" desteği) — hassas kişisel veri içerdiği için sadece Süper Yönetici rolüne açık

**Güvenlik sıkılaştırması**
- `helmet` ile güvenlik header'ları
- Rate limiting: giriş/kayıt/şifremi-unuttum/randevu/talep uç noktalarında IP başına istek sınırı
- CORS artık `CORS_ORIGIN` ortam değişkeniyle yapılandırılabilir (production'da ayarlanmalı)
- E-posta artık tekil (aynı e-postayla ikinci hesap açılamıyor)
- Admin tarafından dondurulan bir hesabın JWT'si anında geçersiz kılınıyor (`tokenVersion`)

**Native build**
- Windows'ta `npx expo run:android`'i engelleyen NDK/CMake/260-karakter-path sorunu çözüldü, native Google Sign-In artık gerçekten çalışıyor

### v2 ve öncesi

Vatandaş talep/randevu sistemi, 13 içerik modülü (duyurular, eczaneler, meclis kararları, vefat ilanları, Wi-Fi noktaları, şehir kameraları, ulaşım hatları, su hizmetleri, kent lokantası, camiler, önemli kurumlar), canlı hava durumu/hava kalitesi entegrasyonu (MGM ve T.C. Çevre Bakanlığı resmi API'leri), AdminJS'ten özel bir React+Vite admin paneline geçiş (RBAC + TOTP 2FA), kapakli.bel.tr'den çekilen gerçek kurumsal içerik (Hakkımızda, Bize Ulaşın, Formlar vb.).

## Bilinen Açık Noktalar

- **Fatura Ödeme** (TESKİ/GAZDAŞ/TREPAŞ) — gerçek API erişimi sağlanana kadar bilinçli olarak mock
- **E-posta doğrulama** (kayıtta mail onayı) kurulmadı — bir SMTP sağlayıcısı seçilip yapılandırılması gerekiyor
- **Tam bir refresh-token sistemi yok** — bunun yerine 7 günlük JWT + admin'in anlık iptal edebildiği `tokenVersion` mekanizması kullanılıyor
- **MongoDB kimlik doğrulamasız** — sadece localhost'tan erişilebildiği sürece düşük risk, production'a taşınırken (Mongo Atlas vb.) mutlaka bir kullanıcı/şifre eklenmeli
- Yurt içi veri barındırma zorunluluğu belediye ile teyit edilmedi

## İletişim / Kaynak

- Referans belediye web sitesi: [kapakli.bel.tr](https://www.kapakli.bel.tr/)
- UI tasarımı: Google Stitch ("bel-app" projesi)
