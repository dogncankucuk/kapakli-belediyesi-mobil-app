import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createKazi, deleteKazi, getKaziCalismalari, updateKazi } from './api';
import type { KaziInput } from './api';
import { bugununTarihi } from './tarih';
import TelefonOnizleme from './TelefonOnizleme';
import type { AdminKazi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: KaziInput = {
  mahalle: '',
  baslangicTarihi: '',
  sureGun: 1,
  saat: '',
  aciklama: '',
};

function FenIsleriPage({ canManage }: Props) {
  const [items, setItems] = useState<AdminKazi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<KaziInput>({ ...emptyForm, baslangicTarihi: bugununTarihi() });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<KaziInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getKaziCalismalari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kazı çalışmaları yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createKazi(form);
      setForm({ ...emptyForm, baslangicTarihi: bugununTarihi() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kazı çalışması oluşturulamadı');
    }
  }

  function startEdit(item: AdminKazi) {
    setEditingId(item.id);
    setEditForm({
      mahalle: item.mahalle,
      baslangicTarihi: item.baslangicTarihi.slice(0, 10),
      sureGun: item.sureGun,
      saat: item.saat,
      aciklama: item.aciklama,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateKazi(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kazı çalışması güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kazı çalışması silinsin mi?')) return;
    setError(null);
    try {
      await deleteKazi(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kazı çalışması silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Kazı Çalışmaları</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Kazı Çalışması</h3>
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
            Başlangıç Tarihi
            <input
              type="date"
              value={form.baslangicTarihi}
              onChange={(e) => setForm({ ...form, baslangicTarihi: e.target.value })}
              required
            />
          </label>
          <label>
            Süre (Gün)
            <input
              type="number"
              min={1}
              value={form.sureGun}
              onChange={(e) => setForm({ ...form, sureGun: Number(e.target.value) })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Saat
            <input
              value={form.saat}
              onChange={(e) => setForm({ ...form, saat: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Açıklama
            <textarea
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
              <th>Başlangıç Tarihi</th>
              <th>Süre (Gün)</th>
              <th>Saat</th>
              <th>Açıklama</th>
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
                        Mahalle
                        <input
                          value={editForm.mahalle}
                          onChange={(e) => setEditForm({ ...editForm, mahalle: e.target.value })}
                        />
                      </label>
                      <label>
                        Başlangıç Tarihi
                        <input
                          type="date"
                          value={editForm.baslangicTarihi}
                          onChange={(e) =>
                            setEditForm({ ...editForm, baslangicTarihi: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Süre (Gün)
                        <input
                          type="number"
                          min={1}
                          value={editForm.sureGun}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sureGun: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label>
                        Saat
                        <input
                          value={editForm.saat}
                          onChange={(e) => setEditForm({ ...editForm, saat: e.target.value })}
                        />
                      </label>
                      <label>
                        Açıklama
                        <textarea
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
                  <td>{item.baslangicTarihi.slice(0, 10)}</td>
                  <td>{item.sureGun}</td>
                  <td>{item.saat}</td>
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
        <TelefonOnizleme baslik="Kazı Çalışmaları">
          {items.length === 0 && (
            <span className="genel-onizleme-bos">Henüz kazı çalışması eklenmemiş</span>
          )}
          {items.map((item) => (
            <div className="genel-onizleme-bolum" key={item.id}>
              <span className="genel-onizleme-bolum-baslik">
                {item.mahalle} · {item.baslangicTarihi.slice(0, 10)}
              </span>
              <div className="genel-onizleme-satir">
                <span className="genel-onizleme-satir-ipucu">
                  {item.sureGun} gün · {item.saat}
                </span>
                <span className="genel-onizleme-satir-ipucu">{item.aciklama}</span>
              </div>
            </div>
          ))}
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default FenIsleriPage;
