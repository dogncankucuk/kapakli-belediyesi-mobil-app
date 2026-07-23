import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createUlasimHatti,
  deleteUlasimHatti,
  getUlasimHatlari,
  updateUlasimHatti,
} from './api';
import type { UlasimHattiInput } from './api';
import type { UlasimHatti } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: UlasimHattiInput = { hatAdi: '', guzergah: '', durum: '', canli: false };

function UlasimHatlariPage({ canManage }: Props) {
  const [items, setItems] = useState<UlasimHatti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UlasimHattiInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UlasimHattiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getUlasimHatlari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hatlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUlasimHatti(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat oluşturulamadı');
    }
  }

  function startEdit(item: UlasimHatti) {
    setEditingId(item.id);
    setEditForm({
      hatAdi: item.hatAdi,
      guzergah: item.guzergah,
      durum: item.durum,
      canli: item.canli,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateUlasimHatti(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu hat silinsin mi?')) return;
    setError(null);
    try {
      await deleteUlasimHatti(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hat silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Ulaşım Hatları</h2>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Hat</h3>
          <label>
            Hat Adı
            <input
              value={form.hatAdi}
              onChange={(e) => setForm({ ...form, hatAdi: e.target.value })}
              required
            />
          </label>
          <label>
            Güzergah
            <input
              value={form.guzergah}
              onChange={(e) => setForm({ ...form, guzergah: e.target.value })}
              required
            />
          </label>
          <label>
            Durum Metni
            <input
              value={form.durum}
              onChange={(e) => setForm({ ...form, durum: e.target.value })}
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.canli}
              onChange={(e) => setForm({ ...form, canli: e.target.checked })}
            />
            Canlı takip
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
              <th>Hat Adı</th>
              <th>Güzergah</th>
              <th>Durum</th>
              <th>Canlı</th>
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
                        Hat Adı
                        <input
                          value={editForm.hatAdi}
                          onChange={(e) => setEditForm({ ...editForm, hatAdi: e.target.value })}
                        />
                      </label>
                      <label>
                        Güzergah
                        <input
                          value={editForm.guzergah}
                          onChange={(e) => setEditForm({ ...editForm, guzergah: e.target.value })}
                        />
                      </label>
                      <label>
                        Durum Metni
                        <input
                          value={editForm.durum}
                          onChange={(e) => setEditForm({ ...editForm, durum: e.target.value })}
                        />
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.canli}
                          onChange={(e) => setEditForm({ ...editForm, canli: e.target.checked })}
                        />
                        Canlı takip
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
                  <td>{item.hatAdi}</td>
                  <td>{item.guzergah}</td>
                  <td>{item.durum}</td>
                  <td>{item.canli ? 'Evet' : 'Hayır'}</td>
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

export default UlasimHatlariPage;
