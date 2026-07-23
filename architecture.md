# Kapaklı Belediyesi Mobil Uygulaması — Mimari ve Güvenlik Dokümanı

> Bu doküman, /team pipeline'ının (researcher, tech-lead-orchestrator, implementer, code-reviewer, qa-tester) referans alacağı teknik karar dokümanıdır. UI tasarımı için bkz. `design.md`, ürün gereksinimleri için bkz. `PRD.md`, teknoloji detayları için bkz. `tech.md`.

## 1. Teknoloji Yığını (Kesinleşen Kararlar)

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Mobil istemci | React Native + Expo (managed workflow) | Tek kod tabanından iOS+Android, Windows'ta native toolchain gerekmeden geliştirme/test |
| Dil | TypeScript | Tip güvenliği, 30 ekran + çok sayıda API tipi için hata payını azaltır |
| Navigasyon | React Navigation (bottom tabs + stack) | RN ekosisteminde fiili standart |
| Server-state | TanStack Query (React Query) | Sunucudan gelen veri (duyuru/hizmet/haber) için cache/loading/refetch yönetimi |
| Backend API | NestJS (Node.js, TypeScript) | Modüler mimari, hazır Guard/Pipe sistemi ile yetkilendirme + veri doğrulama, kurumsal/güvenlik odaklı projelerde standart |
| Veritabanı | MongoDB (MongoDB Atlas, yönetilen bulut) | Kullanıcı tercihi; Atlas ile otomatik yedekleme, encryption at rest, IP whitelist/VPC hazır geliyor |
| Hata izleme | Sentry (client + backend) | Crash/hata anlık bildirim |
| Ödeme altyapısı | PCI-DSS sertifikalı üçüncü taraf gateway (iyzico/PayTR vb.) | Kart verisi hiçbir zaman kendi sunucumuza dokunmaz |
| Harita | `react-native-maps` (Google Maps) | Expo ile doğrudan uyumlu, POI/marker/custom katman ihtiyacını karşılar, Türkiye'de yaygın destek |
| Dosya depolama | Cloudinary | Talep/dilekçe eklerinde (fotoğraf, PDF) kullanıcı yüklemesi + otomatik görsel optimizasyonu |
| Push bildirim | Expo Notifications (FCM/APNs üzerinden) | Expo managed workflow ile hazır entegre, duyuru/randevu durumu bildirimleri için |

## 2. Genel Mimari — 3 Katman

```
React Native (Expo)  →  Backend API (NestJS)  →  MongoDB Atlas
      ↑                        ↑
  expo-secure-store       Guard/Pipe: Auth +
  (token saklama,          Validation (DTO) +
   AsyncStorage DEĞİL)     Rate Limiting +
                           Yetkilendirme (rol bazlı)
```

