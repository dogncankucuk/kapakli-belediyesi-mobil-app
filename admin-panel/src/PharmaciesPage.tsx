import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createPharmacy,
  deletePharmacy,
  getPharmacies,
  updatePharmacy,
} from './api';
import type { PharmacyInput } from './api';
import type { Pharmacy } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: PharmacyInput = {
  ad: '',
  adres: '',
  telefon: '',
  nobetTarihi: '',
  lat: 41.33,
  lng: 27.97,
};

function PharmaciesPage({ canManage }: Props) {
  const [items, setItems] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PharmacyInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PharmacyInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

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
      setForm(emptyForm);
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
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kayıt</h3>
          <label>
            Eczane Adı
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
            Telefon
            <input
              value={form.telefon}
              onChange={(e) => setForm({ ...form, telefon: e.target.value })}
              required
            />
          </label>
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
              <th>Telefon</th>
              <th>Nöbet Tarihi</th>
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
                        Telefon
                        <input
                          value={editForm.telefon}
                          onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })}
                        />
                      </label>
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
                  <td>{item.telefon}</td>
                  <td>{item.nobetTarihi.slice(0, 10)}</td>
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

export default PharmaciesPage;
