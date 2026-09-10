import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { csvIndir } from './csvExport';
import { csvOku } from './csvImport';
import {
  createElektrikKesintisi,
  createPlanliKesinti,
  deleteElektrikKesintisi,
  deletePlanliKesinti,
  getElektrikKesintileri,
  getPlanliKesintiler,
  updateElektrikKesintisi,
  updatePlanliKesinti,
} from './api';
import type { ElektrikKesintisiInput, PlanliKesintiInput } from './api';
import { KAPAKLI_MAHALLELERI } from './constants/mahalleler';
import { bugununTarihi } from './tarih';
import TelefonOnizleme from './TelefonOnizleme';
import type { AdminElektrikKesintisi, PlanliKesinti } from './types';

interface Props {
  canManageSu: boolean;
  canManageElektrik: boolean;
}

const ELEKTRIK_CSV_BASLIKLAR = ['Mahalle', 'Tarih (GG.AA.YYYY)', 'Açıklama'];

// "12.03.2026" veya "2026-03-12" formatlarindan ISO tarihe (YYYY-MM-DD)
// cevirir - class-validator'in @IsDateString() DTO alani bu formati bekliyor.
function csvGgAaYyyyTarihiCevir(raw: string): string | null {
  const metin = raw.trim();
  const isoMatch = metin.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return metin;
  const trMatch = metin.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (trMatch) {
    const [, gun, ay, yil] = trMatch;
    return `${yil}-${ay.padStart(2, '0')}-${gun.padStart(2, '0')}`;
  }
  return null;
}

function elektrikCsvSatiriHazirla(item: ElektrikKesintisiInput): (string | number)[] {
  return [item.mahalle, item.tarih.slice(0, 10), item.aciklama];
}

interface ElektrikCsvHatasi {
  satirNo: number;
  mesaj: string;
}

function elektrikCsvSatiriniCevir(
  hucreler: string[],
): { input: ElektrikKesintisiInput | null; hata: string | null } {
  const mahalle = (hucreler[0] ?? '').trim();
  const aciklama = (hucreler[2] ?? '').trim();
  if (!mahalle || !aciklama) {
    return { input: null, hata: 'Mahalle ve Açıklama zorunludur' };
  }
  const tarih = csvGgAaYyyyTarihiCevir(hucreler[1] ?? '');
  if (!tarih) {
    return { input: null, hata: `Tarih anlaşılamadı: "${hucreler[1] ?? ''}"` };
  }
  return { input: { mahalle, tarih, aciklama }, hata: null };
}

const SU_CSV_BASLIKLAR = ['İlçe / Mahalle', 'Tarih (GG.AA.YYYY)', 'Açıklama'];

function suCsvSatiriHazirla(item: PlanliKesintiInput): (string | number)[] {
  return [item.ilce, item.tarih.slice(0, 10), item.aciklama];
}

interface SuCsvHatasi {
  satirNo: number;
  mesaj: string;
}

function suCsvSatiriniCevir(
  hucreler: string[],
): { input: PlanliKesintiInput | null; hata: string | null } {
  const ilce = (hucreler[0] ?? '').trim();
  const aciklama = (hucreler[2] ?? '').trim();
  if (!ilce || !aciklama) {
    return { input: null, hata: 'İlçe / Mahalle ve Açıklama zorunludur' };
  }
  const tarih = csvGgAaYyyyTarihiCevir(hucreler[1] ?? '');
  if (!tarih) {
    return { input: null, hata: `Tarih anlaşılamadı: "${hucreler[1] ?? ''}"` };
  }
  return { input: { ilce, tarih, aciklama }, hata: null };
}

const TURKCE_AYLAR: Record<string, string> = {
  ocak: '01',
  şubat: '02',
  subat: '02',
  mart: '03',
  nisan: '04',
  mayıs: '05',
  mayis: '05',
  haziran: '06',
  temmuz: '07',
  ağustos: '08',
  agustos: '08',
  eylül: '09',
  eylul: '09',
  ekim: '10',
  kasım: '11',
  kasim: '11',
  aralık: '12',
  aralik: '12',
};