**Zorunlu ilke:** Mobil istemci veritabanına asla doğrudan bağlanmaz. Mobil uygulamaya gömülen her şey (API anahtarı, bağlantı string'i) tersine mühendislikle çıkarılabilir; bu yüzden tüm iş mantığı, yetkilendirme ve veri doğrulama backend'de toplanır.

## 3. MongoDB Koleksiyon Tasarımı

| Koleksiyon | İçerik | Hassasiyet Notu |
|---|---|---|
| `users` | adSoyad, telefon, email, passwordHash, roller, kvkkOnayi, kvkkOnayTarihi | T.C. kimlik no gerekiyorsa **field-level encryption**; mümkünse hiç saklanmaz, sadece doğrulama anında kullanılıp atılır |
| `refreshTokens` | userId, tokenHash, deviceInfo, expiresAt, revoked | Token'lar hash'lenerek saklanır, düz metin asla |
| `appointments` (randevular) | userId (nullable — misafir de randevu alabilir), hizmetTuru, tarih, saat, durum | — |
| `requests` (talepler) | userId, kategori, aciklama, durum, ekDosyaUrl | Dosyanın kendisi DB'de değil **Cloudinary**'de saklanır; DB'de yalnızca Cloudinary URL'si tutulur |
| `announcements` (duyuru/haber) | baslik, icerik, resimUrl, yayinTarihi, kategori | Genel okuma, admin panelden yönetilir |
| `pharmacies` (nöbetçi eczane) | dış kaynaktan senkronize/cache edilen veri | — |
| `billPaymentLogs` (fatura ödeme kayıtları) | userId, kurum (TESKİ/GAZDAŞ/TREPAŞ), tutar, durum, gatewayTransactionId | **Kart numarası/CVV asla saklanmaz** — sadece gateway'in döndürdüğü işlem referansı |
| `auditLogs` | kritik işlemler (giriş denemesi, ödeme, randevu iptali) | Append-only, immutable |

## 4. Güvenlik Kontrolleri

### Kimlik doğrulama & oturum
- Şifreler bcrypt/argon2 ile hash'lenir, düz metin asla saklanmaz
- JWT access token (kısa ömürlü, ~15 dk) + rotate edilen refresh token modeli
- Refresh token'lar DB'de hash'lenerek, cihaza bağlı (device binding) saklanır
- Mobil tarafta token'lar `expo-secure-store` (Keychain/Keystore) içinde tutulur — düz metin `AsyncStorage` kullanılmaz

### KVKK uyumluluğu (6698 sayılı Kanun — kamu kurumu uygulaması olduğu için ağırlaştırılmış sorumluluk)

**Öncelik notu:** Bu proje için KVKK uyumluluğu sert bir gereksinimdir; belediye tüzel kişilik olarak veri sorumlusu sıfatıyla doğrudan sorumludur.

- **Aydınlatma yükümlülüğü (Madde 10):** Giriş/kayıt ekranında hangi verinin, hangi amaçla toplandığı, kime aktarılabileceği (örn. ödeme gateway'i, harita sağlayıcısı) açıkça belirtilir
- **Açık rıza (Madde 5-6):** Genel veriler için standart rıza yeterli; ancak **"Engelli ve Yaşlı Hizmetleri"** gibi özel nitelikli veri (sağlık/engellilik durumu) toplanan akışlarda **ayrı ve daha belirgin bir açık rıza** alınır
- **VERBİS kaydı:** Belediyenin Veri Sorumluları Sicili'ne (VERBİS) kayıtlı olması gerekir — bu belediyenin hukuk/BT biriminin sorumluluğu, ancak uygulama bu kayıtla tutarlı bir veri işleme envanteri üretebilmelidir
- **İlgili kişi hakları (Madde 11):** Kullanıcının verisini görme, düzeltme, sildirme, işlemeye itiraz etme talebini iletebileceği bir başvuru akışı (Profil/Ayarlar altında)
- **Veri ihlali bildirimi:** Bir ihlal tespit edilirse KVK Kurumu'na 72 saat içinde bildirim zorunluluğu vardır — bu nedenle audit log ve anomali izleme (bkz. Bölüm 8) kritik önemde
- **Veri minimizasyonu ve saklama süresi:** Sadece işlevsel olarak gerekli alanlar toplanır; amaç ortadan kalktığında (örn. tamamlanmış eski talepler) veri silinir/anonimleştirilir
- **Hassas alanlar** (varsa T.C. kimlik no) için field-level encryption; mümkünse hiç kalıcı saklanmaz

### ⚠️ Açık risk: Veri lokasyonu (yurt içi barındırma)

Kamu kurumu verisi için Türkiye sınırları içinde barındırma zorunluluğu olup olmadığı **belediye/amirle teyit edilmesi gereken açık bir sorudur**. Şu anki teknoloji seçimlerimizin (MongoDB Atlas, Cloudinary, Sentry) hepsi **varsayılan olarak yurt dışı sunucu** kullanır. Teyit sonucuna göre:
- Yurt dışı barındırma sorun değilse → mevcut seçimlerle devam edilir
- Yurt içi barındırma şartsa → MongoDB Atlas'ın Türkiye bölgesi (varsa) veya yerli bulut sağlayıcılar (Türk Telekom Bulut, Turkcell Bulut vb.) araştırılıp mimari buna göre revize edilir

Bu teyit alınana kadar bu madde **açık risk** olarak işaretlenmiştir (bkz. Bölüm 10).

### Ödeme güvenliği (KRİTİK)
- Kart bilgileri asla kendi backend/DB'mize dokunmaz
- TESKİ/GAZDAŞ/TREPAŞ ödemeleri PCI-DSS sertifikalı bir sağlayıcının (iyzico/PayTR vb.) hosted checkout veya SDK'sı üzerinden yapılır
- Backend yalnızca işlem durumu ve gateway referans ID'sini saklar

### API güvenliği
- Her endpoint'te DTO tabanlı girdi doğrulama (NestJS class-validator) — NoSQL injection'a karşı
- Rate limiting: özellikle giriş, şifre sıfırlama, ödeme başlatma endpoint'lerinde brute-force koruması
- HTTPS zorunlu, HTTP tamamen kapalı
- Rol bazlı yetkilendirme: misafir / vatandaş / admin

### Sır yönetimi
- API anahtarları ve DB bağlantı string'i koda gömülmez; `.env` + hosting sağlayıcısının secret manager'ı kullanılır
- Anahtarlar/token'lar sohbet veya ekran görüntüsü gibi kanallarla paylaşılmaz; paylaşılırsa iptal edilip yenisi çıkarılır

## 5. Push Bildirim Mimarisi

- **Expo Notifications** kullanılır (Android'de FCM, iOS'ta APNs'i arka planda yönetir — ayrı Firebase/Apple kurulum derdi yok)
- Bildirim tetikleyen olaylar: yeni duyuru/haber yayınlandığında, talep durumu değiştiğinde, randevu onaylandığında/hatırlatma
- Cihaz push token'ı `users` koleksiyonunda tutulur; bildirim tercihleri (aç/kapa, kategori bazlı) Ayarlar ekranından yönetilir
- Bildirim içeriğinde asla hassas veri (T.C. kimlik no, tutar detayı vb.) gönderilmez — sadece "Talebiniz güncellendi, uygulamayı açın" gibi genel metin

## 6. Offline / Cache Stratejisi

- **TanStack Query** zaten sunucu verisini cache'ler; `staleTime`/`cacheTime` ayarlarıyla duyuru/hizmet listeleri gibi az değişen veriler gereksiz yere tekrar çekilmez
- İnternet yokken: son başarılı cache gösterilir + ekranda "Çevrimdışı, son güncel veri gösteriliyor" uyarısı (sessiz başarısızlık yerine şeffaf bildirim)
- Harita katmanları (POI listesi) için temel veri cihazda önbelleğe alınır ki harita tamamen boş açılmasın
- Kritik yazma işlemleri (randevu alma, talep oluşturma, ödeme) **offline'da kuyruklanmaz** — kullanıcıya net şekilde "bağlantı yok, tekrar deneyin" gösterilir; sessizce arka planda "başarılı" göstermek finansal/randevu işlemlerinde risklidir

## 7. Ortamlar (Environments)

| Ortam | Amaç | Not |
|---|---|---|
| `development` | Yerel geliştirme | Mock veri + gerçek MongoDB Atlas dev cluster'ı |
| `staging` | Belediye/amir onayı öncesi test | Prod'a yakın veri, gerçek entegrasyonlar test modunda (örn. ödeme gateway sandbox) |
| `production` | Canlı kullanıcı | Gerçek entegrasyonlar, sıkı rate limit, tam izleme (Sentry + uptime) aktif |

Her ortam ayrı `.env` dosyası ve ayrı MongoDB Atlas cluster'ı (veya en azından ayrı veritabanı) kullanır; production sırları asla development ortamında kullanılmaz.

## 8. Kararlılık ("Uygulama Patlamasın")

- **Hata izleme:** Sentry — hem RN client hem NestJS backend için crash/hata anlık bildirimi
- **Graceful degradation:** Harita/duyuru gibi dış veri çekilemezse uygulama çökmez, "veri yüklenemedi, tekrar dene" durumu gösterilir
- **Health check + uptime monitoring:** Backend'in ayakta olup olmadığını izleyen basit bir servis (örn. UptimeRobot)
- **Loglama disiplini:** Merkezi log toplama yapılır ama loglara şifre/token/kart bilgisi asla yazılmaz
- **Bağımlılık güvenliği:** `npm audit` / Dependabot ile düzenli güvenlik açığı taraması

## 9. Admin Panel Mimarisi

Belediye personelinin duyuru/randevu/talep/harita POI gibi içerikleri yönetebileceği, birden fazla kişinin **eşzamanlı ve rol bazlı** kullanabileceği bir web admin paneli gerekiyor.

### Teknoloji kararı: AdminJS

- **AdminJS** (`@adminjs/nestjs` + `@adminjs/mongoose`), mevcut NestJS backend'ine ayrı bir modül olarak eklenir — ayrı bir servis/deploy değildir, aynı backend process'i içinde çalışır
- Mevcut Mongoose şemaları (`announcements`, `appointments`, `requests`, `pharmacies` vb.) üzerinden otomatik CRUD arayüzü üretir; şemaları tekrar yazmaya gerek yoktur
- Gerekçe: sıfırdan özel bir admin web app'i yazmaktan çok daha az geliştirme süresi ister, RBAC ve temel audit desteği hazır gelir — staj projesinin zaman/kaynak kısıtına uygun

### Rol bazlı yetkilendirme (RBAC)

Birden fazla kişi aynı anda panele erişebilmeli ama herkes her şeyi yapamamalı:

| Rol | Yetki kapsamı |
|---|---|
| Süper Admin | Tüm koleksiyonlar + admin kullanıcı yönetimi (yeni admin ekleme/silme, rol atama) |
| İçerik Yöneticisi | `announcements`, harita POI verileri üzerinde create/update/delete |
| Randevu/Talep Operatörü | `appointments`, `requests` üzerinde read/update (durum değiştirme) — silme yetkisi yok |
| Salt-okunur Denetçi | Tüm koleksiyonlarda yalnızca read — denetim/raporlama amaçlı |

- Admin kullanıcıları, mobil uygulamanın `users` koleksiyonundan **ayrı** bir `adminUsers` koleksiyonunda tutulur (vatandaş hesapları ile karışmaması, yetki yükseltme riskinin izole edilmesi için)
- Admin hesapları için **2FA zorunlu** (TOTP) — yetkileri normal kullanıcıdan çok daha geniş olduğu için

### Eşzamanlı düzenleme ve hesap verebilirlik

- Yönetilen her koleksiyona `updatedAt` + `updatedBy` (hangi admin) alanları eklenir
- Basit çakışma önleme: "son kaydeden kazanır" fakat kayıt en son kim tarafından ne zaman değiştirildiyse arayüzde gösterilir, sessiz üzerine yazma yapılmaz
- `auditLogs` koleksiyonu (bkz. Bölüm 3) admin panel işlemlerini de kapsayacak şekilde genişletilir: hangi admin, hangi kaydı, ne zaman, hangi alanları değiştirdi — KVKK'nın hesap verebilirlik ve 72 saatlik ihlal bildirimi gerekliliği için de kullanılır

### Erişim kanalı: web, mobil uygulama değil

- Admin paneli **tarayıcı üzerinden erişilen bir web arayüzüdür** — React Native mobil uygulamanın içinde bir ekran/bölüm değildir, vatandaşların indirdiği uygulamayla hiçbir bağlantısı yoktur
- AdminJS, backend'in HTTP sunucusu üzerinden kendi web arayüzünü (React tabanlı) servis eder; belediye personeli bir bilgisayar/tablet tarayıcısından bu URL'ye giriş yapar
- Bu tercihin gerekçesi: masa başı veri girişi/tablo yönetimi tarayıcıda daha pratik, ayrıca mobil app'e admin özelliği eklemek App Store/Play Store onay süreciyle sınırlı kalırdı — web panelde anında deploy edilir

### Erişim kısıtlama

- Admin paneli mobil kullanıcıların erişemeyeceği ayrı bir route/subdomain üzerinden sunulur (örn. `/admin` veya `admin.` subdomain), arama motoru indekslemesinden hariç tutulur
- Mümkünse ek katman: sabit IP aralığı/VPN kısıtlaması (belediye içi ağ) — üretim aşamasında değerlendirilecek

## 10. Açık Konular / Sonraki Kararlar

- **[ORTA ÖNCELİK] Rate limiting eksik:** İlk mobil-backend bağlantısı için eklenen `GET /announcements` ve `POST /appointments` uç noktaları misafir erişimine açık (auth yok) ama henüz `@nestjs/throttler` ile rate-limit'lenmedi — code review'da tespit edildi, production öncesi eklenmesi gerekiyor (bkz. Bölüm 4 — API güvenliği)
- **[YÜKSEK ÖNCELİK] Veri lokasyonu:** Belediye/amirden, kamu verisinin yurt içinde barındırılması gerekip gerekmediği teyit edilecek (bkz. Bölüm 4 — Açık risk). Bu cevaba göre MongoDB Atlas/Cloudinary/Sentry bölge seçimi veya yerli alternatiflere geçiş kararı verilecek
- TESKİ, GAZDAŞ, TREPAŞ ile gerçek API entegrasyonu için belediyeden erişim bekleniyor — bu ekranlar şimdilik **mock veriyle** UI olarak inşa edilecek, gerçek entegrasyon erişim sağlandığında yapılacak
- Ödeme gateway'i (iyzico/PayTR arası kesin seçim) gerçek ödeme entegrasyonu aşamasında netleştirilecek
- Nöbetçi eczane / hava durumu / hava kalitesi gibi dış veri kaynaklarının resmi API'leri (örn. İl Sağlık Müdürlüğü, meteoroloji) belirlenip entegre edilecek
- Belediyenin VERBİS kaydı ve hukuk biriminin KVKK aydınlatma metni onayı alınacak
- Admin panelini kimlerin (kaç kişi, hangi birimler) kullanacağı netleşince Bölüm 9'daki rol tablosu gerçek isim/birimlerle güncellenecek
