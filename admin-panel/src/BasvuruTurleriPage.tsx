import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createBasvuruTuru,
  deleteBasvuruTuru,
  getBasvuruTurleri,
  updateBasvuruTuru,
} from './api';
import type { BasvuruTuruInput } from './api';
import type { AdminBasvuruTuru, EkBilgiAlani, GerekliBelge } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: BasvuruTuruInput = {
  baslik: '',
  aciklama: '',
  aktif: true,
  ekBilgiAlanlari: [],
  gerekliBelgeler: [],
};

interface EkBilgiAlanlariEditorProps {
  value: EkBilgiAlani[];
  onChange: (value: EkBilgiAlani[]) => void;
}

function EkBilgiAlanlariEditor({ value, onChange }: EkBilgiAlanlariEditorProps) {
  const [etiket, setEtiket] = useState('');
  const [zorunlu, setZorunlu] = useState(false);

  function ekle() {
    if (!etiket) return;
    const mevcut = value.some(
      (v) => v.etiket.trim().toLowerCase() === etiket.trim().toLowerCase(),
    );
    if (mevcut) return;
    onChange([...value, { etiket, zorunlu }]);
    setEtiket('');
    setZorunlu(false);
  }

  function sil(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="kalkis-editor">
      <div className="kalkis-ekle-satiri">
        <input
          value={etiket}
          onChange={(e) => setEtiket(e.target.value)}
          placeholder="Ör. TC Kimlik No"
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={zorunlu}
            onChange={(e) => setZorunlu(e.target.checked)}
          />
          Zorunlu
        </label>
        <button type="button" onClick={ekle}>
          + Ekle
        </button>
      </div>
      <div className="kalkis-chip-list">
        {value.length === 0 && (
          <span className="kalkis-bos">Henüz alan eklenmedi</span>
        )}
        {value.map((v, index) => (
          <span key={index} className="kalkis-chip">
            <button type="button" disabled>
              {v.etiket}
              {v.zorunlu ? ' *' : ''}
            </button>
            <button
              type="button"
              className="kalkis-chip-sil"
              onClick={() => sil(index)}
              aria-label="Sil"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

interface GerekliBelgelerEditorProps {
  value: GerekliBelge[];
  onChange: (value: GerekliBelge[]) => void;
}

function GerekliBelgelerEditor({ value, onChange }: GerekliBelgelerEditorProps) {
  const [etiket, setEtiket] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [zorunlu, setZorunlu] = useState(false);

  function ekle() {
    if (!etiket) return;
    const mevcut = value.some(
      (v) => v.etiket.trim().toLowerCase() === etiket.trim().toLowerCase(),
    );
    if (mevcut) return;
    onChange([...value, { etiket, aciklama: aciklama || null, zorunlu }]);
    setEtiket('');
    setAciklama('');
    setZorunlu(false);
  }

  function sil(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="kalkis-editor">
      <div className="kalkis-ekle-satiri">
        <input
          value={etiket}
          onChange={(e) => setEtiket(e.target.value)}
          placeholder="Ör. Kimlik Fotokopisi"
        />
        <input
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Açıklama (opsiyonel)"
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={zorunlu}
            onChange={(e) => setZorunlu(e.target.checked)}
          />
          Zorunlu
        </label>
        <button type="button" onClick={ekle}>
          + Ekle
        </button>
      </div>
      <div className="kalkis-chip-list">
        {value.length === 0 && (
          <span className="kalkis-bos">Henüz belge eklenmedi</span>
        )}
        {value.map((v, index) => (
          <span key={index} className="kalkis-chip">
            <button type="button" disabled title={v.aciklama ?? undefined}>
              {v.etiket}
              {v.zorunlu ? ' *' : ''}
            </button>
            <button
              type="button"
              className="kalkis-chip-sil"
              onClick={() => sil(index)}
              aria-label="Sil"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function BasvuruTurleriPage({ canManage }: Props) {
  const [items, setItems] = useState<AdminBasvuruTuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BasvuruTuruInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BasvuruTuruInput>(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getBasvuruTurleri());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru türleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBasvuruTuru(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru türü oluşturulamadı');
    }
  }

  function startEdit(item: AdminBasvuruTuru) {
    setEditingId(item.id);
    setEditForm({
      baslik: item.baslik,
      aciklama: item.aciklama ?? '',
      aktif: item.aktif,
      ekBilgiAlanlari: item.ekBilgiAlanlari,
      gerekliBelgeler: item.gerekliBelgeler,
    });
  }

  async function handleUpdate(id: string) {
    setError(null);
    try {
      await updateBasvuruTuru(id, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru türü güncellenemedi');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu başvuru türü silinsin mi?')) return;
    setError(null);
    try {
      await deleteBasvuruTuru(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru türü silinemedi');
    }
  }

  return (
    <div className="page">
      <h2>Başvuru Türleri</h2>
      <p>
        Vatandaşların mobil uygulama üzerinden yapabileceği başvuru türlerini
        buradan yönetin.
      </p>
      {error && <p className="error-message">{error}</p>}

      {canManage && (
        <form className="inline-form" onSubmit={handleCreate}>
          <h3>Yeni Başvuru Türü</h3>
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
            Açıklama (opsiyonel)
            <input
              value={form.aciklama}
              onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
            />
            Aktif
          </label>
          <label className="kalkis-label">
            Ek Bilgi Alanları (opsiyonel)
            <EkBilgiAlanlariEditor
              value={form.ekBilgiAlanlari}
              onChange={(ekBilgiAlanlari) => setForm({ ...form, ekBilgiAlanlari })}
            />
          </label>
          <label className="kalkis-label">
            Gerekli Belgeler (opsiyonel)
            <GerekliBelgelerEditor
              value={form.gerekliBelgeler}
              onChange={(gerekliBelgeler) => setForm({ ...form, gerekliBelgeler })}
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
              <th>Aktif</th>
              <th>Ek Bilgi Alanları</th>
              <th>Gerekli Belgeler</th>
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
                          onChange={(e) =>
                            setEditForm({ ...editForm, baslik: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Açıklama (opsiyonel)
                        <input
                          value={editForm.aciklama}
                          onChange={(e) =>
                            setEditForm({ ...editForm, aciklama: e.target.value })
                          }
                        />
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.aktif}
                          onChange={(e) =>
                            setEditForm({ ...editForm, aktif: e.target.checked })
                          }
                        />
                        Aktif
                      </label>
                      <label className="kalkis-label">
                        Ek Bilgi Alanları (opsiyonel)
                        <EkBilgiAlanlariEditor
                          value={editForm.ekBilgiAlanlari}
                          onChange={(ekBilgiAlanlari) =>
                            setEditForm({ ...editForm, ekBilgiAlanlari })
                          }
                        />
                      </label>
                      <label className="kalkis-label">
                        Gerekli Belgeler (opsiyonel)
                        <GerekliBelgelerEditor
                          value={editForm.gerekliBelgeler}
                          onChange={(gerekliBelgeler) =>
                            setEditForm({ ...editForm, gerekliBelgeler })
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
                  <td>{item.aktif ? 'Evet' : 'Hayır'}</td>
                  <td>{item.ekBilgiAlanlari.length} alan</td>
                  <td>{item.gerekliBelgeler.length} belge</td>
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

export default BasvuruTurleriPage;
