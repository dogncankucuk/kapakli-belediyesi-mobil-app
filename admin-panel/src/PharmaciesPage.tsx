import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createPharmacy,
  deletePharmacy,
  getKesintiApiAyari,
  getPharmacies,
  senkronizePharmaciesApiIle,
  setKesintiApiAyari,
  updatePharmacy,
} from './api';
import type { PharmacyInput } from './api';
import KonumSecici from './KonumSecici';
import TelefonOnizleme from './TelefonOnizleme';
import type { Pharmacy } from './types';

interface Props {
  canManage: boolean;
  isSuperAdmin: boolean;
}

const emptyForm: PharmacyInput = {
  ad: '',
  adres: '',
  adresTarifi: '',
  telefon: '',
  nobetTarihi: '',
  lat: 41.33,
  lng: 27.97,
};

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}

function PharmaciesPage({ canManage, isSuperAdmin }: Props) {
  const [items, setItems] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PharmacyInput>({ ...emptyForm, nobetTarihi: bugun() });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PharmacyInput>(emptyForm);
  const [apiYukleniyor, setApiYukleniyor] = useState(false);
  const [apiSonuc, setApiSonuc] = useState<string | null>(null);

  // Sadece Super Admin gorebilir/degistirebilir - bkz. isSuperAdmin prop'u,
  // backend SuperAdminGuard.
  const [apiUrl, setApiUrl] = useState('');
  const [apiUrlKaydediliyor, setApiUrlKaydediliyor] = useState(false);
  const [apiUrlMesaj, setApiUrlMesaj] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    getKesintiApiAyari('eczane').then((r) => setApiUrl(r.apiUrl)).catch(() => {});
  }, [isSuperAdmin]);

  async function handleApiCek() {
    setError(null);
    setApiSonuc(null);
    setApiYukleniyor(true);
    try {
      const { basarili, hatalar } = await senkronizePharmaciesApiIle();
      const parcalar = [`${basarili} kayıt eklendi.`];
      if (hatalar.length > 0) {
        parcalar.push(`${hatalar.length} kayıt atlandı: ${hatalar.join('; ')}`);
      }
      setApiSonuc(parcalar.join(' '));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API üzerinden eczane çekilemedi');
    } finally {
      setApiYukleniyor(false);
    }
  }

  async function handleApiUrlKaydet(e: FormEvent) {
    e.preventDefault();
    setApiUrlMesaj(null);
    setApiUrlKaydediliyor(true);
    try {
      await setKesintiApiAyari('eczane', apiUrl);
      setApiUrlMesaj('API adresi kaydedildi.');
    } catch (err) {
      setApiUrlMesaj(err instanceof Error ? err.message : 'API adresi kaydedilemedi');
    } finally {
      setApiUrlKaydediliyor(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getPharmacies());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczaneler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPharmacy(form);
      setForm({ ...emptyForm, nobetTarihi: bugun() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane oluşturulamadı');
    }
  }

  function startEdit(item: Pharmacy) {
    setEditingId(item.id);
    setEditForm({
      ad: item.ad,
      adres: item.adres,
      adresTarifi: item.adresTarifi ?? '',
      telefon: item.telefon,
      nobetTarihi: item.nobetTarihi.slice(0, 10),
      lat: item.lat,
      lng: item.lng,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updatePharmacy(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu eczane kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deletePharmacy(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eczane silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Nöbetçi Eczaneler</h2>
      <p>
        Alanlar, belediyenin resmi nöbetçi eczane sayfasındaki sırayla aynıdır
        (Tarih / Eczane Adı / Telefon / Adres). Konum bilgisi yalnızca harita
        katmanında gösterim için kullanılır.
      </p>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}

      {isSuperAdmin && (
        <details className="disable-blok">
          <summary>API Ayarları (Süper Admin)</summary>
          <form className="inline-form" onSubmit={handleApiUrlKaydet}>
            <p>
              Bu alan yalnızca süper admin tarafından görülebilir ve
              değiştirilebilir. Nöbetçi eczaneler API'si hazır olduğunda
              adresini buraya girin.
            </p>
            <p className="map-editor-readonly-note">
              Beklenen yanıt formatı: her biri
              <code>
                {'{"ad": "...", "adres": "...", "adresTarifi": "...", "telefon": "...", "nobetTarihi": "YYYY-AA-GG", "lat": 0, "lng": 0}'}
              </code>
              şeklinde nesnelerden oluşan bir JSON dizisi ("adresTarifi"
              opsiyonel, gerisi zorunlu).
            </p>
            <label>
              API Adresi
              <input
                type="password"
                autoComplete="off"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            <div className="row-actions">
              <button type="submit" disabled={apiUrlKaydediliyor}>
                {apiUrlKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {apiUrlMesaj && <p className="success-message">{apiUrlMesaj}</p>}
            <div className="row-actions">
              <button type="button" onClick={handleApiCek} disabled={apiYukleniyor}>
                {apiYukleniyor ? 'Çekiliyor...' : "API'den Çek"}
              </button>
            </div>
            {apiSonuc && <p className="success-message">{apiSonuc}</p>}
          </form>
        </details>
      )}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kayıt</h3>
          <label>
            Nöbet Tarihi
            <input
              type="date"
              value={form.nobetTarihi}
              onChange={(e) => setForm({ ...form, nobetTarihi: e.target.value })}
              required
            />
          </label>
          <label>
            Eczane Adı
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required placeholder="Lütfen veri girişi yapınız" />
          </label>
          <label>
            Telefon
            <input
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Adres
            <input
              value={form.adres}
              onChange={(e) => setForm({ ...form, adres: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Adres Tarifi (opsiyonel)
            <input
              value={form.adresTarifi}
              onChange={(e) => setForm({ ...form, adresTarifi: e.target.value })}
            />
          </label>
          <h3 className="form-section-divider">Harita Konumu</h3>
          <label>
            Enlem (lat)
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Boylam (lng)
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <KonumSecici
            lat={form.lat}
            lng={form.lng}
            onChange={(lat, lng, adres) =>
              setForm({ ...form, lat, lng, adres: adres ?? form.adres })
            }
          />
          <button type="submit">Kaydet</button>
        </form>
      )}

      <h3 className="bolum-baslik">2. Bölüm: Eklenmiş Kayıtlar</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nöbet Tarihi</th>
              <th>Eczane Adı</th>
              <th>Telefon</th>
              <th>Adres</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 5 : 4}>
                    <div className="edit-row">
                      <label>
                        Nöbet Tarihi
                        <input
                          type="date"
                          value={editForm.nobetTarihi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nobetTarihi: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Eczane Adı
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Telefon
                        <input
                          value={editForm.telefon}
                          onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                        />
                      </label>
                      <label>
                        Adres
                        <input
                          value={editForm.adres}
                          onChange={(e) => setEditForm({ ...editForm, adres: e.target.value })}
                        />
                      </label>
                      <label>
                        Adres Tarifi (opsiyonel)
                        <input
                          value={editForm.adresTarifi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, adresTarifi: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Enlem (lat)
                        <input
                          type="number"
                          step="any"
                          value={editForm.lat}
                          onChange={(e) => setEditForm({ ...editForm, lat: Number(e.target.value) })}
                        />
                      </label>
                      <label>
                        Boylam (lng)
                        <input
                          type="number"
                          step="any"
                          value={editForm.lng}
                          onChange={(e) => setEditForm({ ...editForm, lng: Number(e.target.value) })}
                        />
                      </label>
                      <KonumSecici
                        lat={editForm.lat}
                        lng={editForm.lng}
                        onChange={(lat, lng, adres) =>
                          setEditForm({ ...editForm, lat, lng, adres: adres ?? editForm.adres })
                        }
                      />
                      <div className="row-actions">
                        <button type="button" onClick={() => handleUpdate(item.id)}>
                          Kaydet
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.nobetTarihi.slice(0, 10)}</td>
                  <td>{item.ad}</td>
                  <td>{item.telefon}</td>
                  <td>{item.adres}</td>
                  {canManage && (
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(item)}>
                        Düzenle
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)}>
                        Sil
                      </button>
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
      </div>

      <div className="guncel-sag">
        <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik="Nöbetçi Eczaneler">
          {items.length === 0 && (
            <span className="genel-onizleme-bos">Henüz eczane eklenmemiş</span>
          )}
          {items.map((item) => (
            <div className="genel-onizleme-bolum" key={item.id}>
              <span className="genel-onizleme-bolum-baslik">{item.ad || 'Eczane Adı'}</span>
              <div className="genel-onizleme-satir">
                <span className="genel-onizleme-satir-etiket">{item.telefon}</span>
                <span className="genel-onizleme-satir-ipucu">{item.adres}</span>
              </div>
            </div>
          ))}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default PharmaciesPage;
