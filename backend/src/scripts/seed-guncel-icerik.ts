import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { HaberlerModule } from '../modules/haberler/haberler.module';
import { Haber, HaberDocument } from '../modules/haberler/schemas/haber.schema';
import { AnnouncementsModule } from '../modules/announcements/announcements.module';
import {
  Announcement,
  AnnouncementDocument,
} from '../modules/announcements/schemas/announcement.schema';
import { IlanlarModule } from '../modules/ilanlar/ilanlar.module';
import { Ilan, IlanDocument } from '../modules/ilanlar/schemas/ilan.schema';
import { IhalelerModule } from '../modules/ihaleler/ihaleler.module';
import { Ihale, IhaleDocument } from '../modules/ihaleler/schemas/ihale.schema';
import { MakalelerModule } from '../modules/makaleler/makaleler.module';
import { Makale, MakaleDocument } from '../modules/makaleler/schemas/makale.schema';
import { MeclisGundemleriModule } from '../modules/meclis-gundemleri/meclis-gundemleri.module';
import {
  MeclisGundemi,
  MeclisGundemiDocument,
} from '../modules/meclis-gundemleri/schemas/meclis-gundemi.schema';
import { MeclisKararlariModule } from '../modules/meclis-kararlari/meclis-kararlari.module';
import {
  MeclisKarari,
  MeclisKarariDocument,
} from '../modules/meclis-kararlari/schemas/meclis-karari.schema';
import { RolesModule } from '../modules/roles/roles.module';
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import '../admin/auth/session.types';

// kapakli.bel.tr'den cekilen gercek icerikle "Guncel" koleksiyonlarini
// geriye donuk 10'ar kayitla dolduran tek seferlik script (npm script'e
// eklenmedi, seed:admin/migrate:roles gibi dogrudan ts-node ile calistirilir).
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AdminUsersModule,
    RolesModule,
    HaberlerModule,
    AnnouncementsModule,
    IlanlarModule,
    IhalelerModule,
    MakalelerModule,
    MeclisGundemleriModule,
    MeclisKararlariModule,
  ],
})
class SeedModule {}

const SITE = 'https://www.kapakli.bel.tr';
const UPDATED_BY = 'içerik-aktarımı (kapakli.bel.tr)';

const AYLAR: Record<string, number> = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11,
};

// "25 Ağustos 2026" / "25 Ağustos 2026 14:28" / "06.07.2026 11:42" gibi
// formatlari Date'e cevirir.
function tarihCevir(metin: string): Date {
  const noktali = metin.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/,
  );
  if (noktali) {
    const [, gun, ay, yil, saat, dakika] = noktali;
    return new Date(
      Number(yil),
      Number(ay) - 1,
      Number(gun),
      saat ? Number(saat) : 0,
      dakika ? Number(dakika) : 0,
    );
  }
  const sozel = metin.match(
    /^(\d{1,2})\s+([A-Za-zİıŞşÇçĞğÖöÜü]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/,
  );
  if (sozel) {
    const [, gun, ayAdi, yil, saat, dakika] = sozel;
    const ay = AYLAR[ayAdi.toLocaleLowerCase('tr-TR')];
    if (ay === undefined) throw new Error(`Bilinmeyen ay adı: ${ayAdi}`);
    return new Date(
      Number(yil),
      ay,
      Number(gun),
      saat ? Number(saat) : 0,
      dakika ? Number(dakika) : 0,
    );
  }
  throw new Error(`Tarih ayrıştırılamadı: ${metin}`);
}

function url(path: string): string {
  return path.startsWith('http') ? path : `${SITE}${path}`;
}

interface MakaleyeBenzer {
  baslik: string;
  icerik: string;
  resimUrl?: string;
  dosyaUrl?: string;
  yayinTarihi: string;
}

