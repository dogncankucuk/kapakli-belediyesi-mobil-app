import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  cbsSenkronizeSaglik,
  createSaglikKurumu,
  deleteSaglikKurumu,
  eczanelerdenIceAktar,
  getSaglikKurumlari,
  updateSaglikKurumu,
} from './api';
import type { SaglikKurumuInput } from './api';
import CbsSenkronizeButonu from './CbsSenkronizeButonu';
import KonumSecici from './KonumSecici';
import { saglikTuruLabels } from './types';
import type { SaglikKurumu } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: SaglikKurumuInput = { ad: '', tur: 'Eczane', adres: '', lat: 41.33, lng: 27.97 };

function SaglikPage({ canManage }: Props) {
  const [items, setItems] = useState<SaglikKurumu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SaglikKurumuInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SaglikKurumuInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getSaglikKurumlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sağlık kurumları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createSaglikKurumu(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sağlık kurumu oluşturulamadı');
    }
  }

  function startEdit(item: SaglikKurumu) {
    setEditingId(item.id);
    setEditForm({ ad: item.ad, tur: item.tur, adres: item.adres ?? '', lat: item.lat, lng: item.lng });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateSaglikKurumu(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sağlık kurumu güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu sağlık kurumu kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deleteSaglikKurumu(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sağlık kurumu silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Sağlık</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && <CbsSenkronizeButonu senkronizeEt={cbsSenkronizeSaglik} onTamamlandi={load} />}
      {canManage && (
        <CbsSenkronizeButonu
          senkronizeEt={eczanelerdenIceAktar}
          onTamamlandi={load}
          etiket="Eczanelerden İçe Aktar"
        />
      )}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Sağlık Kurumu</h3>
          <label>
            Ad
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required placeholder="Lütfen veri girişi yapınız" />
          </label>
          <label>
            Tür
            <select value={form.tur} onChange={(e) => setForm({ ...form, tur: e.target.value })}>
              {Object.entries(saglikTuruLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Adres
            <input value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} />
          </label>
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

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Tür</th>
              <th>Adres</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 4 : 3}>
                    <div className="edit-row">
                      <label>
                        Ad
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Tür
                        <select
                          value={editForm.tur}
                          onChange={(e) => setEditForm({ ...editForm, tur: e.target.value })}
                        >
                          {Object.entries(saglikTuruLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Adres
                        <input
                          value={editForm.adres}
                          onChange={(e) => setEditForm({ ...editForm, adres: e.target.value })}
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
                  <td>{item.ad}</td>
                  <td>{saglikTuruLabels[item.tur as keyof typeof saglikTuruLabels] ?? item.tur}</td>
                  <td>{item.adres ?? '-'}</td>
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
  );
}

export default SaglikPage;
