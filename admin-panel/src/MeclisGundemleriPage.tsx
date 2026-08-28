import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createMeclisGundemi,
  deleteMeclisGundemi,
  getMeclisGundemleri,
  updateMeclisGundemi,
} from './api';
import type { MeclisGundemiInput } from './api';
import MedyaSeciciCoklu from './MedyaSeciciCoklu';
import { IcerikKartiOnizleme, OnizlemeBosMetin, TelefonOnizleme } from './MobilOnizleme';
import { bugununTarihi } from './tarih';
import type { MeclisGundemi } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: MeclisGundemiInput = {
  baslik: '',
  tarih: '',
  icerik: '',
  dosyaUrlleri: [],
  youtubeUrl: '',
};

function MeclisGundemleriPage({ canManage }: Props) {
  const [items, setItems] = useState<MeclisGundemi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MeclisGundemiInput>({ ...emptyForm, tarih: bugununTarihi() });
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
      await createMeclisGundemi({ ...form, youtubeUrl: form.youtubeUrl || null });
      setForm({ ...emptyForm, tarih: bugununTarihi() });
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
      icerik: item.icerik,
      dosyaUrlleri: item.dosyaUrlleri,
      youtubeUrl: item.youtubeUrl ?? '',
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateMeclisGundemi(id, { ...editForm, youtubeUrl: editForm.youtubeUrl || null });
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

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Meclis Gündemi</h3>
          <label>
            Başlık
            <input
              value={form.baslik}
              onChange={(e) => setForm({ ...form, baslik: e.target.value })}
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
            Metin / Gündem İçeriği
            <textarea
              value={form.icerik}
              onChange={(e) => setForm({ ...form, icerik: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
            />
          </label>
          <label>
            Dosya URL (birden fazla seçilebilir)
            <MedyaSeciciCoklu
              value={form.dosyaUrlleri}
              onChange={(dosyaUrlleri) => setForm({ ...form, dosyaUrlleri })}
            />
          </label>
          <label>
            YouTube Video URL (opsiyonel)
            <input
              value={form.youtubeUrl ?? ''}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
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
                        Metin / Gündem İçeriği
                        <textarea
                          value={editForm.icerik}
                          onChange={(e) => setEditForm({ ...editForm, icerik: e.target.value })}
                        />
                      </label>
                      <label>
                        Dosya URL (birden fazla seçilebilir)
                        <MedyaSeciciCoklu
                          value={editForm.dosyaUrlleri}
                          onChange={(dosyaUrlleri) =>
                            setEditForm({ ...editForm, dosyaUrlleri })
                          }
                        />
                      </label>
                      <label>
                        YouTube Video URL (opsiyonel)
                        <input
                          value={editForm.youtubeUrl ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
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

      {canManage && (
        <div className="guncel-sag">
          <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
          <TelefonOnizleme baslik="Meclis Gündemleri">
            {items.length === 0 && <OnizlemeBosMetin>Henüz gündem eklenmemiş.</OnizlemeBosMetin>}
            {items.map((item) => (
              <IcerikKartiOnizleme
                key={item.id}
                baslik={item.baslik}
                icerik={item.icerik}
                tarih={item.tarih}
                dosyaUrlleri={item.dosyaUrlleri}
                youtubeUrl={item.youtubeUrl}
              />
            ))}
          </TelefonOnizleme>
        </div>
      )}
      </div>
    </div>
  );
}

export default MeclisGundemleriPage;
