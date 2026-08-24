import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createUlasimSecenegi,
  deleteUlasimSecenegi,
  getUlasimSecenekleri,
  updateUlasimSecenegi,
} from './api';
import type { UlasimSecenegiInput } from './api';
import type { UlasimSecenegi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: UlasimSecenegiInput = {
  baslik: '',
  aciklama: '',
  url: '',
};

function UlasimHizmetleriPage({ canManage }: Props) {
  const [items, setItems] = useState<UlasimSecenegi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UlasimSecenegiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UlasimSecenegiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getUlasimSecenekleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seçenekler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUlasimSecenegi(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seçenek oluşturulamadı');
    }
  }

  function startEdit(item: UlasimSecenegi) {
    setEditingId(item.id);
    setEditForm({ baslik: item.baslik, aciklama: item.aciklama, url: item.url });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateUlasimSecenegi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seçenek güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu seçenek silinsin mi?')) return;
    setError(null);
    try {
      await deleteUlasimSecenegi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seçenek silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Ulaşım Hizmetleri</h2>
      <p>
        Mobil uygulamadaki "Ulaşım Hizmetleri" ekranında listelenen
        seçenekleri buradan yönetin (ör. Tekirdağkart yükleme, Otobüs Takip).
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Seçenek</h3>
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
              required
            />
          </label>
          <label>
            Açıklama
            <input
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
              required
            />
          </label>
          <label>
            Bağlantı (URL)
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
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
              <th>Açıklama</th>
              <th>Bağlantı</th>
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
                        Açıklama
                        <input
                          value={editForm.aciklama}
                          onChange={(e) =>
                            setEditForm({ ...editForm, aciklama: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Bağlantı (URL)
                        <input
                          value={editForm.url}
                          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
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
                  <td>{item.aciklama}</td>
                  <td>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.url}
                    </a>
                  </td>
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

export default UlasimHizmetleriPage;
