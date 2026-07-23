import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from './api';
import type { AnnouncementInput } from './api';
import type { Announcement } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: AnnouncementInput = {
  baslik: '',
  icerik: '',
  resimUrl: '',
  yayinTarihi: '',
  kategori: '',
};

function AnnouncementsPage({ canManage }: Props) {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AnnouncementInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getAnnouncements());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAnnouncement({ ...form, resimUrl: form.resimUrl || null });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyuru oluşturulamadı');
    }
  }

  function startEdit(item: Announcement) {
    setEditingId(item.id);
    setEditForm({
      baslik: item.baslik,
      icerik: item.icerik,
      resimUrl: item.resimUrl ?? '',
      yayinTarihi: item.yayinTarihi.slice(0, 10),
      kategori: item.kategori,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateAnnouncement(id, { ...editForm, resimUrl: editForm.resimUrl || null });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyuru güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu duyuru silinsin mi?')) return;
    setError(null);
    try {
      await deleteAnnouncement(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duyuru silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Duyurular</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Duyuru</h3>
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
            <input
              value={form.resimUrl ?? ''}
              onChange={(e) => setForm({ ...form, resimUrl: e.target.value })}
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
          <label>
            Kategori
            <input
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
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
              <th>Kategori</th>
              <th>Yayın Tarihi</th>
              <th>Son Güncelleyen</th>
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
                        <input
                          value={editForm.resimUrl ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, resimUrl: e.target.value })}
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
                      <label>
                        Kategori
                        <input
                          value={editForm.kategori}
                          onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
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
                  <td>{item.kategori}</td>
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

export default AnnouncementsPage;
