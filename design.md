> Bu dosya, Google Stitch (AI destekli UI tasarım aracı) için hazırlanmış tasarım direktifidir (Bölüm 1-6) ve Stitch'in ürettiği **"bel-app"** projesinden doğrulanmış nihai çıktının kaydıdır (Bölüm 7-8). Ürün gereksinimleri için bkz. `PRD.md`, sistem mimarisi için bkz. `architecture.md`, teknoloji detayları için bkz. `tech.md`.

# Kapaklı Belediyesi Mobil Uygulaması — Tasarım Direktifi

## 1. Genel Bakış

**Uygulama adı:** Kapaklı Belediyesi (T.C. Kapaklı Belediyesi resmi mobil uygulaması)
**Amaç:** Kapaklı ilçesi sakinlerinin belediye hizmetlerine (fatura ödeme, randevu, harita, duyuru vb.) tek bir mobil uygulama üzerinden hızlıca erişmesini sağlamak.
**Platform:** iOS ve Android — tek tasarım dili, mobil-first.
**Hedef kitle:** Kapaklı ilçesi sakinleri, geniş yaş aralığı (18-70+) — bu nedenle arayüz büyük dokunma alanlı, sade, az bilişsel yük gerektiren bir yapıda olmalı.

## 2. Marka Kimliği

