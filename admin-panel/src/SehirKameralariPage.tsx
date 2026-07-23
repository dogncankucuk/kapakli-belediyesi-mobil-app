import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createSehirKamerasi,
  deleteSehirKamerasi,
  getSehirKameralari,
  updateSehirKamerasi,
} from './api';
import type { SehirKamerasiInput } from './api';
import type { SehirKamerasi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: SehirKamerasiInput = { ad: '', online: true };

function SehirKameralariPage({ canManage }: Props) {
  const [items, setItems] = useState<SehirKamerasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SehirKamerasiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SehirKamerasiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getSehirKameralari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kameralar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createSehirKamerasi(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kamera oluşturulamadı');
    }
  }

  function startEdit(item: SehirKamerasi) {
    setEditingId(item.id);
    setEditForm({ ad: item.ad, online: item.online });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateSehirKamerasi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kamera güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kamera silinsin mi?')) return;
    setError(null);
    try {
      await deleteSehirKamerasi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kamera silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Şehir Kameraları</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kamera</h3>
          <label>
            Ad
            <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required />
          </label>
          <label>
            Durum
            <select
              value={form.online ? 'online' : 'offline'}
              onChange={(e) => setForm({ ...form, online: e.target.value === 'online' })}
            >
              <option value="online">Canlı Yayın</option>
              <option value="offline">Bakım Çalışması</option>
            </select>
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
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id}>
                  <td colSpan={canManage ? 3 : 2}>
                    <div className="edit-row">
                      <label>
                        Ad
                        <input
                          value={editForm.ad}
                          onChange={(e) => setEditForm({ ...editForm, ad: e.target.value })}
                        />
                      </label>
                      <label>
                        Durum
                        <select
                          value={editForm.online ? 'online' : 'offline'}
                          onChange={(e) =>
                            setEditForm({ ...editForm, online: e.target.value === 'online' })
                          }
                        >
                          <option value="online">Canlı Yayın</option>
                          <option value="offline">Bakım Çalışması</option>
                        </select>
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
                  <td>{item.online ? 'Canlı Yayın' : 'Bakım Çalışması'}</td>
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

export default SehirKameralariPage;
