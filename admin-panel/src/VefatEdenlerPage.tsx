import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createVefatIlani,
  deleteVefatIlani,
  getVefatIlanlari,
  updateVefatIlani,
} from './api';
import type { VefatIlaniInput } from './api';
import type { VefatIlani } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: VefatIlaniInput = {
  adSoyad: '',
  yas: 0,
  not: '',
  mekan: '',
  namazVakti: '',
  tarih: '',
};

function VefatEdenlerPage({ canManage }: Props) {
  const [items, setItems] = useState<VefatIlani[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VefatIlaniInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VefatIlaniInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getVefatIlanlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createVefatIlani(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan oluşturulamadı');
    }
  }

  function startEdit(item: VefatIlani) {
    setEditingId(item.id);
    setEditForm({
      adSoyad: item.adSoyad,
      yas: item.yas,
      not: item.not,
      mekan: item.mekan,
      namazVakti: item.namazVakti,
      tarih: item.tarih.slice(0, 10),
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateVefatIlani(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu ilan silinsin mi?')) return;
    setError(null);
    try {
      await deleteVefatIlani(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Vefat Edenler</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni İlan</h3>
          <label>
            Ad Soyad
            <input
              value={form.adSoyad}
              onChange={(e) => setForm({ ...form, adSoyad: e.target.value })}
              required
            />
          </label>
          <label>
            Yaş
            <input
              type="number"
              min={0}
              value={form.yas}
              onChange={(e) => setForm({ ...form, yas: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Not
            <input value={form.not} onChange={(e) => setForm({ ...form, not: e.target.value })} required />
          </label>
          <label>
            Mekan
            <input
              value={form.mekan}
              onChange={(e) => setForm({ ...form, mekan: e.target.value })}
              required
            />
          </label>
          <label>
            Namaz Vakti
            <input
              value={form.namazVakti}
              onChange={(e) => setForm({ ...form, namazVakti: e.target.value })}
              required
            />
          </label>
          <label>
            Tarih
            <input
              type="date"
              value={form.tarih}
              onChange={(e) => setForm({ ...form, tarih: e.target.value })}
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
              <th>Ad Soyad</th>
              <th>Yaş</th>
              <th>Mekan</th>
              <th>Namaz Vakti</th>
              <th>Tarih</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 6 : 5}>
                    <div className="edit-row">
                      <label>
                        Ad Soyad
                        <input
                          value={editForm.adSoyad}
                          onChange={(e) => setEditForm({ ...editForm, adSoyad: e.target.value })}
                        />
                      </label>
                      <label>
                        Yaş
                        <input
                          type="number"
                          min={0}
                          value={editForm.yas}
                          onChange={(e) =>
                            setEditForm({ ...editForm, yas: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label>
                        Not
                        <input
                          value={editForm.not}
                          onChange={(e) => setEditForm({ ...editForm, not: e.target.value })}
                        />
                      </label>
                      <label>
                        Mekan
                        <input
                          value={editForm.mekan}
                          onChange={(e) => setEditForm({ ...editForm, mekan: e.target.value })}
                        />
                      </label>
                      <label>
                        Namaz Vakti
                        <input
                          value={editForm.namazVakti}
                          onChange={(e) =>
                            setEditForm({ ...editForm, namazVakti: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Tarih
                        <input
                          type="date"
                          value={editForm.tarih}
                          onChange={(e) => setEditForm({ ...editForm, tarih: e.target.value })}
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
                  <td>{item.adSoyad}</td>
                  <td>{item.yas}</td>
                  <td>{item.mekan}</td>
                  <td>{item.namazVakti}</td>
                  <td>{item.tarih.slice(0, 10)}</td>
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

export default VefatEdenlerPage;
