import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createYardimMerkeziSoru,
  deleteYardimMerkeziSoru,
  getYardimMerkeziSorulari,
  updateYardimMerkeziSoru,
} from './api';
import type { YardimMerkeziSoruInput } from './api';
import type { YardimMerkeziSoru } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: YardimMerkeziSoruInput = {
  soru: '',
  cevap: '',
};

function YardimMerkeziPage({ canManage }: Props) {
  const [items, setItems] = useState<YardimMerkeziSoru[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<YardimMerkeziSoruInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<YardimMerkeziSoruInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getYardimMerkeziSorulari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createYardimMerkeziSoru(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Soru oluşturulamadı');
    }
  }

  function startEdit(item: YardimMerkeziSoru) {
    setEditingId(item.id);
    setEditForm({ soru: item.soru, cevap: item.cevap });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateYardimMerkeziSoru(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Soru güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu soru silinsin mi?')) return;
    setError(null);
    try {
      await deleteYardimMerkeziSoru(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Soru silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Yardım Merkezi</h2>
      <p>Mobil uygulamadaki "Yardım Merkezi" ekranındaki sıkça sorulan soruları buradan yönetin.</p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Soru</h3>
          <label>
            Soru
            <input
              value={form.soru}
              onChange={(e) => setForm({ ...form, soru: e.target.value })}
              required
            />
          </label>
          <label>
            Cevap
            <textarea
              value={form.cevap}
              onChange={(e) => setForm({ ...form, cevap: e.target.value })}
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
              <th>Soru</th>
              <th>Cevap</th>
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
                        Soru
                        <input
                          value={editForm.soru}
                          onChange={(e) => setEditForm({ ...editForm, soru: e.target.value })}
                        />
                      </label>
                      <label>
                        Cevap
                        <textarea
                          value={editForm.cevap}
                          onChange={(e) => setEditForm({ ...editForm, cevap: e.target.value })}
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
                  <td>{item.soru}</td>
                  <td>{item.cevap}</td>
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

export default YardimMerkeziPage;
