import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createBasvuruTuru,
  deleteBasvuruTuru,
  getBasvuruTurleri,
  updateBasvuruTuru,
} from './api';
import type { BasvuruTuruInput } from './api';
import MedyaSecici from './MedyaSecici';
import TelefonOnizleme from './TelefonOnizleme';
import type { AdminBasvuruTuru, EkBilgiAlani, GerekliBelge } from './types';

interface Props {
  canManage: boolean;
}

const emptyForm: BasvuruTuruInput = {
  baslik: '',
  aciklama: '',
  gorselUrl: '',
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
      gorselUrl: item.gorselUrl ?? '',
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

      <div className="guncel-sayfa-govde">
      <div className="guncel-sol">
      {canManage && <h3 className="bolum-baslik">1. Bölüm: Ekleme</h3>}
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
            <label>
              Görsel (opsiyonel)
              <MedyaSecici
                value={form.gorselUrl ?? ''}
                onChange={(url) => setForm({ ...form, gorselUrl: url })}
                placeholder="https://..."
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

      <h3 className="bolum-baslik">2. Bölüm: Eklenmiş Kayıtlar</h3>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Görsel</th>
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
                  <td colSpan={canManage ? 6 : 5}>
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
                      <label>
                        Görsel (opsiyonel)
                        <MedyaSecici
                          value={editForm.gorselUrl ?? ''}
                          onChange={(url) => setEditForm({ ...editForm, gorselUrl: url })}
                          placeholder="https://..."
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
                  <td>
                    {item.gorselUrl && (
                      <img
                        src={item.gorselUrl}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                      />
                    )}
                  </td>
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

      <div className="guncel-sag">
        <h3 className="bolum-baslik">3. Bölüm: Mobil Uygulamadaki Görüntüsü</h3>
        <TelefonOnizleme baslik={form.baslik || 'Başvuru Türü'}>
          {form.gorselUrl ? <img src={form.gorselUrl} alt="" /> : null}
          {form.aciklama ? <p>{form.aciklama}</p> : null}
          {form.gerekliBelgeler.length > 0 && (
            <div className="genel-onizleme-bolum">
              <span className="genel-onizleme-bolum-baslik">Gerekli Belgeler</span>
              {form.gerekliBelgeler.map((belge, i) => (
                <div className="genel-onizleme-satir" key={i}>
                  <span className="genel-onizleme-satir-etiket">{belge.etiket}</span>
                  {belge.aciklama && (
                    <span className="genel-onizleme-satir-ipucu">{belge.aciklama}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {form.ekBilgiAlanlari.length > 0 && (
            <div className="genel-onizleme-bolum">
              <span className="genel-onizleme-bolum-baslik">İstenen Bilgiler</span>
              {form.ekBilgiAlanlari.map((alan, i) => (
                <div className="genel-onizleme-satir" key={i}>
                  <span className="genel-onizleme-satir-etiket">
                    {alan.etiket}
                    {alan.zorunlu ? ' *' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
          <span className="genel-onizleme-buton">Başvur</span>
        </TelefonOnizleme>
      </div>
      </div>
    </div>
  );
}

export default BasvuruTurleriPage;