const haberler: MakaleyeBenzer[] = [
  {
    baslik: "Kapaklı'da Mevlid-i Nebî Gecesi İdrak Edildi",
    icerik:
      'Kapaklı Belediyesi Kültür, Sanat ve Sosyal İşler Müdürlüğü tarafından Bülent Ecevit Parkı\'nda Mevlid-i Nebî gecesi dolayısıyla bir program düzenlendi. Programda Kur\'an-ı Kerim tilaveti ve Mevlid-i Şerif okundu, ilahiler ve şiirler seslendirildi. Üsküdar Paşabahçe Camii İmamı Hafız Adem Bilgetay, Kadıköy Osmanağa Camii İmamı Hafız Abdülkerim Ağcakaya ve Üsküdar Valide-i Atik Camii Müezzini Hafız Hüseyin Öksüz konuk hafız olarak katıldı.\n\nBaşkan Mustafa Çetin katılımcılara seslenerek, "Peygamber Efendimiz\'in bize bıraktığı en kıymetli miras güzel ahlak, merhamet, adalet ve kardeşliktir" dedi ve bu vesileyle küskünlüklerin sevgiye, ayrılıkların birlikteliğe, kaygıların huzura dönüşmesini diledi.\n\nYatsı ezanının ardından dualar edildi ve program sona erdi. Başkan, konuk hafızlara plaket takdim etti; Sosyal Hizmetler Müdürlüğü katılımcılara ikramda bulundu.',
    resimUrl:
      '/_uploads/photos/haberler/kapaklida-mevlid-i-nebi-gecesi-idrak-edildi_2_1787657265.JPG',
    yayinTarihi: '25 Ağustos 2026 14:28',
  },
  {
    baslik: "5. Kazak Gölü Festivali, 28-29-30 Ağustos'ta Gerçekleştirilecek",
    icerik:
      'Kapaklı Belediyesi, 5. Kazak Gölü Festivali\'ni 28-29-30 Ağustos 2026 tarihlerinde Kazak Gölü Rekreasyon Alanı\'nda düzenliyor. Üç gün sürecek etkinlikte konserler, spor aktiviteleri, atölyeler ve bir sünnet töreni yer alacak; gün boyunca sergi ve satış stantları da açık olacak.\n\nHer gün 14.00-17.00 saatleri arasında kına yakma, resim, anahtarlık yapımı, puzzle, yüz boyama, simli el işi ve ayraç yapımı atölyeleri düzenlenecek. 28 Ağustos Cuma günü ise 14.00-17.00 arasında bocce, basketbol atışları, dart ve bilek güreşi gibi spor müsabakaları yapılacak.\n\nFestivalin ilk günü sunucu Halil Bal\'ın interaktif gösterisiyle saat 20.00\'de başlayacak, ardından video gösterimleri yapılacak; saat 21.30\'da sahne alacak Ali Kınık ile devam edecek. İkinci günün öne çıkanı, Kapaklı Pınar Camii\'nde düzenlenecek 21. Geleneksel Sünnet Töreni olacak; 17.30-19.00 arası fotoğraf çekimi, çocuk eğlenceleri, maskot etkinlikleri ve tren turları yapılacak, saat 19.00\'da resmi geçit başlayacak, ardından kına yakma töreni ve saat 21.30\'da Hasan Yılmaz konseri olacak.\n\nSon gün 14.00-17.00 arası atölye ve spor etkinliklerinin yanı sıra saat 18.45\'te Belediye binasından Kazak Gölü\'ne 30 Ağustos Zafer Koşusu başlayacak. Başkan Mustafa Çetin\'in konuşmasının ardından saat 21.15\'te Norm Ender sahne alacak.',
    resimUrl:
      '/_uploads/photos/haberler/5-kazak-golu-festivali-28-29-30-agustosta-gerceklestirilecek_2_1787219599.jpeg',
    yayinTarihi: '20 Ağustos 2026 11:16',
  },
  {
    baslik: 'Kapaklı Genelinde Sıcak Asfalt Yol Çalışmaları Devam Ediyor',
    icerik:
      'Kapaklı Belediyesi Fen İşleri Müdürlüğü, ilçe genelinde yol ağını güçlendirmek amacıyla sıcak asfalt çalışmalarını kesintisiz sürdürüyor. Son üç ayda toplam 12.961 ton asfalt, birçok cadde ve sokağa serilerek daha güvenli, konforlu ve modern bir görünüm kazandırdı.\n\nÜç ayda 12.961 ton sıcak asfalt kaplama ve yol yapım çalışması tamamlandı, bozulmuş yolların onarımı için ise 1.907 ton asfalt yama çalışması yapıldı.\n\nÇalışmaları yerinde inceleyen Başkan Mustafa Çetin, "Ekiplerimiz vatandaşlarımıza daha güvenli ve konforlu ulaşım imkânı sunmak için ilçemizin dört bir yanında aralıksız çalışıyor. Bugün Atatürk Mahallesi\'nde asfalt serim çalışmalarına devam ediyoruz. Bozulan yol ağımızı iyileştiriyoruz, yaz boyunca birçok cadde ve sokakta çalışmalarımız sürecek. Kapaklımız en iyisini hak ediyor. Çalışma süresince sabır rica ediyor, hasarlı yolları bize bildirmelerini istiyoruz" dedi.',
    resimUrl:
      '/_uploads/photos/haberler/kapakli-genelinde-sicak-asfalt-yol-calismalari-devam-ediyor_2_1785841616.JPG',
    yayinTarihi: '4 Ağustos 2026 14:07',
  },
  {
    baslik:
      "Kapaklı Belediyesi Yaz Spor Okulları'nda 2 Bin 500 Öğrenci Sertifikalarını Aldı",
    icerik:
      'Kapaklı Belediyesi\'nin geleneksel Yaz Spor Okulları, bu yıl eğitimlerini tamamlayan 2.500 öğrenciye düzenlenen sertifika töreniyle sona erdi. Program, Atatürk Kültür Merkezi\'nde katılımcı çocukların dans gösterileriyle başladı; sahne performansları izleyicilerden büyük alkış aldı.\n\nBaşkan Mustafa Çetin konuşmasında, yaz spor programlarının çocukların sportif yeteneklerinin yanı sıra özgüven, disiplin ve sosyal becerilerini de geliştirdiğini belirtti. Çocuklarını yaz boyunca sporla buluşturan ailelere ve emeği geçen tüm eğitmenlere teşekkür ederek, "Gençlerimizin gelişimine katkı sağlayacak sportif, kültürel ve sosyal çalışmalarımızı sürdüreceğiz" dedi.\n\nKonuşmaların ardından çeşitli spor branşlarında eğitim alan 2.500 öğrenciye başarı sertifikaları dağıtıldı. Etkinlik, öğrenciler, aileler ve eğitmenlerin bir arada yer aldığı toplu fotoğraf çekimiyle sona erdi.',
    resimUrl:
      '/_uploads/photos/haberler/kapakli-belediyesi-yaz-spor-okullarinda-2-bin-500-ogrenci-sertifikalarini-aldi_2_1785507125.JPG',
    yayinTarihi: '31 Temmuz 2026 17:12',
  },
  {
    baslik:
      '"Ay Işığında Sinema Geceleri" Etkinliği Yaz Akşamlarına Renk Katıyor',
    icerik:
      'Kapaklı Belediyesi Kültür, Sanat ve Sosyal İşler Müdürlüğü tarafından düzenlenen "Ay Işığında Sinema Geceleri" etkinliği, yaz akşamlarında vatandaşları açık hava sinema gösterimlerinde buluşturmaya devam ediyor. İlçenin farklı mahallelerinde gerçekleştirilen gösterimlere çocuklardan yetişkinlere geniş bir katılım oldu.\n\n"Aile", "Mavi Boncuk", "Aya Sihirli Bir Yolculuk" ve "Kardeş Ayı: Hop, Ayılar Küçüldü" gibi film ve animasyonlar farklı mekanlarda izleyiciyle buluştu; aileler çocuklarıyla birlikte keyifli yaz akşamları geçirdi. İsmetpaşa Mahallesi\'ndeki etkinlikte çocuklar, Namık Kemal Halk Kütüphanesi\'nin gezici kütüphane otobüsüyle kitaplarla buluşup renkli etkinliklere katıldı.\n\nGösterim noktalarında katılımcılara patlamış mısır ikram edilirken, gezici ikram aracıyla sıcak ve soğuk içecekler sunuldu.\n\nSerinin devamında 28 Temmuz\'da Pınarça, 30 Temmuz\'da ise Karlı mahallesinde saat 21.00\'de gösterimler yapılacak; tüm vatandaşlar etkinliğe davet edildi.',
    resimUrl:
      '/_uploads/photos/haberler/ay-isiginda-sinema-geceleri-etkinligi-yaz-aksamlarina-renk-katiyor_2_1784812522.JPG',
    yayinTarihi: '23 Temmuz 2026 16:15',
  },
  {
    baslik: "Kapaklı'da Sıcak Asfalt Mesaisi Sürüyor",
    icerik:
      'Kapaklı Belediyesi Fen İşleri Müdürlüğü, ulaşım konforunu artırmak ve yol ağını güçlendirmek amacıyla ilçe genelinde sıcak asfalt çalışmalarını kesintisiz sürdürüyor. Son iki ayda toplam 10.602 ton asfalt kullanılarak birçok cadde ve sokak yenilendi.\n\nSon iki ayda 9.136 ton sıcak asfalt serim ve yol yapım çalışması tamamlandı; ayrıca gerekli görülen noktalarda bozulan yolların onarımı için 1.466 ton asfalt yama çalışması yapıldı.\n\nKarşıyaka Caddesi, Muammer Aksoy Caddesi ile Gülbeyaz, Kültür, Kardelen, Zambak ve 57 numaralı sokak dahil birçok sokakta çalışmalar tamamlandı.\n\nBaşkan Mustafa Çetin, "Ekiplerimiz tüm mahallelerimizde kesintisiz çalışmalarını sürdürüyor. İki ayda 10.602 ton asfalt kullanarak birçok sokağımızı yeniledik. Yama çalışmalarıyla yolların ömrünü uzatırken ulaşım konforunu da artırıyoruz" dedi.',
    resimUrl:
      '/_uploads/photos/haberler/kapaklida-sicak-asfalt-mesaisi-suruyor_2_1784799413.JPG',
    yayinTarihi: '23 Temmuz 2026 12:36',
  },
  {
    baslik:
      "Kapaklı'da 15 Temmuz Demokrasi ve Milli Birlik Günü'nün 10. Yıl Dönümü Anıldı",
    icerik:
      'Kapaklı\'da 15 Temmuz Demokrasi ve Milli Birlik Günü\'nün 10. yıl dönümü, "İradem Zaferim" temasıyla gün boyu süren etkinliklerle anıldı. Çeşitli törenlerle 2016 darbe girişiminin şehitleri anılırken milli birlik ve beraberlik vurgulandı.\n\nAnma programı, belediye meydanında açılan 15 Temmuz temalı resim ve fotoğraf sergisiyle başladı. Saygı duruşu ve İstiklal Marşı\'nın ardından Kaymakam ve Belediye Başkanı ile birlikte katılımcılar, o geceye ait demokrasi direnişini yansıtan eserleri gezdi.\n\nYetkililer, 2016 darbe girişiminde şehit düşen Kadir Dadaş, Emrah Çalkın ve Rıdvan Sağdıç\'ın anıldığı Karaağaç Mezarlığı\'nı ziyaret etti; kabirleri başında Kur\'an-ı Kerim okunup dua edildi. Mevlana Camii\'nde şehitler için mevlid okutuldu.\n\nBaşkan Mustafa Çetin, "Milletimiz o tarihi gecede demokrasiye, bağımsızlığa ve milli iradeye olan bağlılığını gösterdi. Milyonlar hain ellerin yönetimi ele geçirmesine izin vermemek için birlik oldu" dedi. Başkan, güçlü bir geleceğin ancak birlik, dayanışma ve dayanışmayla inşa edilebileceğini vurgulayarak Kapaklı\'nın çok kültürlü uyumunu birlikte yaşamaya örnek gösterdi.\n\nAsıl anma töreni, geniş bir vatandaş katılımıyla Bülent Ecevit Parkı\'nda gerçekleşti. Cumhurbaşkanı Recep Tayyip Erdoğan\'ın konuşması canlı olarak izlendi. Öğrenciler şiir ve ilahiler okudu, İlçe Müftüsü gaziler ve milli birlik için dua etti. Program, tüm camilerden okunan sala ile saat 00.13\'te sona erdi.',
    resimUrl:
      '/_uploads/photos/haberler/kapaklida-15-temmuz-demokrasi-ve-milli-birlik-gununun-10-yil-donumu-anildi_2_1784191269.JPG',
    yayinTarihi: '16 Temmuz 2026 11:41',
  },
  {
    baslik: "Başkan Çetin, LGS Türkiye Birincisi Zeynep Simay Öztürk'ü Ağırladı",
    icerik:
      'Kapaklı Belediye Başkanı Mustafa Çetin, 2026 Liselere Geçiş Sınavı\'nda (LGS) 500 tam puan alarak Türkiye birincisi olan Yıldızkent Ortaokulu öğrencisi Zeynep Simay Öztürk\'ü makamında ağırladı.\n\nGörüşmeye İlçe Milli Eğitim Müdürü Halil Vardı ve okul müdürü Sezgin Kocabıyık da katıldı. Başkan Çetin, öğrenciyi ve ailesini tebrik ederek emeği geçen öğretmenlere ve herkese teşekkür etti.\n\nBaşkan, görüşmenin ardından yaptığı açıklamada şunları söyledi: "Azmi, disiplini ve başarısıyla örnek olan kıymetli evladımızı içtenlikle tebrik ediyorum. Ailesine, öğretmenlerine ve bu başarıya emek veren herkese en içten dileklerimi sunuyorum. Başarılarının hayatı boyunca devam etmesini ve milletimize daha nice gurur anları yaşatmasını diliyorum."',
    resimUrl:
      '/_uploads/photos/haberler/baskan-cetin-lgs-turkiye-birincisi-zeynep-simay-ozturku-agirladi_2_1784037190.jpeg',
    yayinTarihi: '14 Temmuz 2026 16:53',
  },
  {
    baslik: 'Kapaklı ile Havza Kardeş Belediye Oldu',
    icerik:
      'Kapaklı ve Havza belediyeleri, iki ilçe arasındaki dostluk ve iş birliğini güçlendirmek amacıyla Kardeş Şehir Protokolü imzaladı. Protokolü Kapaklı Belediye Başkanı Mustafa Çetin ile Havza Belediye Başkanı Av. Murat İkiz imzaladı.\n\nBaşkan Çetin, kardeş şehir girişiminin Havza Belediye Başkanı\'nın Kapaklı\'yı ziyareti sırasında ortaya çıktığını belirterek, "İlçemiz ile Havza arasındaki gönül bağı, bu kardeşlik adımıyla daha da güçlenecek" dedi.\n\nProtokol kapsamında iki belediye eğitim, kültür, turizm, şehircilik, çevre koruma, sosyal hizmetler, gençlik ve spor alanlarında iş birliği yapacak. Anlaşma, ortak projeler geliştirmeyi, bilgi ve deneyim paylaşımını artırmayı, yerel yönetimler arası iş birliğini güçlendirmeyi ve iki ilçe arasındaki kalıcı dostluğu pekiştirmeyi amaçlıyor.\n\nProtokol, Havza Belediye Meclisi\'nin 6 Ekim 2025 tarih ve 43 sayılı kararı ile Kapaklı Belediye Meclisi\'nin 7 Kasım 2025 tarih ve 107 sayılı kararıyla kabul edildi.\n\nBaşkan İkiz, kardeş şehir protokolünün her iki belediyeye de fayda sağlayacağına inandığını belirterek iş birliğinin ortaklıklarını daha da geliştireceğini umduğunu ifade etti.',
    resimUrl:
      '/_uploads/photos/haberler/kapakli-ile-havza-kardes-belediye-oldu_2_1784036994.jpeg',
    yayinTarihi: '14 Temmuz 2026 16:49',
  },
  {
    baslik: 'Başkan Çetin, Üstyapı ve Altyapı Çalışmalarını İnceledi',
    icerik:
      'Başkan Mustafa Çetin, ilçe genelinde süren altyapı ve üstyapı çalışmalarını yerinde inceleyerek ekiplerle bir araya geldi. Fen İşleri Müdürlüğü, beton yol yapımı, dere ıslahı ve yağmursuyu hattı çalışmalarını yürütüyor.\n\nAtatürk Mahallesi Aşıklar ve Hafızlar sokaklarında dere ıslahı çalışması sürüyor; çalışma tamamlandığında mevcut parklar genişleyerek vatandaşların kullanımına yeni yeşil alanlar kazandıracak.\n\nÖmer Halisdemir Mahallesi\'nde beton yol çalışmaları devam ediyor. Başkan, "yeni yerleşim alanlarında ulaşım konforunu artırmak için kesintisiz çalışıyoruz" dedi. Safa, Moda, Atasever ve diğer sokaklar dahil on iki sokakta beton yol tamamlanarak hizmete açıldı.\n\n19 Mayıs Mahallesi İrem ve Misket sokaklarında yağmursuyu hattı çalışmaları sürüyor. Başkan, "2019\'dan bu yana daha güvenli ve konforlu koşullar oluşturmak için yağmursuyu altyapı yatırımlarına öncelik veriyoruz" dedi. Son dönemde on iki sokakta çalışmalar tamamlandı, ana caddelerde çalışmalar devam ediyor.\n\nBaşkan sözlerini şöyle tamamladı: "Bugünü ve geleceği planlayarak, vatandaşlarımıza daha güvenli, konforlu ve modern bir kent yaşamı sunmak için sistematik altyapı yatırımlarımızı sürdürüyoruz."',
    resimUrl:
      '/_uploads/photos/haberler/baskan-cetin-ustyapi-ve-altyapi-calismalarini-inceledi_2_1783605141.JPG',
    yayinTarihi: '9 Temmuz 2026 16:52',
  },
];

