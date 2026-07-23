import { useEffect, useState } from 'react';
import { getRequests, updateRequest } from './api';
import type { TalepDurumu, TalepRequest } from './types';
import { talepDurumLabels } from './types';

interface Props {
  canManage: boolean;
}

const durumSecenekleri: TalepDurumu[] = ['beklemede', 'islemde', 'tamamlandi'];

function RequestsPage({ canManage }: Props) {
  const [items, setItems] = useState<TalepRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      ) : (
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Açıklama</th>
              <th>Ad Soyad</th>
              <th>Telefon</th>
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.kategori}</td>
                <td>{item.aciklama}</td>
                <td>{item.adSoyad}</td>
                <td>{item.telefon}</td>
                <td>{talepDurumLabels[item.durum]}</td>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RequestsPage;
