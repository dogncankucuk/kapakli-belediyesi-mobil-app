import { useEffect, useState } from 'react';
import { deleteUser, getUsers, setUserDisabled } from './api';
import type { CitizenUser } from './types';

interface Props {
  canManage: boolean;
}

function UsersPage({ canManage }: Props) {
  const [items, setItems] = useState<CitizenUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(searchValue: string) {
    setLoading(true);
    setError(null);
    try {
      setItems(await getUsers(searchValue));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  async function handleToggleDisabled(user: CitizenUser) {
    setBusyId(user.id);
    setError(null);
    try {
      await setUserDisabled(user.id, !user.disabled);
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız oldu');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: CitizenUser) {
    const onay = window.confirm(
      `${user.ad} ${user.soyad} adlı vatandaşın hesabını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!onay) return;

    setBusyId(user.id);
    setError(null);
    try {
      await deleteUser(user.id);
      await load(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <h2>Mobil Uygulama Kullanıcıları</h2>
      <p className="hint">
        Mobil uygulamaya kayıt olan vatandaşların hesap kayıtları - bu sayfa
        onlar için değil, bu hesapları yöneten adminler içindir. T.C. kimlik
        no ve telefon gibi kişisel veriler içerdiği için erişim rol bazlı
        olarak kısıtlanabilir (bkz. Roller).
      </p>

      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Ad, soyad, telefon, e-posta veya T.C. kimlik no ile ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Ara</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>T.C. Kimlik No</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th>Hesap Türü</th>
              <th>Durum</th>
              {canManage && <th>İşlemler</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.ad} {user.soyad}
                </td>
                <td>{user.tcKimlikNo ?? '—'}</td>
                <td>{user.telefon ?? '—'}</td>
                <td>{user.eposta ?? '—'}</td>
                <td>{user.googleHesabi ? 'Google' : 'E-posta/Şifre'}</td>
                <td>{user.disabled ? 'Donduruldu' : 'Aktif'}</td>
                {canManage && (
                  <td className="row-actions">
                    <button
                      disabled={busyId === user.id}
                      onClick={() => handleToggleDisabled(user)}
                    >
                      {user.disabled ? 'Aktif Et' : 'Dondur'}
                    </button>
                    <button disabled={busyId === user.id} onClick={() => handleDelete(user)}>
                      Sil
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={canManage ? 7 : 6}>Kayıt bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersPage;