const duyurular: (MakaleyeBenzer & { kategori: string })[] = [
  {
    baslik: 'MİMAR SİNAN MAHALLESİ 785 ADA 6 PARSEL ÇED DUYURU ASKI İLANI HAKKINDA',
    icerik:
      'Mimar Sinan Mahallesi, 785 Ada 6 Parsel ile ilgili Çevresel Etki Değerlendirmesi (ÇED) duyuru askı ilanı yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl:
      '/_uploads/photos/duyurular/mimar-sinan-mahallesi-785-ada-6-parsel-ced-duyuru-aski-ilani-hakkinda_1786973621.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/mimar-sinan-mahallesi-785-ada-6-parsel-ced-duyuru-aski-ilani-hakkinda_1786973623.pdf',
    yayinTarihi: '17 Ağustos 2026 16:33',
  },
  {
    baslik: 'ÇED RAPORU DUYURUSU HAKKINDA',
    icerik:
      'Çevresel Etki Değerlendirmesi (ÇED) raporuna ilişkin duyuru yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl: '/_uploads/photos/duyurular/ced-raporu-duyurusu-hakkinda_1786426290.jpg',
    dosyaUrl: '/_uploads/docs/duyurular/ced-raporu-duyurusu-hakkinda_1786426291.pdf',
    yayinTarihi: '11 Ağustos 2026 08:31',
  },
  {
    baslik:
      'Trakya Alt Bölgesi Ergene Havzası1/100.000 Ölçekli Revizyon ÇDP Değişikliği',
    icerik:
      'Trakya Alt Bölgesi Ergene Havzası 1/100.000 ölçekli revizyon Çevre Düzeni Planı (ÇDP) değişikliğine ilişkin duyuru yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl:
      '/_uploads/photos/duyurular/trakya-alt-bolgesi-ergene-havzasi1100000-olcekli-revizyon-cdp-degisikligi_1784208357.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/trakya-alt-bolgesi-ergene-havzasi1100000-olcekli-revizyon-cdp-degisikligi_1784210509.pdf',
    yayinTarihi: '16 Temmuz 2026 16:25',
  },
  {
    baslik: 'ÇED DUYURUSU HAKKINDA',
    icerik:
      'Çevresel Etki Değerlendirmesi (ÇED) hakkında duyuru yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    dosyaUrl: '/_uploads/docs/duyurular/ced-duyurusu-hakkinda_1783324310.pdf',
    yayinTarihi: '06 Temmuz 2026 10:51',
  },
  {
    baslik: 'PERFORMANS ÖLÇÜTLERİ BELİRLEME VE DEĞERLENDİRME YÖNETMELİĞİ',
    icerik:
      'Performans ölçütleri belirleme ve değerlendirme yönetmeliği yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl:
      '/_uploads/photos/duyurular/performans-olcutleri-belirleme-ve-degerlendirme-yonetmeligi_1781158199.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/performans-olcutleri-belirleme-ve-degerlendirme-yonetmeligi_1781158158.docx',
    yayinTarihi: '11 Haziran 2026 09:09',
  },
  {
    baslik: 'KARAAĞAÇ MAHALLESİ 768 ADA 19 PARSEL ÇED OLUMLU KARARI ASKI İLANI',
    icerik:
      'Karaağaç Mahallesi, 768 Ada 19 Parsel için verilen ÇED olumlu kararına ilişkin askı ilanı yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl:
      '/_uploads/photos/duyurular/karaagac-mahallesi-768-ada-19-parsel-ced-olumlu-karari-aski-ilani_1777905404.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/karaagac-mahallesi-768-ada-19-parsel-ced-olumlu-karari-aski-ilani_1778070748.pdf',
    yayinTarihi: '04 Mayıs 2026 17:35',
  },
  {
    baslik:
      'TRAKYA ALT BÖLGESİ ERGENE HAVZASI 1/100.000 ÖLÇEKLİ REVİZYON ÇEVRE DÜZENİ PLANI DEĞİŞİKLİĞİ ASKI İLANI HAKKINDA',
    icerik:
      'Trakya Alt Bölgesi Ergene Havzası 1/100.000 ölçekli revizyon Çevre Düzeni Planı değişikliği askı ilanı yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl:
      '/_uploads/photos/duyurular/trakya-alt-bolgesi-ergene-havzasi-1100000-olcekli-revizyon-cevre-duzeni-plani-degisikligi-aski-ilani-hakkinda_1776157103.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/trakya-alt-bolgesi-ergene-havzasi-1100000-olcekli-revizyon-cevre-duzeni-plani-degisikligi-aski-ilani-hakkinda_1776157104.rar',
    yayinTarihi: '14 Nisan 2026 11:58',
  },
  {
    baslik: 'KAPAKLI BAHÇEAĞIL RES VE ELEKTRİK DEPOLAMA TESİSİ ASKI İLANI HAKKINDA',
    icerik:
      'Kapaklı İlçesi Bahçeağıl RES (6 adet türbin / 34,20 MWm-30,00 MWe) ve elektrik depolama tesisi askı ilanı yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl: '/_uploads/photos/duyurular/duyuru_1776144463.jpg',
    dosyaUrl:
      '/_uploads/docs/duyurular/kapakli-bahceagil-res-ve-elektrik-depolama-tesisi-aski-ilani-hakkinda_1777367777.rar',
    yayinTarihi: '14 Nisan 2026 08:27',
  },
  {
    baslik: 'ÇED RAPORU HAKKINDA',
    icerik:
      'Çevresel Etki Değerlendirmesi (ÇED) raporu hakkında duyuru yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl: '/_uploads/photos/duyurular/ced-raporu-hakkinda_1770705773.jpg',
    dosyaUrl: '/_uploads/docs/duyurular/ced-raporu-hakkinda_1770705736.pdf',
    yayinTarihi: '10 Şubat 2026 09:42',
  },
  {
    baslik: 'HALKIN DUYURUSU',
    icerik: 'Halkın duyurusu yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    kategori: 'Duyuru',
    resimUrl: '/_uploads/photos/duyurular/halkin-duyurusu_1770384332.jpg',
    dosyaUrl: '/_uploads/docs/duyurular/halkin-duyurusu_1770384334.pdf',
    yayinTarihi: '06 Şubat 2026 16:25',
  },
];

