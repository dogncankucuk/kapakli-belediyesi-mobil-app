import { useEffect, useState } from 'react';
import { deleteAseviBasvuru, getAseviBasvurulari, updateAseviBasvuruDurum } from './api';
import type { AseviBasvuru, AseviBasvuruDurumu } from './types';
import { aseviBasvuruDurumLabels } from './types';

interface Props {
  canManage: boolean;
}

const durumSecenekleri: AseviBasvuruDurumu[] = ['beklemede', 'onaylandi', 'tamamlandi'];

function AseviPage({ canManage }: Props) {
  const [items, setItems] = useState<AseviBasvuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getAseviBasvurulari());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function handleDurumChange(id: string, durum: AseviBasvuruDurumu) {
    setBusyId(id);
    setError(null);
    try {
      await updateAseviBasvuruDurum(id, durum);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru güncellenemedi');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu başvuru silinsin mi?')) return;
    setBusyId(id);
    setError(null);
    try {
      await deleteAseviBasvuru(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Başvuru silinemedi');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <h2>Aşevi Başvuruları</h2>
      <p className="hint">
        Aşevi hizmetinden yararlanmak için form üzerinden yapılan başvurular. Hizmet
        aracının adrese yemek ulaştırabilmesi için durum takibini burada yapabilirsiniz.
      </p>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Telefon</th>
              <th>Adres</th>
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.adSoyad}</td>
                <td>{item.telefon}</td>
                <td>{item.adres}</td>
                <td>{aseviBasvuruDurumLabels[item.durum]}</td>
                {canManage && (
                  <td className="row-actions">
                    <select
                      value={item.durum}
                      disabled={busyId === item.id}
                      onChange={(e) =>
                        handleDurumChange(item.id, e.target.value as AseviBasvuruDurumu)
                      }
                    >
                      {durumSecenekleri.map((durum) => (
                        <option key={durum} value={durum}>
                          {aseviBasvuruDurumLabels[durum]}
                        </option>
                      ))}
                    </select>
                    <button disabled={busyId === item.id} onClick={() => handleDelete(item.id)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5}>Henüz başvuru yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AseviPage;
