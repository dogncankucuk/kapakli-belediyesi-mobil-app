import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createMakale,
  deleteMakale,
  getMakaleler,
  updateMakale,
} from './api';
import type { ArticleContentInput } from './api';
import MedyaSecici from './MedyaSecici';
import type { Makale } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: ArticleContentInput = {
  baslik: '',
  icerik: '',
  resimUrl: '',
  yayinTarihi: '',
};

function MakalelerPage({ canManage }: Props) {
  const [items, setItems] = useState<Makale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleContentInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArticleContentInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMakaleler());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Makaleler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMakale({ ...form, resimUrl: form.resimUrl || null });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Makale oluşturulamadı');
    }
  }

  function startEdit(item: Makale) {
    setEditingId(item.id);
    setEditForm({
      baslik: item.baslik,
      icerik: item.icerik,
      resimUrl: item.resimUrl ?? '',
      yayinTarihi: item.yayinTarihi.slice(0, 10),
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateMakale(id, { ...editForm, resimUrl: editForm.resimUrl || null });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Makale güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu makale silinsin mi?')) return;
    setError(null);
    try {
      await deleteMakale(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Makale silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Makaleler</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Makale</h3>
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              required
            />
          </label>
          <label>
            İçerik
            <textarea
              value={form.icerik}
              onChange={(e) => setForm({ ...form, icerik: e.target.value })}
              required
            />
          </label>
          <label>
            Resim URL
            <MedyaSecici
              value={form.resimUrl ?? ''}
              onChange={(url) => setForm({ ...form, resimUrl: url })}
            />
          </label>
          <label>
            Yayın Tarihi
            <input
              type="date"
              value={form.yayinTarihi}
              onChange={(e) => setForm({ ...form, yayinTarihi: e.target.value })}
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
              <th>Başlık</th>
              <th>Yayın Tarihi</th>
              <th>Son Güncelleyen</th>
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
                        Başlık
                        <input
                          value={editForm.baslik}
                          onChange={(e) => setEditForm({ ...editForm, baslik: e.target.value })}
                        />
                      </label>
                      <label>
                        İçerik
                        <textarea
                          value={editForm.icerik}
                          onChange={(e) => setEditForm({ ...editForm, icerik: e.target.value })}
                        />
                      </label>
                      <label>
                        Resim URL
                        <MedyaSecici
                          value={editForm.resimUrl ?? ''}
                          onChange={(url) => setEditForm({ ...editForm, resimUrl: url })}
                        />
                      </label>
                      <label>
                        Yayın Tarihi
                        <input
                          type="date"
                          value={editForm.yayinTarihi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, yayinTarihi: e.target.value })
                          }
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
                  <td>{item.baslik}</td>
                  <td>{item.yayinTarihi.slice(0, 10)}</td>
                  <td>{item.updatedBy ?? '-'}</td>
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

export default MakalelerPage;
