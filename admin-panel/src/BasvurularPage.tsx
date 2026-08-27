import { Fragment, useEffect, useState } from 'react';
import { deleteBasvuru, getBasvurular, updateBasvuruDurum } from './api';
import type { AdminBasvuru, BasvuruDurumu } from './types';
import { basvuruDurumLabels } from './types';

interface Props {
  canManage: boolean;
}

const durumSecenekleri: BasvuruDurumu[] = ['beklemede', 'onaylandi', 'reddedildi'];

function formatTarih(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDogumTarihi(iso: string): string {
  const [yil, ay, gun] = iso.split('-').map(Number);
  return new Date(yil, ay - 1, gun).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BasvurularPage({ canManage }: Props) {
  const [items, setItems] = useState<AdminBasvuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Reddedildi secildiginde kaydetmeden once redSebebi girilmesi gerekiyor -
  // satir bazinda taslak red sebebini burada tutuyoruz, onaylanana kadar
  // PATCH atilmiyor.
  const [redTaslaklari, setRedTaslaklari] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getBasvurular());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleDurumChange(id: string, durum: BasvuruDurumu) {
    if (durum === 'reddedildi') {
      setRedTaslaklari({ ...redTaslaklari, [id]: '' });
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await updateBasvuruDurum(id, { durum });
      const { [id]: _silinen, ...kalanlar } = redTaslaklari;
      setRedTaslaklari(kalanlar);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru güncellenemedi');
    } finally {
      setBusyId(null);
    }
  }

  async function handleRedKaydet(id: string) {
    const redSebebi = redTaslaklari[id]?.trim();
    if (!redSebebi) return;
    setBusyId(id);
    setError(null);
    try {
      await updateBasvuruDurum(id, { durum: 'reddedildi', redSebebi });
      const { [id]: _silinen, ...kalanlar } = redTaslaklari;
      setRedTaslaklari(kalanlar);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru güncellenemedi');
    } finally {
      setBusyId(null);
    }
  }

  function handleRedVazgec(id: string) {
    const { [id]: _silinen, ...kalanlar } = redTaslaklari;
    setRedTaslaklari(kalanlar);
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu başvuru silinsin mi?')) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteBasvuru(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru silinemedi');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <h2>Başvurular</h2>
      <p className="hint">
        Vatandaşların başvuru türleri üzerinden yaptığı başvurular. Durumlarını buradan
        güncelleyebilir, detaylarını inceleyebilirsiniz.
      </p>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Başvuru Türü</th>
              <th>Ad Soyad</th>
              <th>Kimlik No</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Detay</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const expanded = expandedId === item.id;
              const redTaslagi = redTaslaklari[item.id];
              return (
                <Fragment key={item.id}>
                  <tr>
                    <td>{item.basvuruTuruAdi}</td>
                    <td>{item.adSoyad}</td>
                    <td>{item.kimlikNo}</td>
                    <td>
                      {canManage ? (
                        <select
                          value={redTaslagi !== undefined ? 'reddedildi' : item.durum}
                          disabled={busyId === item.id}
                          onChange={(e) =>
                            handleDurumChange(item.id, e.target.value as BasvuruDurumu)
                          }
                        >
                          {durumSecenekleri.map((durum) => (
                            <option key={durum} value={durum}>
                              {basvuruDurumLabels[durum]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        basvuruDurumLabels[item.durum]
                      )}
                      {redTaslagi !== undefined && (
                        <div className="row-actions">
                          <input
                            value={redTaslagi}
                            placeholder="Red sebebi..."
                            disabled={busyId === item.id}
                            onChange={(e) =>
                              setRedTaslaklari({ ...redTaslaklari, [item.id]: e.target.value })
                            }
                          />
                          <button
                            type="button"
                            disabled={busyId === item.id || !redTaslagi.trim()}
                            onClick={() => handleRedKaydet(item.id)}
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            disabled={busyId === item.id}
                            onClick={() => handleRedVazgec(item.id)}
                          >
                            Vazgeç
                          </button>
                        </div>
                      )}
                    </td>
                    <td>{formatTarih(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                      >
                        {expanded ? 'Gizle' : 'Görüntüle'}
                      </button>
                    </td>
                    {canManage && (
                      <td className="row-actions">
                        <button disabled={busyId === item.id} onClick={() => handleDelete(item.id)}>
                          Sil
                        </button>
                      </td>
                    )}
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={canManage ? 7 : 6}>
                        <div className="edit-row">
                          <p>
                            <strong>Adres:</strong> {item.adres}
                          </p>
                          <p>
                            <strong>Doğum Tarihi:</strong> {formatDogumTarihi(item.dogumTarihi)}
                          </p>
                          {item.durum === 'reddedildi' && item.redSebebi && (
                            <p>
                              <strong>Red Sebebi:</strong> {item.redSebebi}
                            </p>
                          )}
                          {item.ekBilgiler.length > 0 && (
                            <div>
                              <strong>Ek Bilgiler:</strong>
                              <ul>
                                {item.ekBilgiler.map((ek, index) => (
                                  <li key={index}>
                                    {ek.etiket}: {ek.deger}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.belgeler.length > 0 && (
                            <div>
                              <strong>Belgeler:</strong>
                              <div className="request-photo-row">
                                {item.belgeler.map((belge, index) =>
                                  belge.mimeType.startsWith('image/') ? (
                                    <img
                                      key={index}
                                      src={belge.url}
                                      alt={belge.etiket}
                                      className="request-photo-thumb"
                                    />
                                  ) : (
                                    <a
                                      key={index}
                                      href={belge.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {belge.etiket || 'Belgeyi Görüntüle'}
                                    </a>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={canManage ? 7 : 6}>Henüz başvuru yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BasvurularPage;
