import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createElektrikKesintisi,
  createPlanliKesinti,
  deleteElektrikKesintisi,
  deletePlanliKesinti,
  getElektrikKesintileri,
  getKesintiApiAyari,
  getPlanliKesintiler,
  senkronizeElektrikKesintileriApiIle,
  senkronizeSuKesintileriApiIle,
  setKesintiApiAyari,
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
  isSuperAdmin: boolean;
}

const emptyElektrikForm: ElektrikKesintisiInput = { mahalle: '', tarih: '', aciklama: '' };
const emptyKesintiForm: PlanliKesintiInput = { tarih: '', ilce: '', aciklama: '' };

function SuHizmetleriPage({ canManageSu, canManageElektrik, isSuperAdmin }: Props) {
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
  const [elektrikApiYukleniyor, setElektrikApiYukleniyor] = useState(false);
  const [elektrikApiSonuc, setElektrikApiSonuc] = useState<string | null>(null);

  const [kesintiForm, setKesintiForm] = useState<PlanliKesintiInput>({
    ...emptyKesintiForm,
    tarih: bugununTarihi(),
  });
  const [editingKesintiId, setEditingKesintiId] = useState<string | null>(null);
  const [editKesintiForm, setEditKesintiForm] = useState<PlanliKesintiInput>(emptyKesintiForm);
  const [suApiYukleniyor, setSuApiYukleniyor] = useState(false);
  const [suApiSonuc, setSuApiSonuc] = useState<string | null>(null);

  // Su/elektrik API adresleri - sadece Super Admin gorebilir/degistirebilir
  // (bkz. isSuperAdmin prop'u, backend SuperAdminGuard). Diger admin
  // kullanicilari icin bu blok hic render edilmez, deger hic cekilmez.
  const [suApiUrl, setSuApiUrl] = useState('');
  const [suApiUrlKaydediliyor, setSuApiUrlKaydediliyor] = useState(false);
  const [suApiUrlMesaj, setSuApiUrlMesaj] = useState<string | null>(null);
  const [elektrikApiUrl, setElektrikApiUrl] = useState('');
  const [elektrikApiUrlKaydediliyor, setElektrikApiUrlKaydediliyor] = useState(false);
  const [elektrikApiUrlMesaj, setElektrikApiUrlMesaj] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    getKesintiApiAyari('su').then((r) => setSuApiUrl(r.apiUrl)).catch(() => {});
    getKesintiApiAyari('elektrik').then((r) => setElektrikApiUrl(r.apiUrl)).catch(() => {});
  }, [isSuperAdmin]);

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

  async function handleElektrikApiCek() {
    setError(null);
    setElektrikApiSonuc(null);
    setElektrikApiYukleniyor(true);
    try {
      const { basarili, hatalar } = await senkronizeElektrikKesintileriApiIle();
      const parcalar = [`${basarili} kayıt eklendi.`];
      if (hatalar.length > 0) {
        parcalar.push(`${hatalar.length} kayıt atlandı: ${hatalar.join('; ')}`);
      }
      setElektrikApiSonuc(parcalar.join(' '));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API üzerinden kesinti çekilemedi');
    } finally {
      setElektrikApiYukleniyor(false);
    }
  }

  async function handleElektrikApiUrlKaydet(e: FormEvent) {
    e.preventDefault();
    setElektrikApiUrlMesaj(null);
    setElektrikApiUrlKaydediliyor(true);
    try {
      await setKesintiApiAyari('elektrik', elektrikApiUrl);
      setElektrikApiUrlMesaj('API adresi kaydedildi.');
    } catch (err) {
      setElektrikApiUrlMesaj(err instanceof Error ? err.message : 'API adresi kaydedilemedi');
    } finally {
      setElektrikApiUrlKaydediliyor(false);
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

  async function handleSuApiCek() {
    setError(null);
    setSuApiSonuc(null);
    setSuApiYukleniyor(true);
    try {
      const { basarili, hatalar } = await senkronizeSuKesintileriApiIle();
      const parcalar = [`${basarili} kayıt eklendi.`];
      if (hatalar.length > 0) {
        parcalar.push(`${hatalar.length} kayıt atlandı: ${hatalar.join('; ')}`);
      }
      setSuApiSonuc(parcalar.join(' '));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API üzerinden kesinti çekilemedi');
    } finally {
      setSuApiYukleniyor(false);
    }
  }

  async function handleSuApiUrlKaydet(e: FormEvent) {
    e.preventDefault();
    setSuApiUrlMesaj(null);
    setSuApiUrlKaydediliyor(true);
    try {
      await setKesintiApiAyari('su', suApiUrl);
      setSuApiUrlMesaj('API adresi kaydedildi.');
    } catch (err) {
      setSuApiUrlMesaj(err instanceof Error ? err.message : 'API adresi kaydedilemedi');
    } finally {
      setSuApiUrlKaydediliyor(false);
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

      {isSuperAdmin && (
        <details className="disable-blok">
          <summary>API Ayarları (Süper Admin)</summary>
          <form className="inline-form" onSubmit={handleSuApiUrlKaydet}>
            <p>
              Bu alan yalnızca süper admin tarafından görülebilir ve
              değiştirilebilir. Su kesintileri API'si hazır olduğunda adresini
              buraya girin.
            </p>
            <p className="map-editor-readonly-note">
              Beklenen yanıt formatı: her biri
              <code>{'{"ilce": "...", "tarih": "YYYY-AA-GG", "aciklama": "..."}'}</code>
              şeklinde nesnelerden oluşan bir JSON dizisi.
            </p>
            <label>
              API Adresi
              <input
                type="password"
                autoComplete="off"
                value={suApiUrl}
                onChange={(e) => setSuApiUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <div className="row-actions">
              <button type="submit" disabled={suApiUrlKaydediliyor}>
                {suApiUrlKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {suApiUrlMesaj && <p className="success-message">{suApiUrlMesaj}</p>}
            <div className="row-actions">
              <button type="button" onClick={handleSuApiCek} disabled={suApiYukleniyor}>
                {suApiYukleniyor ? 'Çekiliyor...' : 'API\'den Çek'}
              </button>
            </div>
            {suApiSonuc && <p className="success-message">{suApiSonuc}</p>}
          </form>
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

      {isSuperAdmin && (
        <details className="disable-blok">
          <summary>API Ayarları (Süper Admin)</summary>
          <form className="inline-form" onSubmit={handleElektrikApiUrlKaydet}>
            <p>
              Bu alan yalnızca süper admin tarafından görülebilir ve
              değiştirilebilir. Elektrik kesintileri API'si hazır olduğunda
              adresini buraya girin.
            </p>
            <p className="map-editor-readonly-note">
              Beklenen yanıt formatı: her biri
              <code>{'{"mahalle": "...", "tarih": "YYYY-AA-GG", "aciklama": "..."}'}</code>
              şeklinde nesnelerden oluşan bir JSON dizisi.
            </p>
            <label>
              API Adresi
              <input
                type="password"
                autoComplete="off"
                value={elektrikApiUrl}
                onChange={(e) => setElektrikApiUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <div className="row-actions">
              <button type="submit" disabled={elektrikApiUrlKaydediliyor}>
                {elektrikApiUrlKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {elektrikApiUrlMesaj && <p className="success-message">{elektrikApiUrlMesaj}</p>}
            <div className="row-actions">
              <button type="button" onClick={handleElektrikApiCek} disabled={elektrikApiYukleniyor}>
                {elektrikApiYukleniyor ? 'Çekiliyor...' : 'API\'den Çek'}
              </button>
            </div>
            {elektrikApiSonuc && <p className="success-message">{elektrikApiSonuc}</p>}
          </form>
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