Kaynak: [kapakli.bel.tr](https://www.kapakli.bel.tr/) resmi web sitesinden çıkarılmıştır.

**Logo:**
`https://www.kapakli.bel.tr/assets/spanel/img/kapakli_belediyesi_logo.png`

**Renk Paleti** (sitenin CSS dosyasından doğrulanmış gerçek hex kodları):

| Rol | Hex | Kullanım |
|---|---|---|
| Primary (Kurumsal Lacivert) | `#0D2236` | Başlıklar, ana butonlar, footer, aktif tab ikonu |
| Secondary (Belediye Mavisi) | `#278ACB` | Üst bar, linkler, ikincil vurgular, bilgi rozetleri |
| Accent (Vurgu Kırmızısı) | `#EF353A` | Öne çıkan CTA butonları (örn. "Fatura Öde", "Randevu Al") |
| Arkaplan | `#FDFDFD` / `#FFFFFF` | Sayfa arkaplanı |
| Metin | `#1A1A1A` civarı koyu gri/siyah | Gövde metni, okunabilirlik |
| Nötr gri | Açık gri tonlar | Kart arkaplanları, ayraçlar |

**Tipografi:** Sans-serif, temiz ve kurumsal (sistem fontu: iOS'ta SF Pro, Android'de Roboto/Inter tercih edilebilir). Başlıklar kalın (700), gövde metni normal (400).

**Görsel ton:** Kurumsal ama erişilebilir, güven veren, sade. Aşırı dekoratif öğelerden kaçın; devlet kurumu ciddiyetini koru ama sıcak/yardımsever bir his ver.

## 3. Navigasyon Yapısı — ZORUNLU KISITLAR

- **Dikey (vertical) kaydırma YOK.** Her ekran, ek scroll gerektirmeden tek ekrana (viewport) sığacak şekilde tasarlanmalı.
- **Yanal (horizontal) kaydırma YOK.** Swipe edilebilir carousel/slider kullanılmayacak.
- Uzun içerik listeleri (haberler, eczaneler, etkinlikler vb.) tek sayfada scroll ile değil; **grid/kart yapısı + "Tümünü Gör" butonuyla açılan ayrı bir alt ekran** ya da **sayfalama (pagination, sayfa noktaları/numaraları)** ile çözülmeli.
- Kullanıcılar farklı hizmet alanlarına **alt tab bar (bottom navigation bar)** üzerinden yönlendirilmeli — içerik keşfi scroll ile değil, sekme/kart tıklamasıyla yapılmalı.
- Referans uygulama: Konya Büyükşehir Belediyesi mobil uygulaması ([Play Store](https://play.google.com/store/apps/details?id=com.ikolmobil.konya)) — 4 sekmeli alt tab bar yapısı (Benim Şehrim / Akıllı Ulaşım / Belediyem / Keşfet), kart tabanlı hizmet grid'i, üstte hava durumu + arama widget'ı. Genel etkileşim mantığı (ikon + kart + tab bar) buradan esinlenilecek; marka kimliği tamamen Kapaklı Belediyesi'ne ait olacak (Bölüm 2).

### Tab Bar (5 sekme) — ✅ Stitch çıktısında doğrulandı

Stitch'in ürettiği "Ana Sayfa" ekranının gerçek HTML kodu indirilip incelendi; alt tab bar aşağıdaki şekilde birebir uygulanmış (React Native tarafında aynı ikon setiyle — `@expo/vector-icons` `MaterialIcons` — eşleştirilecek):

| # | Sekme | Material Symbol ikon adı | İçerik |
|---|---|---|---|
| 1 | **Ana Sayfa** | `home` | Hoş geldin, hava durumu/duyuru özeti, öne çıkan hizmetlere hızlı erişim kartları |
| 2 | **Hizmetler** | `apps` | Tüm belediye hizmetlerinin kategori grid'i (bkz. Bölüm 4) |
| 3 | **Harita** | `map` | Park/bahçe doluluk, tarihi yerler, nöbetçi eczane ve genişletilmiş POI katmanları arası segment kontrolü |
| 4 | **Duyurular** | `campaign` | Etkinlik tarihleri, haberler, hava kirliliği göstergesi (kart listesi + "Tümünü Gör") |
| 5 | **Profil** | `person` | Giriş/kayıt durumu, hesap bilgileri, ayarlar, "Hakkımızda" bağlantısı |

## 4. Hizmet Kategorileri (Hizmetler sekmesi içeriği)

- **Fatura Ödeme ve Kart Dolumu**
  - TESKİ Fatura Ödeme ve Kart Dolumu
  - GAZDAŞ Trakya Fatura Ödeme
  - TREPAŞ Fatura Ödeme
- **Haritalar**
  - Park Bahçeler Haritası + Doluluk Sistemi
  - Tarihi Yerler Haritası (QR kod ile web sitesine yönlendirme)
  - Nöbetçi Eczaneler (haritalandırma + iletişim + çalışma saatleri)
- **Randevu Sistemi**
  - Nikah Dairesi Randevusu
  - Spor Salonları Randevusu
- **Ulaşım**
  - Otobüsüm Nerede (takip / rota / fiyat / çalışma saatleri)
- **Çevre**
  - Hava Kirlilik Göstergesi
- **Duyuru & Etkinlik**
  - Etkinlik Tarihleri
- **Kurumsal**
  - Hakkımızda (Başkan, Kapaklı Tarihi, Nüfus Bilgileri)

Bu kategoriler Hizmetler sekmesinde ikon + başlık içeren kart grid'i (3 sütun veya 2 sütun) olarak gösterilmeli, tek ekrana sığacak şekilde gruplanmalı (gerekirse üst kısımda kategori filtre çubuğu ile).

## 5. Giriş (Login) Ekranı

- **Giriş zorunlu değil** — kullanıcı uygulamayı giriş yapmadan da kullanabilmeli.
- Uygulama açılışında bir **giriş ekranı gösterilmeli**, ancak ekranda belirgin bir **"Giriş yapmadan devam et" / "Misafir olarak devam et"** seçeneği bulunmalı.
- Giriş ekranı öğeleri: Logo, hoş geldin metni, T.C. Kimlik No / telefon / e-posta ile giriş alanı, şifre alanı, "Giriş Yap" butonu (Accent kırmızı `#EF353A` veya Primary lacivert `#0D2236`), "Hesabın yok mu? Kayıt Ol" linki, ve altta ayrı/ikincil buton olarak "Giriş yapmadan devam et".
- Giriş yapmanın faydası (randevu takibi, fatura geçmişi gibi) kısa bir alt metinle belirtilebilir, ama zorunluluk hissi yaratılmamalı.

## 6. Genel Tasarım İlkeleri

- Büyük dokunma hedefleri (min 44x44pt), yüksek kontrast, okunabilir font boyutları — geniş yaş aralığına uygun erişilebilirlik.
- Kart tabanlı bileşenler: yuvarlatılmış köşeler (8-12px radius), hafif gölge, ikon + kısa başlık.
- İkon dili: outline veya filled tutarlı bir set (örn. Material Symbols / Feather Icons tarzı), tüm uygulamada tek stil.
- Her sekme kendi içinde bağımsız ve scroll'suz tamamlanmalı; içerik sığmıyorsa alt/detay ekranına yönlendirme kullanılmalı, sekme içinde scroll'a izin verilmemeli.
- **Erişilebilirlik eki (bkz. `PRD.md` Bölüm 6):** Punto arttırma ve renk körlüğü desteği tüm ekranlarda geçerli olmalı; bilgi yalnızca renkle iletilmemeli, ikon/metin her zaman eşlik etmeli.

## 7. Onaylanmış Ekran Envanteri (Stitch "bel-app" Projesi — 30 Ekran)

Stitch MCP bağlantısı üzerinden `bel-app` projesi (`projects/683822339709873336`) sorgulanarak doğrulanmıştır. Aşağıdaki 30 ekran, tab bar'a göre gruplanmıştır ve React Native tarafında bire bir ekran/route karşılığı olacaktır.

| Tab | Ekranlar |
|---|---|
| **Giriş & Hesap** (Profil sekmesi altı) | Giriş Ekranı, Profil, Ayarlar, Hesap Bilgilerim |
| **Ana Sayfa / Navigasyon** | Ana Sayfa, Yan Menü (Navigasyon Çekmecesi) |
| **Harita** | Harita, Harita - Menü Açık |
| **Hizmetler** | Fatura Ödeme, Su Hizmetleri, Randevu Al, Yeni Talep Oluştur, Taleplerim, Formlar ve Dilekçeler, Engelli ve Yaşlı Hizmetleri, Hizmetler - Kaydırılabilir Liste |
| **Şehir & Yaşam** (Harita/Duyurular sekmeleri altında detay ekranları) | Ulaşım Hizmetleri, Nöbetçi Eczaneler, Hava Durumu Detay, Hava Kalitesi Detay, Wi-Fi Noktaları, Şehir Kameraları, Kent Lokantası |
| **Duyurular** | Duyurular, Haberler ve Etkinlikler, Meclis Kararları |
| **Kurumsal** (Profil sekmesi altı) | Hakkımızda, Bize Ulaşın, Vefat Edenler, Yardım Merkezi |

> Not: "Hizmetler - Kaydırılabilir Liste" ekranında istisnai olarak dikey scroll'a izin verilmiştir (kullanıcı onayı alınmıştır) — 30 hizmeti tek ekrana sığdırmak gerçekçi değildir; diğer tüm ekranlarda no-scroll kuralı geçerlidir.

## 8. Nihai Tasarım Tokenleri (Stitch Çıktısı — "Civic Horizon" Design System)

Stitch, Bölüm 1-6'daki direktife dayanarak kendi tasarım sistemini ("Civic Horizon") üretmiştir. Aşağıdaki tokenler, Bölüm 2'deki genel renk tablosunun **kod seviyesinde birebir karşılığıdır** — React Native tarafında `theme/` katmanında bu değerler doğrudan kullanılmalıdır (hardcoded hex yazılmamalı, bkz. `tech.md` Bölüm 4).

### Renkler (Material Design 3 tonal sistem)
```
primary: #000A18            on-primary: #FFFFFF
primary-container: #0D2236  on-primary-container: #768AA2
secondary: #006398          on-secondary: #FFFFFF
secondary-container: #64BAFE
tertiary: #1F0001           on-tertiary: #FFFFFF
tertiary-container: #4B0005 on-tertiary-container: #FC3F42
error: #BA1A1A               error-container: #FFDAD6
background: #FCF9F8          on-background: #1C1B1B
surface: #FCF9F8              surface-container-lowest: #FFFFFF (kart yüzeyi)
outline: #74777D               outline-variant: #C4C6CD
```

### Tipografi Skalası
| Stil | Font | Boyut | Ağırlık | Satır Yük. |
|---|---|---|---|---|
| display-lg | Inter | 32px | 700 | 40px |
| headline-md | Inter | 24px | 700 | 32px |
| headline-md-mobile | Inter | 22px | 700 | 28px |
| title-lg | Inter | 20px | 700 | 28px |
| title-md | Inter | 18px | 600 | 24px |
| body-lg | Inter | 16px | 400 | 24px |
| body-md | Inter | 14px | 400 | 20px |
| label-lg | Inter | 14px | 600 | 20px |
| label-sm | Inter | 12px | 500 | 16px |

### Spacing & Shape
```
container-margin: 1rem (16px)     stack-gap: 0.75rem (12px)
grid-gutter: 0.75rem (12px)        touch-target-min: 2.75rem (44px)
rounded (kart/input): 0.5rem (8px)  rounded-lg (buton): 1rem (16px)
```

### Gölge (Elevation)
- Kartlar: `0px offset-y, 4px blur, 0px spread, %6 opaklık siyah`
- Basılma (pressed) durumunda gölge kaybolur/azalır — dokunsal geri bildirim scroll olmadığı için önemli

> Ham `designMd` çıktısının tamamı (bileşen spesifikasyonları dahil) Stitch projesinde saklıdır; ihtiyaç halinde `mcp__stitch__get_project` ile tekrar çekilebilir.
