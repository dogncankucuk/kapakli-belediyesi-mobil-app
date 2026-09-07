import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createElektrikKesintisi,
  deleteElektrikKesintisi,
  getElektrikKesintileri,
  updateElektrikKesintisi,
} from './api';
import type { ElektrikKesintisiInput } from './api';
import { bugununTarihi } from './tarih';
import TelefonOnizleme from './TelefonOnizleme';
import type { AdminElektrikKesintisi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: ElektrikKesintisiInput = { mahalle: '', tarih: '', aciklama: '' };

function ElektrikPage({ canManage }: Props) {
  const [items, setItems] = useState<AdminElektrikKesintisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ElektrikKesintisiInput>({
    ...emptyForm,
    tarih: bugununTarihi(),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ElektrikKesintisiInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getElektrikKesintileri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createElektrikKesintisi(form);
      setForm({ ...emptyForm, tarih: bugununTarihi() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi oluşturulamadı');
    }
  }

  function startEdit(item: AdminElektrikKesintisi) {
    setEditingId(item.id);
    setEditForm({
      mahalle: item.mahalle,
      tarih: item.tarih.slice(0, 10),
      aciklama: item.aciklama,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateElektrikKesintisi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu elektrik kesintisi kaydı silinsin mi?')) return;
    setError(null);
    try {
      await deleteElektrikKesintisi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Elektrik kesintisi silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Elektrik Kesintileri</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Elektrik Kesintisi</h3>
          <label>
            Mahalle
            <input
              value={form.mahalle}
              onChange={(e) => setForm({ ...form, mahalle: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
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
            Açıklama
            <input
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <button type="submit">Kaydet</button>
        </form>
      )}

      <h3 className="bolum-baslik">2. Bölüm: Eklenmiş Kayıtlar</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mahalle</th>
              <th>Tarih</th>
              <th>Açıklama</th>
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
                        Mahalle
                        <input
                          value={editForm.mahalle}
                          onChange={(e) => setEditForm({ ...editForm, mahalle: e.target.value })}
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
                        Açıklama
                        <input
                          value={editForm.aciklama}
                          onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
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
                  <td>{item.mahalle}</td>
                  <td>{item.tarih.slice(0, 10)}</td>
                  <td>{item.aciklama}</td>
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

      <div className="guncel-sag">
        <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik="Elektrik Kesintileri">
          {items.length === 0 && (
            <span className="genel-onizleme-bos">Henüz elektrik kesintisi eklenmemiş</span>
          )}
          {items.map((item) => (
            <div className="genel-onizleme-satir" key={item.id}>
              <span className="genel-onizleme-satir-etiket">
                {item.tarih.slice(0, 10)} · {item.mahalle}
              </span>
              <span className="genel-onizleme-satir-ipucu">{item.aciklama}</span>
            </div>
          ))}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default ElektrikPage;
