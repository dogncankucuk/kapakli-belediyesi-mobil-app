import { useEffect, useState } from 'react';
import { getAppointments, updateAppointment } from './api';
import type { AppointmentInput } from './api';
import type { Appointment } from './types';

interface Props {
  canManage: boolean;
}

function AppointmentsPage({ canManage }: Props) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppointmentInput | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getAppointments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevular yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: Appointment) {
    setEditingId(item.id);
    setEditForm({
      hizmetTuru: item.hizmetTuru,
      tarih: item.tarih.slice(0, 10),
      saat: item.saat,
      durum: item.durum,
    });
  }

  async function handleUpdate(id: string) {
    if (!editForm) return;
    setError(null);
    try {
      await updateAppointment(id, editForm);
      setEditingId(null);
      setEditForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevu güncellenemedi');
    }
  }

  return (
    <div className="page">
      <h2>Randevular</h2>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Hizmet Türü</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Durum</th>
              <th>Kullanıcı</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editingId === item.id && editForm ? (
                <tr key={item.id}>
                  <td>
                    <input
                      value={editForm.hizmetTuru}
                      onChange={(e) => setEditForm({ ...editForm, hizmetTuru: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.tarih}
                      onChange={(e) => setEditForm({ ...editForm, tarih: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editForm.saat}
                      onChange={(e) => setEditForm({ ...editForm, saat: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={editForm.durum}
                      onChange={(e) => setEditForm({ ...editForm, durum: e.target.value })}
                    />
                  </td>
                  <td>{item.userId ?? '-'}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => handleUpdate(item.id)}>
                      Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                      }}
                    >
                      Vazgeç
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={item.id}>
                  <td>{item.hizmetTuru}</td>
                  <td>{item.tarih.slice(0, 10)}</td>
                  <td>{item.saat}</td>
                  <td>{item.durum}</td>
                  <td>{item.userId ?? '-'}</td>
                  {canManage && (
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(item)}>
                        Durumu Güncelle
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

export default AppointmentsPage;