const ilanlar: MakaleyeBenzer[] = [
  {
    baslik: '589 Ada 1 Parsel 1/5000 Ölçekli Koruma Amaçlı Nazım İmar Planı Değişikliği',
    icerik:
      '589 Ada 1 Parsel için 1/5000 ölçekli Koruma Amaçlı Nazım İmar Planı değişikliğine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    dosyaUrl:
      '/_uploads/docs/ilanlar/589-ada-1-parsel-15000-olcekli-koruma-amacli-nazim-imar-plani-degisikligi_1785309322.pdf',
    yayinTarihi: '29 Temmuz 2026 10:15',
  },
  {
    baslik: '1/1000 Ölçekli Uygulama İmar Planı Değişikliği',
    icerik:
      'Atatürk Mahallesi, 2096 Ada 2 Parsel 1/5000 ölçekli Nazım İmar Planı değişikliği ve 1/1000 ölçekli Uygulama İmar Planı değişikliğine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    dosyaUrl:
      '/_uploads/docs/ilanlar/11000-olcekli-uygulama-imar-plani-degisikligi_1785223264.pdf',
    yayinTarihi: '28 Temmuz 2026 10:21',
  },
  {
    baslik: 'Kapaklı 1/1000 Ölçekli Revizyon İmar Planı Notu Değişikliği',
    icerik:
      'Kapaklı 1/1000 ölçekli revizyon imar planı notu değişikliğine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    dosyaUrl:
      '/_uploads/docs/ilanlar/kapakli-11000-olcekli-revizyon-imar-plani-notu-degisikligi_1784901355.pdf',
    yayinTarihi: '24 Temmuz 2026 16:55',
  },
  {
    baslik: 'SARAY BELEDİYESİ KİRALAMA İHALE İLANI',
    icerik:
      'Saray Belediyesi tarafından yapılacak kiralama ihalesine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl: '/_uploads/photos/ilanlar/saray-belediyesi-kiralama-ihale-ilani_1783576152.jpg',
    dosyaUrl: '/_uploads/docs/ilanlar/saray-belediyesi-kiralama-ihale-ilani_1783576154.docx',
    yayinTarihi: '09 Temmuz 2026 08:49',
  },
  {
    baslik: 'UYGULAMALI İMAR PLAN DEĞİŞİKLİĞİ İLANI',
    icerik:
      'Uygulamalı imar plan değişikliklerine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    dosyaUrl: '/_uploads/docs/ilanlar/uygulamali-imar-plan-degisikligi-ilani_1778673502.pdf',
    yayinTarihi: '13 Mayıs 2026 14:58',
  },
  {
    baslik:
      'MEVLANA MAHALLESİ 2096 ADA 2 PARSEL 1/5000 VE 1/1000 İMAR PLAN DEĞİŞİKLİĞİ HAKKINDA',
    icerik:
      'Mevlana Mahallesi, 2096 Ada 2 Parsel için 1/5000 ve 1/1000 ölçekli imar plan değişikliğine ilişkin ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl:
      '/_uploads/photos/ilanlar/mevlana-mahallesi-2096-ada-2-parsel-15000-ve-11000-imar-plan-degisikligi-hakkinda_1777443096.jpg',
    dosyaUrl:
      '/_uploads/docs/ilanlar/mevlana-mahallesi-2096-ada-2-parsel-15000-ve-11000-imar-plan-degisikligi-hakkinda_1777443097.rar',
    yayinTarihi: '29 Nisan 2026 09:11',
  },
  {
    baslik: 'KARAAĞAÇ 331 ADA 6 PARSEL VE 331 ADA 17 PARSEL HAKKINDA ASKI İLANI',
    icerik:
      'Karaağaç 331 Ada 6 Parsel ve 331 Ada 17 Parsel hakkında askı ilanı yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl:
      '/_uploads/photos/ilanlar/karaagac-331-ada-6-parsel-ve-331-ada-17-parsel-hakkinda-aski-ilani_1776868787.jpg',
    dosyaUrl:
      '/_uploads/docs/ilanlar/karaagac-331-ada-6-parsel-ve-331-ada-17-parsel-hakkinda-aski-ilani_1776868788.rar',
    yayinTarihi: '22 Nisan 2026 17:39',
  },
  {
    baslik: 'BİNA VE KENTSEL DÖNÜŞÜM AMAÇLI UYGULAMA İMAR NOTLARI HAKKINDA',
    icerik:
      'Bina ve kentsel dönüşüm amaçlı uygulama imar notları hakkında ilan yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl:
      '/_uploads/photos/ilanlar/bina-ve-kentsel-donusum-amacli-uygulama-imar-notlari-hakkinda_1774331925.jpg',
    dosyaUrl:
      '/_uploads/docs/ilanlar/bina-ve-kentsel-donusum-amacli-uygulama-imar-notlari-hakkinda_1774331927.rar',
    yayinTarihi: '24 Mart 2026 08:58',
  },
  {
    baslik: 'İLAN OLUNUR',
    icerik: 'İlan olunur. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl: '/_uploads/photos/ilanlar/ilan-olunur_1771938978.jpg',
    dosyaUrl: '/_uploads/docs/ilanlar/ilan-olunur_1771938979.rar',
    yayinTarihi: '24 Şubat 2026 16:16',
  },
  {
    baslik: 'YANIKAĞIL MAHALLESİ 152 ADA 46 PARSELE İLİŞKİN İMAR PLANI HAKKINDA',
    icerik:
      'Yanıkağıl Mahallesi, 152 Ada 46 Parsele ilişkin imar planı hakkında ilan olunur, meclis kararı ve plan açıklama raporu yayımlanmıştır. Detaylı bilgi için ekteki belgeyi inceleyiniz.',
    resimUrl:
      '/_uploads/photos/ilanlar/yanikagil-mahallesi-152-ada-46-parsele-iliskin-imar-plani-hakkinda_1771938702.jpg',
    dosyaUrl:
      '/_uploads/docs/ilanlar/yanikagil-mahallesi-152-ada-46-parsele-iliskin-imar-plani-hakkinda_1771938703.rar',
    yayinTarihi: '24 Şubat 2026 16:11',
  },
];

