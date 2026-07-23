import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createWifiNoktasi,
  deleteWifiNoktasi,
  getWifiNoktalari,
  updateWifiNoktasi,
} from './api';
import type { WifiNoktasiInput } from './api';
import type { WifiNoktasi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: WifiNoktasiInput = { ad: '', adres: '', kategori: 'parklar', lat: 41.33, lng: 27.97 };

function WifiNoktalariPage({ canManage }: Props) {
  const [items, setItems] = useState<WifiNoktasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<WifiNoktasiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WifiNoktasiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getWifiNoktalari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noktalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createWifiNoktasi(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nokta oluşturulamadı');
    }
  }

  function startEdit(item: WifiNoktasi) {
    setEditingId(item.id);
    setEditForm({
      ad: item.ad,
      adres: item.adres,
      kategori: item.kategori,
      lat: item.lat,
      lng: item.lng,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateWifiNoktasi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nokta güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu nokta silinsin mi?')) return;
    setError(null);
    try {
      await deleteWifiNoktasi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nokta silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Wi-Fi Noktaları</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Nokta</h3>
          <label>
            Ad
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
          </label>
          <label>
            Adres
            <input
              value={form.adres}
              onChange={(e) => setForm({ ...form, adres: e.target.value })}
              required
            />
          </label>
          <label>
            Kategori
            <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
              <option value="parklar">Parklar</option>
              <option value="meydanlar">Meydanlar</option>
            </select>
          </label>
          <label>
            Enlem (lat)
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
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
              required
            />
          </label>
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
              <th>Adres</th>
              <th>Kategori</th>
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
                        Adres
                        <input
                          value={editForm.adres}
                          onChange={(e) => setEditForm({ ...editForm, adres: e.target.value })}
                        />
                      </label>
                      <label>
                        Kategori
                        <select
                          value={editForm.kategori}
                          onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
                        >
                          <option value="parklar">Parklar</option>
                          <option value="meydanlar">Meydanlar</option>
                        </select>
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
                  <td>{item.adres}</td>
                  <td>{item.kategori}</td>
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

export default WifiNoktalariPage;
