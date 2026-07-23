import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createMeclisKarari,
  deleteMeclisKarari,
  getMeclisKararlari,
  updateMeclisKarari,
} from './api';
import type { MeclisKarariInput } from './api';
import type { MeclisKarari } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: MeclisKarariInput = { kararNo: '', kategori: '', tarih: '', baslik: '' };

function MeclisKararlariPage({ canManage }: Props) {
  const [items, setItems] = useState<MeclisKarari[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MeclisKarariInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MeclisKarariInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMeclisKararlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kararlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMeclisKarari(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Karar oluşturulamadı');
    }
  }

  function startEdit(item: MeclisKarari) {
    setEditingId(item.id);
    setEditForm({
      kararNo: item.kararNo,
      kategori: item.kategori,
      tarih: item.tarih.slice(0, 10),
      baslik: item.baslik,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateMeclisKarari(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Karar güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu karar silinsin mi?')) return;
    setError(null);
    try {
      await deleteMeclisKarari(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Karar silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Meclis Kararları</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Karar</h3>
          <label>
            Karar No
            <input
              value={form.kararNo}
              onChange={(e) => setForm({ ...form, kararNo: e.target.value })}
              required
            />
          </label>
          <label>
            Kategori
            <input
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
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
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
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
              <th>Karar No</th>
              <th>Kategori</th>
              <th>Tarih</th>
              <th>Başlık</th>
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
                        Karar No
                        <input
                          value={editForm.kararNo}
                          onChange={(e) => setEditForm({ ...editForm, kararNo: e.target.value })}
                        />
                      </label>
                      <label>
                        Kategori
                        <input
                          value={editForm.kategori}
                          onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
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
                      <label>
                        Başlık
                        <input
                          value={editForm.baslik}
                          onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
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
                  <td>{item.kararNo}</td>
                  <td>{item.kategori}</td>
                  <td>{item.tarih.slice(0, 10)}</td>
                  <td>{item.baslik}</td>
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

export default MeclisKararlariPage;
