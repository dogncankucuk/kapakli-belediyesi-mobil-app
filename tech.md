# Kapaklı Belediyesi Mobil Uygulaması — Teknoloji ve Geliştirme Standartları

> Bu doküman "hangi teknoloji, hangi versiyon, hangi kurala göre yazılıyor" sorusuna cevap verir. Sistem tasarımının kavramsal/yapısal gerekçesi için bkz. `architecture.md`.

## 1. İstemci (Mobil Uygulama)

| Konu | Karar |
|---|---|
| Framework | React Native — Expo (managed workflow) |
| Dil | TypeScript |
| Navigasyon | React Navigation (bottom tabs + stack navigator) |
| Server-state yönetimi | TanStack Query (React Query) |
| Yerel/UI state | React Context veya Zustand (ağır Redux boilerplate'inden kaçınılır) |
| Güvenli depolama | `expo-secure-store` (token'lar için) — düz metin `AsyncStorage` kullanılmaz |
| Form yönetimi | React Hook Form + Zod (şema doğrulama) |
| Hata izleme | Sentry (React Native SDK) |

## 2. Backend (API Katmanı)

| Konu | Karar |
|---|---|
| Framework | NestJS (Node.js + TypeScript) |
| Veritabanı | MongoDB (MongoDB Atlas, yönetilen bulut) |
| ODM | Mongoose |
| Girdi doğrulama | class-validator + DTO'lar (her endpoint'te) |
| Kimlik doğrulama | JWT (kısa ömürlü access token + rotate edilen refresh token) |
| Şifreleme | bcrypt/argon2 (parola hash'leme) |
| Rate limiting | `@nestjs/throttler` |
| Hata izleme | Sentry (Node.js SDK) |
| Harita | `react-native-maps` (Google Maps) |
| Dosya depolama | Cloudinary |
| Push bildirim | Expo Notifications |
| Admin panel | AdminJS (`@adminjs/nestjs` + `@adminjs/mongoose`) — backend içine modül olarak entegre, ayrı servis değil |

## 3. Klasör Yapısı (öneri — proje iskeleti kurulurken uygulanacak)

```
kapakli-bel-app/
├── mobile/                 # React Native (Expo) uygulaması
│   ├── src/
│   │   ├── screens/        # Stitch ekranlarına karşılık gelen bileşenler
│   │   ├── navigation/      # React Navigation yapılandırması
│   │   ├── components/      # Paylaşılan UI bileşenleri
│   │   ├── hooks/            # TanStack Query hook'ları
│   │   ├── theme/            # design.md'deki renk/tipografi tokenleri
│   │   └── api/               # backend API istemcisi
│   └── app.json
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/          # her domain için ayrı modül (auth, appointments, requests, ...)
│   │   ├── admin/             # AdminJS modülü (rol tanımları, resource konfigürasyonu)
│   │   ├── common/           # guard, pipe, interceptor
│   │   └── main.ts
│   └── package.json
├── PRD.md
├── architecture.md
├── design.md
└── tech.md
```

## 4. Kodlama Standartları

- ESLint + Prettier (hem mobile hem backend için ortak kural seti)
- Değişken/fonksiyon isimleri Türkçe iş terimleriyle tutarlı olabilir (örn. `randevuAl`, `faturaOde`) ama teknik altyapı (dosya/klasör isimleri, framework kodu) İngilizce kalır
- Her yeni ekran, `design.md`'deki renk/typografi tokenlerini doğrudan kullanır — hardcoded hex kod yazılmaz

## 5. Test Stratejisi

| Katman | Araç | Kapsam |
|---|---|---|
| Backend birim testi | Jest | Servis/guard/pipe mantığı |
| Backend entegrasyon testi | Jest + `mongodb-memory-server` | Gerçek Atlas'a dokunmadan endpoint akışı |
| Mobil birim testi | Jest + React Native Testing Library | Bileşen/hook davranışı |
| Mobil uçtan uca (e2e) | Detox veya Maestro | Kritik akışlar: giriş, randevu alma, talep oluşturma, fatura ödeme (mock) |
| Güvenlik taraması | `npm audit`, Dependabot | Bağımlılık zafiyeti |

**Öncelikli e2e senaryolar:** misafir olarak gezinme, giriş yap, randevu al, talep oluştur + dosya yükle, fatura ödeme akışı (mock gateway ile).

## 6. CI/CD İskeleti (öneri)

- Her PR'da: lint + birim testleri otomatik çalışır (GitHub Actions)
- `main` dalına merge sonrası: backend otomatik `staging` ortamına deploy edilir
- `production` deploy'u **manuel onay** gerektirir (bir yetkilinin tetiklemesiyle) — özellikle ödeme/kimlik doğrulama gibi kritik değişikliklerde otomatik prod deploy riskli
- Mobil tarafta Expo EAS Build ile Android/iOS derlemeleri otomatikleştirilir

## 7. Ortam Değişkenleri (örnek liste — gerçek değerler asla repoya girmez)

```
# Backend .env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SENTRY_DSN_BACKEND=
PAYMENT_GATEWAY_API_KEY=      # iyzico/PayTR seçimi netleşince
ADMIN_COOKIE_SECRET=          # AdminJS oturum çerezi imzalama
ADMIN_SESSION_SECRET=

# Mobile (.env / app.config)
API_BASE_URL=
GOOGLE_MAPS_API_KEY=
SENTRY_DSN_MOBILE=
EXPO_PUBLIC_ENV=              # development | staging | production
```

> Bu değişkenlerin gerçek değerleri `.env` dosyalarında tutulur, `.gitignore`'a eklenir ve hiçbir zaman sohbet/ekran görüntüsü gibi kanallarla paylaşılmaz (bkz. `architecture.md` Bölüm 4 — Sır Yönetimi).

## 8. İlgili Dokümanlar

- `PRD.md` — ürün gereksinimleri
- `design.md` — UI/UX tasarım sistemi
- `architecture.md` — sistem mimarisi ve güvenlik
