import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createPark, deletePark, getParklar, updatePark } from './api';
import type { ParkInput } from './api';
import { parkTuruLabels } from './types';
import type { Park } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: ParkInput = { ad: '', tur: 'Park', adres: '', lat: 41.33, lng: 27.97 };

function ParklarPage({ canManage }: Props) {
  const [items, setItems] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ParkInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ParkInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getParklar());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parklar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPark(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Park oluşturulamadı');
    }
  }

  function startEdit(item: Park) {
    setEditingId(item.id);
    setEditForm({ ad: item.ad, tur: item.tur, adres: item.adres ?? '', lat: item.lat, lng: item.lng });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updatePark(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Park güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu park kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deletePark(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Park silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Parklar</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Park</h3>
          <label>
            Ad
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
          </label>
          <label>
            Tür
            <select value={form.tur} onChange={(e) => setForm({ ...form, tur: e.target.value })}>
              {Object.entries(parkTuruLabels).map(([value, label]) => (
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
                          {Object.entries(parkTuruLabels).map(([value, label]) => (
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
                  <td>{parkTuruLabels[item.tur as keyof typeof parkTuruLabels] ?? item.tur}</td>
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

export default ParklarPage;