// TESKİ'nin sitesindeki "09 Eylül 10:30" gibi Turkce ay adli tarihi ISO'ya
// cevirir - yil bilgisi sayfada yok, icinde bulunulan yil varsayilir.
function turkceTarihiIsoyaCevir(raw: string): string {
  const eslesme = raw.trim().match(/(\d{1,2})\s+([A-Za-zİıŞşĞğÜüÖöÇç]+)/);
  if (eslesme) {
    const ay = TURKCE_AYLAR[eslesme[2].toLocaleLowerCase('tr-TR')];
    if (ay) {
      return `${new Date().getFullYear()}-${ay}-${eslesme[1].padStart(2, '0')}`;
    }
  }
  return bugununTarihi();
}

// Bir tarayicidan HTML tablosu kopyalanip textarea'ya yapistirildiginda
// satirlar \n, hucreler genelde \t ile ayrilir - \t kaybolmussa (bazi
// taraycilar/OS'lar) 2+ bosluk bir yedek ayirac olarak denenir.
function yapistirilanSatiriHucrelereAyir(satir: string): string[] {
  if (satir.includes('\t')) return satir.split('\t');
  return satir.split(/ {2,}/);
}

interface KaynaktanCikarimSonucu<T> {
  gecerli: T[];
  toplamSatir: number;
}

// TESKİ'nin sukesintileri sayfasindaki tablo yapisi: Baslangic | Bitis |
// Nedeni | Yer (ör. "KAPAKLI / VATAN MAH. /") - sadece Kapakli'ya ait
// satirlar alinir (bkz. su-hizmetleri-kaynak.service.ts'teki eski backend
// filtresiyle ayni mantik, burada tarayicidan yapistirilan metin uzerinde).
function tesikiMetniniCevir(
  metin: string,
): KaynaktanCikarimSonucu<PlanliKesintiInput> {
  const satirlar = metin
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const gecerli: PlanliKesintiInput[] = [];
  for (const satir of satirlar) {
    const hucreler = yapistirilanSatiriHucrelereAyir(satir).map((h) => h.trim());
    if (hucreler.length < 4) continue;
    const [baslangic, bitis, nedeni, yer] = hucreler;
    const parcalar = yer.split('/').map((p) => p.trim());
    const ilce = parcalar[0] ?? '';
    const mahalle = parcalar[1] ?? '';
    if (ilce.toLocaleUpperCase('tr-TR') !== 'KAPAKLI') continue;
    gecerli.push({
      ilce: mahalle || '-',
      tarih: turkceTarihiIsoyaCevir(baslangic),
      aciklama: `${nedeni} (${baslangic} - ${bitis})`,
    });
  }
  return { gecerli, toplamSatir: satirlar.length };
}

const emptyElektrikForm: ElektrikKesintisiInput = { mahalle: '', tarih: '', aciklama: '' };
const emptyKesintiForm: PlanliKesintiInput = { tarih: '', ilce: '', aciklama: '' };