const ihaleler: MakaleyeBenzer[] = [
  {
    baslik:
      'GİYSİ VE TEKSTİL ATIKLARININ GERİ KAZANIMI AMACIYLA KUMBARA YERLERİ KİRALAMA İŞİ İHALE İLANI',
    icerik:
      'Kapaklı Belediyesi mücavir alan sınırları içerisinde giysi ve tekstil atıklarının kaynağında ayrı toplanması, taşınması ve geri kazanımının sağlanması amacıyla belediyenin hüküm ve tasarrufunda bulunan 100 adet kumbara yerinin kiralama işidir. İhale, 04.09.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda Açık Teklif Usulü ile İklim Değişikliği ve Sıfır Atık Müdürlüğü tarafından gerçekleştirilecektir.',
    dosyaUrl:
      '/_uploads/docs/ihaleler/giysi-ve-tekstil-atiklarinin-geri-kazanimi-amaciyla-kumbara-yerleri-kiralama-isi-ihale-ilani_1787300384.pdf',
    yayinTarihi: '21 Ağustos 2026 11:19',
  },
  {
    baslik: 'GIDA PAKETİ VE ÇÖLYAK GIDA PAKETİ',
    icerik:
      'Gıda Paketi ve Çölyak Gıda Paketi mal alımı, 4734 sayılı Kamu İhale Kanunu\'nun 19. maddesine göre açık ihale usulü ile Destek Hizmetleri Müdürlüğü tarafından gerçekleştirilecektir. İhale, 17.02.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı İnönü Mah. Eski Cami Caddesi No:4-6 Kat:9 İhale Komisyon Odası\'nda yapılacaktır.',
    dosyaUrl: '/_uploads/docs/ihaleler/gida-paketi-ve-colyak-gida-paketi_1769431948.docx',
    yayinTarihi: '26 Ocak 2026 15:52',
  },
  {
    baslik: 'KAPAKLI BİLİM MERKEZİ ATÖLYE SARF VE TEKNİK MALZEME MAL ALIMI',
    icerik:
      'Kapaklı Bilim Merkezi Atölye Sarf ve Teknik Malzeme mal alımı, 4734 sayılı Kamu İhale Kanunu\'nun 19. maddesine göre açık ihale usulü ile Bilgi İşlem Müdürlüğü tarafından gerçekleştirilecektir. İhale, 01.09.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda yapılacaktır.',
    dosyaUrl:
      '/_uploads/docs/ihaleler/kapakli-bilim-merkezi-atolye-sarf-ve-teknik-malzeme-mal-alimi_1786351367.docx',
    yayinTarihi: '10 Ağustos 2026 11:42',
  },
  {
    baslik: 'LED AYDINLATMA TESİSİ',
    icerik:
      'İlçe sınırlarında bulunan Çerkezköy-Saray yolu üzerinde 19+350 - 22+300 km\'leri arasında elektrik tesisatı altyapısı yapım işi ve idare malı LED armatürlü dekoratif aydınlatma direklerinin dikilmesi işine ilişkin ihale, 10.12.2025 saat 10.00\'da Kapaklı Belediye Başkanlığı İnönü Mah. Eski Cami Caddesi No:4-6 Kat:9 İhale Komisyon Odası\'nda yapılacaktır.',
    dosyaUrl: '/_uploads/docs/ihaleler/led-aydinlatma-tesisi_1762781342.docx',
    yayinTarihi: '10 Kasım 2025 19:29',
  },
  {
    baslik:
      'GİYSİ VE TEKSTİL ATIKLARININ GERİ KAZANIMI AMACIYLA KUMBARA YERLERİ KİRALAMA İŞİ İHALE İLANI (Haziran 2026)',
    icerik:
      'Kapaklı Belediyesi mücavir alan sınırları içerisinde giysi ve tekstil atıklarının kaynağında ayrı toplanması, taşınması ve geri kazanımının sağlanması amacıyla belediyenin hüküm ve tasarrufunda bulunan 100 adet kumbara yerinin kiralama işidir. İhale, 17.07.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda Açık Teklif Usulü ile İklim Değişikliği ve Sıfır Atık Müdürlüğü tarafından gerçekleştirilecektir.',
    dosyaUrl:
      '/_uploads/docs/ihaleler/giysi-ve-tekstil-atiklarinin-geri-kazanimi-amaciyla-kumbara-yerleri-kiralama-isi-ihale-ilani_1782366255.pdf',
    yayinTarihi: '25 Haziran 2026 08:44',
  },
  {
    baslik: 'ARAÇ KİRALAMA',
    icerik:
      'Araç kiralama işine ilişkin ihale, 23.10.2025 saat 10.00\'da Kapaklı Belediye Başkanlığı İnönü Mah. Eski Cami Caddesi No:4-6 Kat:9 İhale Komisyon Odası\'nda Destek Hizmetleri Müdürlüğü tarafından gerçekleştirilecektir.',
    dosyaUrl: 'https://kapakli.bel.tr/_uploads/docs/ihaleler/arac-kiralama_1758606060.docx',
    yayinTarihi: '23 Eylül 2025 11:41',
  },
  {
    baslik: 'TAŞINMAZ KİRALAMA İLANI',
    icerik:
      'Mülkiyeti belediyeye ait tarla, işyeri, büfe, ofis, halı saha ve tesis binası, 2886 sayılı Devlet İhale Kanunu\'nun 45. maddesi gereğince açık teklif usulü ile 10 yıllığına ihale edilecek olup tarlalar tarım arazisi olarak kullanılmak üzere kiraya verilecektir. İhale, 10.07.2026 saat 09.30\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda Emlak ve İstimlak Müdürlüğü tarafından gerçekleştirilecektir.',
    dosyaUrl: '/_uploads/docs/ihaleler/tasinmaz-kiralama-ilani_1782193138.docx',
    yayinTarihi: '23 Haziran 2026 08:38',
  },
  {
    baslik: '2026 Yılı Parklarda ve Yeşil Alanlarda Kullanılmak Üzere Muhtelif Mal',
    icerik:
      '2026 yılı parklarda ve yeşil alanlarda kullanılmak üzere muhtelif mal alımı, 4734 sayılı Kamu İhale Kanunu\'nun 19. maddesine göre açık ihale usulü ile Park ve Bahçeler Müdürlüğü tarafından gerçekleştirilecektir. İhale, 10.06.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda yapılacaktır.',
    dosyaUrl:
      '/_uploads/docs/ihaleler/2026-yili-parklarda-ve-yesil-alanlarda-kullanilmak-uzere-muhtelif-mal_1780911439.docx',
    yayinTarihi: '08 Haziran 2026 12:37',
  },
  {
    baslik: 'KAPAKLI BİLİM MERKEZİ TEFRİŞAT MALZEMELERİ MAL ALIMI',
    icerik:
      'Kapaklı Bilim Merkezi Tefrişat Malzemeleri mal alımı, 4734 sayılı Kamu İhale Kanunu\'nun 19. maddesine göre açık ihale usulü ile Destek Hizmetleri Müdürlüğü tarafından gerçekleştirilecektir. İhale, 06.07.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda yapılacaktır.',
    resimUrl:
      '/_uploads/photos/ihaleler/kapakli-bilim-merkezi-tefrisat-malzemeleri-mal-alimi_1780907118.jpg',
    dosyaUrl:
      '/_uploads/docs/ihaleler/kapakli-bilim-merkezi-tefrisat-malzemeleri-mal-alimi_1780907120.docx',
    yayinTarihi: '08 Haziran 2026 11:25',
  },
  {
    baslik: 'MUHTELİF ELEKTRİK MALZEMELERİ ALIMI',
    icerik:
      'Muhtelif Elektrik Malzemeleri mal alımı, 4734 sayılı Kamu İhale Kanunu\'nun 19. maddesine göre açık ihale usulü ile Destek Hizmetleri Müdürlüğü tarafından gerçekleştirilecektir. İhale, 02.06.2026 saat 10.00\'da Kapaklı Belediye Başkanlığı 9. Kat İhale Komisyon Odası\'nda yapılacaktır.',
    dosyaUrl: '/_uploads/docs/ihaleler/muhtelif-elektrik-malzemeleri-alimi_1777472443.docx',
    yayinTarihi: '29 Nisan 2026 17:20',
  },
];

