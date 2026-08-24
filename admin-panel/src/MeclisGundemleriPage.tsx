import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createMeclisGundemi,
  deleteMeclisGundemi,
  getMeclisGundemleri,
  updateMeclisGundemi,
} from './api';
import type { MeclisGundemiInput } from './api';
import MedyaSecici from './MedyaSecici';
import type { MeclisGundemi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: MeclisGundemiInput = {
  baslik: '',
  tarih: '',
  dosyaUrl: '',
};

function MeclisGundemleriPage({ canManage }: Props) {
  const [items, setItems] = useState<MeclisGundemi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MeclisGundemiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MeclisGundemiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMeclisGundemleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meclis gündemleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMeclisGundemi({ ...form, dosyaUrl: form.dosyaUrl || null });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meclis gündemi oluşturulamadı');
    }
  }

  function startEdit(item: MeclisGundemi) {
    setEditingId(item.id);
    setEditForm({
      baslik: item.baslik,
      tarih: item.tarih.slice(0, 10),
      dosyaUrl: item.dosyaUrl ?? '',
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateMeclisGundemi(id, { ...editForm, dosyaUrl: editForm.dosyaUrl || null });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meclis gündemi güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu meclis gündemi silinsin mi?')) return;
    setError(null);
    try {
      await deleteMeclisGundemi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meclis gündemi silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Meclis Gündemleri</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Meclis Gündemi</h3>
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
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
            Dosya URL
            <MedyaSecici
              value={form.dosyaUrl ?? ''}
              onChange={(url) => setForm({ ...form, dosyaUrl: url })}
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
              <th>Tarih</th>
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
                        Tarih
                        <input
                          type="date"
                          value={editForm.tarih}
                          onChange={(e) => setEditForm({ ...editForm, tarih: e.target.value })}
                        />
                      </label>
                      <label>
                        Dosya URL
                        <MedyaSecici
                          value={editForm.dosyaUrl ?? ''}
                          onChange={(url) =>
                            setEditForm({ ...editForm, dosyaUrl: url })
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
                  <td>{item.tarih.slice(0, 10)}</td>
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

export default MeclisGundemleriPage;