function SuHizmetleriPage({ canManageSu, canManageElektrik }: Props) {
  const [elektrikKesintileri, setElektrikKesintileri] = useState<AdminElektrikKesintisi[]>([]);
  const [kesintiler, setKesintiler] = useState<PlanliKesinti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [elektrikForm, setElektrikForm] = useState<ElektrikKesintisiInput>({
    ...emptyElektrikForm,
    tarih: bugununTarihi(),
  });
  const [editingElektrikId, setEditingElektrikId] = useState<string | null>(null);
  const [editElektrikForm, setEditElektrikForm] = useState<ElektrikKesintisiInput>(emptyElektrikForm);
  const [elektrikCsvYukleniyor, setElektrikCsvYukleniyor] = useState(false);
  const [elektrikCsvSonuc, setElektrikCsvSonuc] = useState<string | null>(null);
  const elektrikCsvInputRef = useRef<HTMLInputElement>(null);

  const [kesintiForm, setKesintiForm] = useState<PlanliKesintiInput>({
    ...emptyKesintiForm,
    tarih: bugununTarihi(),
  });
  const [editingKesintiId, setEditingKesintiId] = useState<string | null>(null);
  const [editKesintiForm, setEditKesintiForm] = useState<PlanliKesintiInput>(emptyKesintiForm);
  const [suCsvYukleniyor, setSuCsvYukleniyor] = useState(false);
  const [suCsvSonuc, setSuCsvSonuc] = useState<string | null>(null);
  const suCsvInputRef = useRef<HTMLInputElement>(null);
  const [teskiMetni, setTeskiMetni] = useState('');
  const [teskiSonuc, setTeskiSonuc] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [e, k] = await Promise.all([
        getElektrikKesintileri(),
        getPlanliKesintiler(),
      ]);
      setElektrikKesintileri(e);
      setKesintiler(k);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateElektrik(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createElektrikKesintisi(elektrikForm);
      setElektrikForm({ ...emptyElektrikForm, tarih: bugununTarihi() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi oluşturulamadı');
    }
  }

  function startEditElektrik(item: AdminElektrikKesintisi) {
    setEditingElektrikId(item.id);
    setEditElektrikForm({
      mahalle: item.mahalle,
      tarih: item.tarih.slice(0, 10),
      aciklama: item.aciklama,
    });
  }

  async function handleUpdateElektrik(id: string) {
    setError(null);
    try {
      await updateElektrikKesintisi(id, editElektrikForm);
      setEditingElektrikId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi güncellenemedi');
    }
  }

  async function handleDeleteElektrik(id: string) {
    if (!confirm('Bu elektrik kesintisi kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deleteElektrikKesintisi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi silinemedi');
    }
  }

  function handleElektrikSablonIndir() {
    const ornekSatirlar =
      elektrikKesintileri.length > 0
        ? elektrikKesintileri.map((item) => elektrikCsvSatiriHazirla(item))
        : [
            elektrikCsvSatiriHazirla({
              mahalle: 'İsmetpaşa',
              tarih: bugununTarihi(),
              aciklama: 'Bakım çalışması nedeniyle planlı kesinti',
            }),
          ];
    csvIndir('elektrik-kesintileri-sablon.csv', ELEKTRIK_CSV_BASLIKLAR, ornekSatirlar);
  }

  async function handleElektrikCsvSec(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = '';
    if (!dosya) return;

    setError(null);
    setElektrikCsvSonuc(null);
    setElektrikCsvYukleniyor(true);
    try {
      const icerik = await dosya.text();
      const satirlar = csvOku(icerik).slice(1); // ilk satir baslik
      const hatalar: ElektrikCsvHatasi[] = [];
      const gecerliKayitlar: ElektrikKesintisiInput[] = [];

      satirlar.forEach((hucreler, index) => {
        const { input, hata } = elektrikCsvSatiriniCevir(hucreler);
        if (!input) {
          hatalar.push({ satirNo: index + 2, mesaj: hata ?? 'geçersiz satır' });
        } else {
          gecerliKayitlar.push(input);
        }
      });

      let basarili = 0;
      for (const kayit of gecerliKayitlar) {
        try {
          await createElektrikKesintisi(kayit);
          basarili++;
        } catch (err) {
          hatalar.push({
            satirNo: 0,
            mesaj: `${kayit.mahalle}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
          });
        }
      }

      const parcalar = [`${basarili} kayıt eklendi.`];
      if (hatalar.length > 0) {
        parcalar.push(
          `${hatalar.length} satır atlandı: ` +
            hatalar
              .map((h) => (h.satirNo > 0 ? `satır ${h.satirNo} (${h.mesaj})` : h.mesaj))
              .join('; '),
        );
      }
      setElektrikCsvSonuc(parcalar.join(' '));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV dosyası okunamadı');
    } finally {
      setElektrikCsvYukleniyor(false);
    }
  }

  async function handleCreateKesinti(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPlanliKesinti(kesintiForm);
      setKesintiForm({ ...emptyKesintiForm, tarih: bugununTarihi() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti oluşturulamadı');
    }
  }

  async function handleUpdateKesinti(id: string) {
    setError(null);
    try {
      await updatePlanliKesinti(id, editKesintiForm);
      setEditingKesintiId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti güncellenemedi');
    }
  }

  async function handleDeleteKesinti(id: string) {
    if (!confirm('Bu kesinti kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deletePlanliKesinti(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kesinti silinemedi');
    }
  }

  function handleTeskiCikar() {
    const { gecerli, toplamSatir } = tesikiMetniniCevir(teskiMetni);
    if (gecerli.length === 0) {
      setTeskiSonuc(`${toplamSatir} satır tarandı, Kapaklı'ya ait kayıt bulunamadı.`);
      return;
    }
    csvIndir('su-kesintileri-kapakli.csv', SU_CSV_BASLIKLAR, gecerli.map(suCsvSatiriHazirla));
    setTeskiSonuc(
      `${toplamSatir} satır tarandı, ${gecerli.length} tanesi Kapaklı'ya ait - CSV indirildi. "CSV Seç ve İçe Aktar" ile ekleyebilirsiniz.`,
    );
  }

  function handleSuSablonIndir() {
    const ornekSatirlar =
      kesintiler.length > 0
        ? kesintiler.map((item) => suCsvSatiriHazirla(item))
        : [
            suCsvSatiriHazirla({
              ilce: 'İsmetpaşa',
              tarih: bugununTarihi(),
              aciklama: 'Bakım çalışması nedeniyle planlı kesinti',
            }),
          ];
    csvIndir('su-kesintileri-sablon.csv', SU_CSV_BASLIKLAR, ornekSatirlar);
  }

  async function handleSuCsvSec(e: ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = '';
    if (!dosya) return;

    setError(null);
    setSuCsvSonuc(null);
    setSuCsvYukleniyor(true);
    try {
      const icerik = await dosya.text();
      const satirlar = csvOku(icerik).slice(1); // ilk satir baslik
      const hatalar: SuCsvHatasi[] = [];
      const gecerliKayitlar: PlanliKesintiInput[] = [];

      satirlar.forEach((hucreler, index) => {
        const { input, hata } = suCsvSatiriniCevir(hucreler);
        if (!input) {
          hatalar.push({ satirNo: index + 2, mesaj: hata ?? 'geçersiz satır' });
        } else {
          gecerliKayitlar.push(input);
        }
      });

      let basarili = 0;
      for (const kayit of gecerliKayitlar) {
        try {
          await createPlanliKesinti(kayit);
          basarili++;
        } catch (err) {
          hatalar.push({
            satirNo: 0,
            mesaj: `${kayit.ilce}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
          });
        }
      }

      const parcalar = [`${basarili} kayıt eklendi.`];
      if (hatalar.length > 0) {
        parcalar.push(
          `${hatalar.length} satır atlandı: ` +
            hatalar
              .map((h) => (h.satirNo > 0 ? `satır ${h.satirNo} (${h.mesaj})` : h.mesaj))
              .join('; '),
        );
      }
      setSuCsvSonuc(parcalar.join(' '));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV dosyası okunamadı');
    } finally {
      setSuCsvYukleniyor(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>Su ve Elektrik Kesintileri</h2>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Su ve Elektrik Kesintileri</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      <h3>Planlı Su Kesintileri</h3>
      {canManageSu && (
        <details className="disable-blok">
          <summary>Kaynaktan Yapıştır (TESKİ)</summary>
          <div className="inline-form">
            <p>
              TESKİ'nin{' '}
              <a href="https://www.teski.gov.tr/sukesintileri/" target="_blank" rel="noreferrer">
                sukesintileri
              </a>{' '}
              sayfasını açın, kesinti tablosunu seçip kopyalayın (Ctrl+C) ve
              aşağıya yapıştırın - sadece Kapaklı'ya ait satırlar otomatik
              ayıklanıp CSV olarak indirilir (site bot korumalı olduğu için
              otomatik çekme yapılamıyor, kopyala-yapıştır gerekiyor).
            </p>
            <textarea
              className="kaynak-yapistir-alani"
              value={teskiMetni}
              onChange={(e) => setTeskiMetni(e.target.value)}
              placeholder="TESKİ sayfasındaki tabloyu buraya yapıştırın..."
              rows={6}
            />
            <div className="row-actions">
              <button type="button" onClick={handleTeskiCikar} disabled={!teskiMetni.trim()}>
                Ayıkla ve CSV İndir
              </button>
            </div>
            {teskiSonuc && <p className="success-message">{teskiSonuc}</p>}
          </div>
        </details>
      )}

      {canManageSu && (
        <details className="disable-blok">
          <summary>CSV ile Toplu Ekle</summary>
          <div className="inline-form">
            <p>
              Şablonu indirip TESKİ'den (ya da başka bir kaynaktan) baktığınız
              kesintileri doldurun, ardından dosyayı seçip içe aktarın.
            </p>
            <div className="row-actions">
              <button type="button" onClick={handleSuSablonIndir}>
                Şablonu İndir
              </button>
              <button
                type="button"
                onClick={() => suCsvInputRef.current?.click()}
                disabled={suCsvYukleniyor}
              >
                {suCsvYukleniyor ? 'İçe Aktarılıyor...' : 'CSV Seç ve İçe Aktar'}
              </button>
              <input
                ref={suCsvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleSuCsvSec}
                hidden
              />
            </div>
            {suCsvSonuc && <p className="success-message">{suCsvSonuc}</p>}
          </div>
        </details>
      )}

      {canManageSu && (
        <form className="inline-form" onSubmit={handleCreateKesinti}>
          <label>
            Tarih
            <input
              type="date"
              value={kesintiForm.tarih}
              onChange={(e) => setKesintiForm({ ...kesintiForm, tarih: e.target.value })}
              required
            />
          </label>
          <label>
            İlçe / Mahalle
            <select
              value={kesintiForm.ilce}
              onChange={(e) => setKesintiForm({ ...kesintiForm, ilce: e.target.value })}
              required
            >
              <option value="">Mahalle seçiniz</option>
              {KAPAKLI_MAHALLELERI.map((mahalle) => (
                <option key={mahalle} value={mahalle}>
                  {mahalle}
                </option>
              ))}
            </select>
          </label>
          <label>
            Açıklama
            <input
              value={kesintiForm.aciklama}
              onChange={(e) => setKesintiForm({ ...kesintiForm, aciklama: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İlçe</th>
            <th>Açıklama</th>
            {canManageSu && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {kesintiler.map((item) =>
            editingKesintiId === item.id ? (
              <tr key={item.id}>
                <td colSpan={canManageSu ? 4 : 3}>
                  <div className="edit-row">
                    <label>
                      Tarih
                      <input
                        type="date"
                        value={editKesintiForm.tarih}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, tarih: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      İlçe / Mahalle
                      <select
                        value={editKesintiForm.ilce}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, ilce: e.target.value })
                        }
                      >
                        <option value="">Mahalle seçiniz</option>
                        {KAPAKLI_MAHALLELERI.map((mahalle) => (
                          <option key={mahalle} value={mahalle}>
                            {mahalle}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Açıklama
                      <input
                        value={editKesintiForm.aciklama}
                        onChange={(e) =>
                          setEditKesintiForm({ ...editKesintiForm, aciklama: e.target.value })
                        }
                      />
                    </label>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUpdateKesinti(item.id)}>
                        Kaydet
                      </button>
                      <button type="button" onClick={() => setEditingKesintiId(null)}>
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.tarih.slice(0, 10)}</td>
                <td>{item.ilce}</td>
                <td>{item.aciklama}</td>
                {canManageSu && (
                  <td className="row-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKesintiId(item.id);
                        setEditKesintiForm({
                          tarih: item.tarih.slice(0, 10),
                          ilce: item.ilce,
                          aciklama: item.aciklama,
                        });
                      }}
                    >
                      Düzenle
                    </button>
                    <button type="button" onClick={() => handleDeleteKesinti(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>

      <h3>Elektrik Kesintileri</h3>
      {canManageElektrik && (
        <details className="disable-blok">
          <summary>CSV ile Toplu Ekle</summary>
          <div className="inline-form">
            <p>
              TREDAŞ'ın kesinti sayfası bot korumalı olduğu için otomatik
              çekilemiyor - şablonu indirip TREDAŞ'tan baktığınız kesintileri
              elle doldurun, ardından dosyayı seçip içe aktarın.
            </p>
            <div className="row-actions">
              <button type="button" onClick={handleElektrikSablonIndir}>
                Şablonu İndir
              </button>
              <button
                type="button"
                onClick={() => elektrikCsvInputRef.current?.click()}
                disabled={elektrikCsvYukleniyor}
              >
                {elektrikCsvYukleniyor ? 'İçe Aktarılıyor...' : 'CSV Seç ve İçe Aktar'}
              </button>
              <input
                ref={elektrikCsvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleElektrikCsvSec}
                hidden
              />
            </div>
            {elektrikCsvSonuc && <p className="success-message">{elektrikCsvSonuc}</p>}
          </div>
        </details>
      )}

      {canManageElektrik && (
        <form className="inline-form" onSubmit={handleCreateElektrik}>
          <label>
            Mahalle
            <select
              value={elektrikForm.mahalle}
              onChange={(e) => setElektrikForm({ ...elektrikForm, mahalle: e.target.value })}
              required
            >
              <option value="">Mahalle seçiniz</option>
              {KAPAKLI_MAHALLELERI.map((mahalle) => (
                <option key={mahalle} value={mahalle}>
                  {mahalle}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tarih
            <input
              type="date"
              value={elektrikForm.tarih}
              onChange={(e) => setElektrikForm({ ...elektrikForm, tarih: e.target.value })}
              required
            />
          </label>
          <label>
            Açıklama
            <input
              value={elektrikForm.aciklama}
              onChange={(e) => setElektrikForm({ ...elektrikForm, aciklama: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Mahalle</th>
            <th>Tarih</th>
            <th>Açıklama</th>
            {canManageElektrik && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {elektrikKesintileri.map((item) =>
            editingElektrikId === item.id ? (
              <tr key={item.id}>
                <td colSpan={canManageElektrik ? 4 : 3}>
                  <div className="edit-row">
                    <label>
                      Mahalle
                      <select
                        value={editElektrikForm.mahalle}
                        onChange={(e) =>
                          setEditElektrikForm({ ...editElektrikForm, mahalle: e.target.value })
                        }
                      >
                        <option value="">Mahalle seçiniz</option>
                        {KAPAKLI_MAHALLELERI.map((mahalle) => (
                          <option key={mahalle} value={mahalle}>
                            {mahalle}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Tarih
                      <input
                        type="date"
                        value={editElektrikForm.tarih}
                        onChange={(e) =>
                          setEditElektrikForm({ ...editElektrikForm, tarih: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Açıklama
                      <input
                        value={editElektrikForm.aciklama}
                        onChange={(e) =>
                          setEditElektrikForm({ ...editElektrikForm, aciklama: e.target.value })
                        }
                      />
                    </label>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleUpdateElektrik(item.id)}>
                        Kaydet
                      </button>
                      <button type="button" onClick={() => setEditingElektrikId(null)}>
                        Vazgeç
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.mahalle}</td>
                <td>{item.tarih.slice(0, 10)}</td>
                <td>{item.aciklama}</td>
                {canManageElektrik && (
                  <td className="row-actions">
                    <button type="button" onClick={() => startEditElektrik(item)}>
                      Düzenle
                    </button>
                    <button type="button" onClick={() => handleDeleteElektrik(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>
      </div>

      <div className="guncel-sag">
        <h3 className="bolum-baslik">Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik="Su ve Elektrik Kesintileri">
          <div className="genel-onizleme-bolum">
            <span className="genel-onizleme-bolum-baslik">Planlı Su Kesintileri</span>
            {kesintiler.length === 0 ? (
              <span className="genel-onizleme-bos">Henüz içerik yok</span>
            ) : (
              kesintiler.map((kesinti) => (
                <div className="genel-onizleme-satir" key={kesinti.id}>
                  <span className="genel-onizleme-satir-etiket">
                    {kesinti.tarih.slice(0, 10)} · {kesinti.ilce}
                  </span>
                  <span className="genel-onizleme-satir-ipucu">{kesinti.aciklama}</span>
                </div>
              ))
            )}
          </div>
          <div className="genel-onizleme-bolum">
            <span className="genel-onizleme-bolum-baslik">Elektrik Kesintileri</span>
            {elektrikKesintileri.length === 0 ? (
              <span className="genel-onizleme-bos">Henüz içerik yok</span>
            ) : (
              elektrikKesintileri.map((item) => (
                <div className="genel-onizleme-satir" key={item.id}>
                  <span className="genel-onizleme-satir-etiket">
                    {item.tarih.slice(0, 10)} · {item.mahalle}
                  </span>
                  <span className="genel-onizleme-satir-ipucu">{item.aciklama}</span>
                </div>
              ))
            )}
          </div>
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default SuHizmetleriPage;