const makaleler: MakaleyeBenzer[] = [
  {
    baslik: 'Kurban Bayramı Çocuklara Nasıl Anlatılmalı? (Uzm. Klinik Psikolog Ceren Sayın)',
    icerik:
      'Kurban Bayramı\'nın çocuklara yaşına uygun şekilde anlatılması gerekir. 7 yaşın altındaki çocukların soyut düşünme becerisi henüz gelişmediğinden kurban kesimine kesinlikle şahit olmamasına özellikle dikkat edilmelidir. 12 yaş öncesindeki çocuklara ise bayramın paylaşma, yardımlaşma ve birlik gibi sosyal yönleri anlatılmalıdır.\n\nKurban kesimi sahnelerine tanık olmak çocuklarda korku, kabus ve kaygı problemlerine yol açabilir; sağlıksız kesim koşullarına dair haberler de çocuklardan uzak tutulmalıdır. Bu konuda çocuklarla yapılan şakalardan da kaçınılmalıdır.',
    resimUrl:
      '/_uploads/photos/makaleler/thumb/300x300/kurban-bayrami-cocuklara-nasil-anlatilmali_1595509037.jpeg',
    yayinTarihi: '23 Temmuz 2020 15:53',
  },
  {
    baslik: 'Karne Konusunu Değerlendirmek (Ceren Sayın)',
    icerik:
      'Karne dönemlerinde aileler ve çocuklar kaygı yaşayabilir. Çocuklara koşulsuz sevgi hissettirmek önemlidir; notlar bu sevgiyi değiştirmemelidir. Notlar kişilik özelliklerinden ayrı değerlendirilmeli, çocuklar birbiriyle kıyaslanmamalıdır.\n\nKarne, başarı ya da başarısızlık kaynağı değil bir yol göstericidir. Cezadan kaçınılmalı, olumsuz notlara karşı hiçbir şekilde şiddete başvurulmamalıdır. Tatil de dinlenme amacına hizmet etmelidir; aileler tatil planlaması yapmalı, çocuklarıyla vakit geçirmeli ve yaratıcı etkinliklere birlikte katılmalıdır.',
    resimUrl:
      '/_uploads/photos/makaleler/thumb/300x300/karne-konusunu-degerlendirmek_1575218974.jpg',
    yayinTarihi: '14 Haziran 2019 09:49',
  },
  {
    baslik: 'Hayır Demeyi Öğretin (Ceren Sayın)',
    icerik:
      'Çocuklara cinsel istismardan korunmayı öğretmek büyük önem taşır. Fiziksel, duygusal ve cinsel istismar türleri tanımlanarak, çocuklara "bedenim bana aittir" bilinci kazandırılmalıdır.\n\nBu kapsamda yedi temel ilke öne çıkar: bedeninin kendisine ait olduğu bilinci, ancak izin verirse dokunulabileceği farkındalığı, dokunulması yasak bölgelere dair refleks, fiziksel baskıya direnebilme gücü, vücudunun görülmemesi hissi, tuvalette yalnız olabilme bilinci ve soyunup giyinirken yalnızlık ilkesi.\n\nUyku bozuklukları, yaşına uymayan oyunlar ve kendine zarar verme gibi davranış değişiklikleri istismarın işaretleri olabilir; ebeveynlerin bu belirtilere karşı dikkatli olması gerekir.',
    resimUrl:
      '/_uploads/photos/makaleler/thumb/300x300/hayir-demeyi-ogretin_1575218922.jpg',
    yayinTarihi: '25 Nisan 2019 16:42',
  },
  {
    baslik: 'Disleksi (Ceren Sayın)',
    icerik:
      'Öğrenme bozukluğunun ortaya çıkmasında birçok sebep vardır; doğum öncesi, doğum sırasında ve doğum sonrasında meydana gelen sorunlar ile kalıtsal faktörler rol oynayabilir.\n\nBelirtileri arasında okuma hızının beklenenden düşük olması, b-d-p gibi harfleri karıştırma, yazma güçlüğü ve imla kurallarına uyum problemleri sayılabilir. Bu güçlükleri yaşayan çocuklarda özgüven azalması, ders çalışmayı reddetme ve okula gitmek istememe gibi davranışlar gözlenebilir.\n\nDisleksinin zeka düzeyiyle bir ilgisi yoktur; ne var ki aileler tarafından sıklıkla yanlış değerlendirilmektedir.',
    resimUrl: '/_uploads/photos/makaleler/thumb/300x300/disleksi_1547162633.jpg',
    yayinTarihi: '09 Ocak 2019',
  },
  {
    baslik: 'Stres Nedir? (Ceren Sayın)',
    icerik:
      'Stres, zorluklar karşısında başa çıkma kaynaklarımızı ve yeteneklerimizi aşan durumlar olarak tanımlanır. Bireyler strese farklı tepkiler verir; bu farklılık kişinin yaşam deneyimleriyle ilişkilidir.\n\nStres kaynağını tespit etmek ve kontrol edilebilir kaynakları ortadan kaldırmak önemlidir. Stres anında vücutta kalbin daha hızlı atması, solunumun artması ve kan damarlarının genişlemesi gibi fizyolojik tepkiler gözlenir.\n\nSağlıklı düzeyde stres yaşamın bir parçasıdır; önemli olan onu mümkün olduğunca kontrol edip olumlu enerjiye çevirebilmektir.',
    resimUrl: '/_uploads/photos/makaleler/thumb/300x300/stres-nedir_1547165517.jpg',
    yayinTarihi: '09 Ocak 2019',
  },
  {
    baslik: 'Çağın Vebası: İnternet Bağımlılığı (Ceren Sayın)',
    icerik:
      'Günümüzde çoğu insan güne internetle başlayıp internetle bitirmektedir. İnternet bağımlılığının belirtileri, çocuk ve gençlerde görülen sorunlar ve tedavi yolları önemli bir başlık haline gelmiştir.\n\nBağımlılığın belirtileri altı madde halinde sıralanabilir; bu süreçte aile içi iletişimin önemi büyüktür. Yaş gruplarına göre sağlıklı internet kullanım süreleri de öneri olarak sunulmaktadır; örneğin okul öncesi çocuklar için günde 30 dakikayı geçmeyecek şekilde internet kullanımı yeterlidir.',
    resimUrl:
      '/_uploads/photos/makaleler/thumb/300x300/cagin-vebasi-internet-bagimliligi_1547165568.jpg',
    yayinTarihi: '09 Ocak 2019',
  },
];

