import { Fragment, useEffect, useState } from 'react';
import { getRequests, updateRequest } from './api';
import type { TalepDurumu, TalepRequest } from './types';
import { talepDurumLabels } from './types';

interface Props {
  canManage: boolean;
}

const durumSecenekleri: TalepDurumu[] = ['beklemede', 'islemde', 'tamamlandi'];

const yogunlukEtiketleri = ['Hafif', 'Orta', 'Yoğun', 'Şiddetli'];

function formatTarih(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function RequestsPage({ canManage }: Props) {
  const [items, setItems] = useState<TalepRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talepler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleDurumChange(id: string, durum: TalepDurumu) {
    setUpdatingId(id);
    setError(null);
    try {
      await updateRequest(id, durum);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep güncellenemedi');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <h2>Talepler</h2>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p>Henüz talep gelmemiş.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Ad Soyad</th>
              <th>Telefon</th>
              <th>Durum</th>
              <th>Detay</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const expanded = expandedId === item.id;
              const detayVar =
                item.lat != null ||
                item.lng != null ||
                item.fotograflar.length > 0 ||
                item.yogunluk != null ||
                item.ekDosyaUrl;
              return (
                <Fragment key={item.id}>
                  <tr>
                    <td>{formatTarih(item.createdAt)}</td>
                    <td>{item.kategori}</td>
                    <td>{item.aciklama}</td>
                    <td>{item.adSoyad}</td>
                    <td>{item.telefon}</td>
                    <td>{talepDurumLabels[item.durum]}</td>
                    <td>
                      {detayVar && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                        >
                          {expanded ? 'Gizle' : 'Görüntüle'}
                        </button>
                      )}
                    </td>
                    {canManage && (
                      <td className="row-actions">
                        <select
                          value={item.durum}
                          disabled={updatingId === item.id}
                          onChange={(e) =>
                            handleDurumChange(item.id, e.target.value as TalepDurumu)
                          }
                        >
                          {durumSecenekleri.map((durum) => (
                            <option key={durum} value={durum}>
                              {talepDurumLabels[durum]}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={canManage ? 8 : 7}>
                        <div className="edit-row">
                          {(item.lat != null || item.lng != null) && (
                            <p>
                              <strong>Konum:</strong> {item.lat?.toFixed(5)},{' '}
                              {item.lng?.toFixed(5)}{' '}
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=17/${item.lat}/${item.lng}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Haritada gör
                              </a>
                            </p>
                          )}
                          {item.yogunluk != null && (
                            <p>
                              <strong>Yoğunluk:</strong>{' '}
                              {yogunlukEtiketleri[item.yogunluk] ?? item.yogunluk}
                            </p>
                          )}
                          {item.ekDosyaUrl && (
                            <p>
                              <strong>Ek Dosya:</strong>{' '}
                              <a href={item.ekDosyaUrl} target="_blank" rel="noreferrer">
                                {item.ekDosyaUrl}
                              </a>
                            </p>
                          )}
                          {item.fotograflar.length > 0 && (
                            <div>
                              <strong>Fotoğraflar:</strong>
                              <div className="request-photo-row">
                                {item.fotograflar.map((base64, index) => (
                                  <img
                                    key={index}
                                    src={`data:image/jpeg;base64,${base64}`}
                                    alt={`Talep fotoğrafı ${index + 1}`}
                                    className="request-photo-thumb"
                                  />
                                ))}
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
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RequestsPage;
