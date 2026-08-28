import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createIhale,
  deleteIhale,
  getIhaleler,
  updateIhale,
} from './api';
import type { ArticleContentInput } from './api';
import MedyaSeciciCoklu from './MedyaSeciciCoklu';
import { IcerikKartiOnizleme, OnizlemeBosMetin, TelefonOnizleme } from './MobilOnizleme';
import { bugununTarihi } from './tarih';
import type { Ihale } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: ArticleContentInput = {
  baslik: '',
  icerik: '',
  resimUrlleri: [],
  dosyaUrlleri: [],
  youtubeUrl: '',
  yayinTarihi: '',
};

function IhalelerPage({ canManage }: Props) {
  const [items, setItems] = useState<Ihale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleContentInput>({ ...emptyForm, yayinTarihi: bugununTarihi() });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ArticleContentInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getIhaleler());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İhaleler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createIhale({ ...form, youtubeUrl: form.youtubeUrl || null });
      setForm({ ...emptyForm, yayinTarihi: bugununTarihi() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İhale oluşturulamadı');
    }
  }

  function startEdit(item: Ihale) {
    setEditingId(item.id);
    setEditForm({
      baslik: item.baslik,
      icerik: item.icerik,
      resimUrlleri: item.resimUrlleri,
      dosyaUrlleri: item.dosyaUrlleri,
      youtubeUrl: item.youtubeUrl ?? '',
      yayinTarihi: item.yayinTarihi.slice(0, 10),
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateIhale(id, { ...editForm, youtubeUrl: editForm.youtubeUrl || null });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İhale güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu ihale silinsin mi?')) return;
    setError(null);
    try {
      await deleteIhale(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İhale silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>İhaleler</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni İhale</h3>
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
            İçerik
            <textarea
              value={form.icerik}
              onChange={(e) => setForm({ ...form, icerik: e.target.value })}
              placeholder="Lütfen veri girişi yapınız"
              required
            />
          </label>
          <label>
            Resim URL (birden fazla seçilebilir)
            <MedyaSeciciCoklu
              value={form.resimUrlleri}
              onChange={(resimUrlleri) => setForm({ ...form, resimUrlleri })}
            />
          </label>
          <label>
            PDF / Belge URL (birden fazla seçilebilir)
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

      <h3 className="bolum-baslik">2. Bölüm: Eklenmiş Kayıtlar</h3>
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
                        Resim URL (birden fazla seçilebilir)
                        <MedyaSeciciCoklu
                          value={editForm.resimUrlleri}
                          onChange={(resimUrlleri) => setEditForm({ ...editForm, resimUrlleri })}
                        />
                      </label>
                      <label>
                        PDF / Belge URL (birden fazla seçilebilir)
                        <MedyaSeciciCoklu
                          value={editForm.dosyaUrlleri}
                          onChange={(dosyaUrlleri) => setEditForm({ ...editForm, dosyaUrlleri })}
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

      {canManage && (
        <div className="guncel-sag">
          <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
          <TelefonOnizleme baslik="İhaleler">
            {items.length === 0 && <OnizlemeBosMetin>İçerik bulunamadı.</OnizlemeBosMetin>}
            {items.map((item) => (
              <IcerikKartiOnizleme
                key={item.id}
                baslik={item.baslik}
                icerik={item.icerik}
                resimUrlleri={item.resimUrlleri}
                tarih={item.yayinTarihi}
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

export default IhalelerPage;