interface GundemVeri {
  baslik: string;
  tarih: string;
}

const meclisGundemleri: GundemVeri[] = [
  { baslik: '2026 Yılı Temmuz Ayı Meclis Gündemi', tarih: '01.07.2026' },
  { baslik: '2026 Yılı Haziran Ayı Meclis Gündemi', tarih: '02.06.2026' },
  { baslik: '2026 Yılı Mayıs Ayı Meclis Gündemi', tarih: '04.05.2026' },
  // Detay sayfasında toplanti tarihi bulunamadi - yayin tarihi kullanildi (bkz. rapor).
  { baslik: '2026 Yılı Nisan Ayı Meclis Gündemi', tarih: '27.03.2026' },
  { baslik: '2026 Yılı Mart Ayı Meclis Gündemi', tarih: '02.03.2026' },
  { baslik: '2026 Yılı Şubat Ayı Meclis Gündemi', tarih: '02.02.2026' },
  { baslik: '2026 Yılı Ocak Ayı Meclis Gündemi', tarih: '06.01.2026' },
  { baslik: '2025 Yılı Aralık Ayı Meclis Gündemi', tarih: '01.12.2025' },
  { baslik: '2025 Yılı Kasım Ayı Meclis Gündemi', tarih: '03.11.2025' },
  { baslik: '2025 Yılı Ekim Ayı Meclis Gündemi', tarih: '01.10.2025' },
];

interface KararVeri {
  kararNo: string;
  baslik: string;
  tarih: string;
  dosyaUrl: string;
}

const meclisKararlari: KararVeri[] = [
  {
    kararNo: '2026-07',
    baslik: '2026 Yılı Temmuz Ayı Meclis Kararları',
    tarih: '06.07.2026 11:42',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-temmuz-ayi-meclis-kararlari_1783327353.doc',
  },
  {
    kararNo: '2026-06',
    baslik: '2026 Yılı Haziran Ayı Meclis Kararları',
    tarih: '08.06.2026 16:27',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-haziran-ayi-meclis-kararlari_1780925251.doc',
  },
  {
    kararNo: '2026-05',
    baslik: '2026 Yılı Mayıs Ayı Meclis Kararları',
    tarih: '11.05.2026 10:06',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-mayis-ayi-meclis-kararlari_1778483207.doc',
  },
  {
    kararNo: '2026-04',
    baslik: '2026 Yılı Nisan Ayı Meclis Kararları',
    tarih: '06.04.2026 15:20',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-nisan-ayi-meclis-kararlari_1775478010.doc',
  },
  // 2026 Mart ayina ait bir kayit indeks sayfasinda mevcut degildi (bkz. rapor).
  {
    kararNo: '2026-02',
    baslik: '2026 Yılı Şubat Ayı Meclis Kararları',
    tarih: '11.02.2026 16:21',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-subat-ayi-meclis-kararlari_1770816094.doc',
  },
  {
    kararNo: '2026-01',
    baslik: '2026 Yılı Ocak Ayı Meclis Kararları',
    tarih: '09.01.2026 16:44',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2026-yili-ocak-ayi-meclis-kararlari_1767966242.doc',
  },
  {
    kararNo: '2025-12',
    baslik: '2025 Yılı Aralık Ayı Meclis Kararları',
    tarih: '05.12.2025 16:22',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2025-yili-aralik-ayi-meclis-kararlari_1764940935.doc',
  },
  {
    kararNo: '2025-11',
    baslik: '2025 Yılı Kasım Ayı Meclis Kararları',
    tarih: '10.11.2025 17:38',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2025-yili-kasim-ayi-meclis-kararlari_1773899961.doc',
  },
  {
    kararNo: '2025-10',
    baslik: '2025 Yılı Ekim Ayı Meclis Kararları',
    tarih: '08.10.2025 11:27',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2025-yili-ekim-ayi-meclis-kararlari_1759901259.doc',
  },
  {
    kararNo: '2025-09',
    baslik: '2025 Yılı Eylül Ayı Meclis Kararları',
    tarih: '10.09.2025 11:35',
    dosyaUrl: '/_uploads/docs/meclis-kararlari/2025-yili-eylul-ayi-meclis-kararlari_1757482513.doc',
  },
];

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const ozet: string[] = [];

  try {
    const haberModel = app.get<Model<HaberDocument>>(getModelToken(Haber.name));
    const announcementModel = app.get<Model<AnnouncementDocument>>(
      getModelToken(Announcement.name),
    );
    const ilanModel = app.get<Model<IlanDocument>>(getModelToken(Ilan.name));
    const ihaleModel = app.get<Model<IhaleDocument>>(getModelToken(Ihale.name));
    const makaleModel = app.get<Model<MakaleDocument>>(getModelToken(Makale.name));
    const gundemModel = app.get<Model<MeclisGundemiDocument>>(
      getModelToken(MeclisGundemi.name),
    );
    const karariModel = app.get<Model<MeclisKarariDocument>>(
      getModelToken(MeclisKarari.name),
    );

    async function makaleyeBenzerYukle(
      isim: string,
      model: Model<any>,
      kayitlar: MakaleyeBenzer[],
      ekAlanlar?: (k: MakaleyeBenzer) => Record<string, unknown>,
    ) {
      let eklenen = 0;
      let atlanan = 0;
      for (const k of kayitlar) {
        const yayinTarihi = tarihCevir(k.yayinTarihi);
        const mevcut = await model
          .findOne({ baslik: k.baslik, yayinTarihi })
          .exec();
        if (mevcut) {
          atlanan++;
          continue;
        }
        await model.create({
          baslik: k.baslik,
          icerik: k.icerik,
          resimUrlleri: k.resimUrl ? [url(k.resimUrl)] : [],
          dosyaUrlleri: k.dosyaUrl ? [url(k.dosyaUrl)] : [],
          yayinTarihi,
          updatedBy: UPDATED_BY,
          ...(ekAlanlar ? ekAlanlar(k) : {}),
        });
        eklenen++;
      }
      ozet.push(`${isim}: ${eklenen} eklendi, ${atlanan} zaten vardı (toplam hedef ${kayitlar.length})`);
    }

    await makaleyeBenzerYukle('Haberler', haberModel, haberler);
    await makaleyeBenzerYukle(
      'Duyurular',
      announcementModel,
      duyurular,
      (k) => ({ kategori: (k as any).kategori }),
    );
    await makaleyeBenzerYukle('İlanlar', ilanModel, ilanlar);
    await makaleyeBenzerYukle('İhaleler', ihaleModel, ihaleler);
    await makaleyeBenzerYukle('Makaleler', makaleModel, makaleler);

    // Meclis Gündemleri
    {
      let eklenen = 0;
      let atlanan = 0;
      for (const g of meclisGundemleri) {
        const tarih = tarihCevir(g.tarih);
        const mevcut = await gundemModel.findOne({ baslik: g.baslik, tarih }).exec();
        if (mevcut) {
          atlanan++;
          continue;
        }
        await gundemModel.create({
          baslik: g.baslik,
          tarih,
          updatedBy: UPDATED_BY,
        });
        eklenen++;
      }
      ozet.push(
        `Meclis Gündemleri: ${eklenen} eklendi, ${atlanan} zaten vardı (toplam hedef ${meclisGundemleri.length})`,
      );
    }

    // Meclis Kararları (aylık özet -> tek kayıt mapping, bkz. rapor notu)
    {
      let eklenen = 0;
      let atlanan = 0;
      for (const kk of meclisKararlari) {
        const tarih = tarihCevir(kk.tarih);
        const mevcut = await karariModel.findOne({ kararNo: kk.kararNo }).exec();
        if (mevcut) {
          atlanan++;
          continue;
        }
        await karariModel.create({
          kararNo: kk.kararNo,
          kategori: 'Aylık Karar Özeti',
          tarih,
          baslik: kk.baslik,
          dosyaUrlleri: [url(kk.dosyaUrl)],
          updatedBy: UPDATED_BY,
        });
        eklenen++;
      }
      ozet.push(
        `Meclis Kararları: ${eklenen} eklendi, ${atlanan} zaten vardı (toplam hedef ${meclisKararlari.length})`,
      );
    }

    console.log('\n--- ÖZET ---');
    ozet.forEach((s) => console.log(s));

    console.log('\n--- GÜNCEL SAYILAR ---');
    console.log('haberler:', await haberModel.countDocuments().exec());
    console.log('announcements:', await announcementModel.countDocuments().exec());
    console.log('ilanlar:', await ilanModel.countDocuments().exec());
    console.log('ihaleler:', await ihaleModel.countDocuments().exec());
    console.log('makaleler:', await makaleModel.countDocuments().exec());
    console.log('meclisGundemleri:', await gundemModel.countDocuments().exec());
    console.log('meclisKararlari:', await karariModel.countDocuments().exec());
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Seed işlemi başarısız:', error);
  process.exit(1);
});
