import { useEffect, useState } from 'react';
import { logout, me } from './api';
import { roleLabels } from './types';
import type { AdminUser } from './types';
import LoginPage from './LoginPage';
import AnnouncementsPage from './AnnouncementsPage';
import AtikNoktalariPage from './AtikNoktalariPage';
import AppointmentsPage from './AppointmentsPage';
import RequestsPage from './RequestsPage';
import PharmaciesPage from './PharmaciesPage';
import MeclisKararlariPage from './MeclisKararlariPage';
import VefatEdenlerPage from './VefatEdenlerPage';
import WifiNoktalariPage from './WifiNoktalariPage';
import SuHizmetleriPage from './SuHizmetleriPage';
import AseviPage from './AseviPage';
import CamilerPage from './CamilerPage';
import OnemliKurumlarPage from './OnemliKurumlarPage';
import ParklarPage from './ParklarPage';
import TarihiYerlerPage from './TarihiYerlerPage';
import UsersPage from './UsersPage';
import './App.css';

type Page =
  | 'announcements'
  | 'atikNoktalari'
  | 'appointments'
  | 'requests'
  | 'pharmacies'
  | 'meclisKararlari'
  | 'vefatEdenler'
  | 'wifiNoktalari'
  | 'suHizmetleri'
  | 'asevi'
  | 'camiler'
  | 'onemliKurumlar'
  | 'parklar'
  | 'tarihiYerler'
  | 'users';

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'announcements', label: 'Duyurular' },
  { page: 'atikNoktalari', label: 'Atık Noktaları' },
  { page: 'appointments', label: 'Randevular' },
  { page: 'requests', label: 'Talepler' },
  { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
  { page: 'meclisKararlari', label: 'Meclis Kararları' },
  { page: 'vefatEdenler', label: 'Vefat Edenler' },
  { page: 'wifiNoktalari', label: 'Wi-Fi Noktaları' },
  { page: 'suHizmetleri', label: 'Su Hizmetleri' },
  { page: 'asevi', label: 'Aşevi' },
  { page: 'camiler', label: 'Camiler' },
  { page: 'onemliKurumlar', label: 'Önemli Kurumlar' },
  { page: 'parklar', label: 'Parklar' },
  { page: 'tarihiYerler', label: 'Tarihi Yerler' },
];

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState<Page>('announcements');

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }

  if (!authChecked) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const canManageContent = user.role === 'contentManager' || user.role === 'superAdmin';
  const canManageOperations = user.role === 'appointmentOperator' || user.role === 'superAdmin';
  const isSuperAdmin = user.role === 'superAdmin';

  // "users" (vatandas hesaplari) sekmesi kisisel veri icerdigi icin sadece
  // Super Admin'e gosterilir - backend de ayni kisitlamayi RbacGuard'da
  // uyguluyor (bkz. admin/auth/rbac.guard.ts).
  const navItems = isSuperAdmin
    ? [...NAV_ITEMS, { page: 'users' as const, label: 'Kullanıcılar' }]
    : NAV_ITEMS;

  return (
    <div className="app">
      <header className="topbar">
        <nav>
          {navItems.map((item) => (
            <button
              key={item.page}
              className={page === item.page ? 'active' : ''}
              onClick={() => setPage(item.page)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="user-info">
          <span>
            {user.email} &middot; {roleLabels[user.role]}
          </span>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </header>
      <main>
        {page === 'announcements' && <AnnouncementsPage canManage={canManageContent} />}
        {page === 'atikNoktalari' && <AtikNoktalariPage canManage={canManageContent} />}
        {page === 'appointments' && <AppointmentsPage canManage={canManageOperations} />}
        {page === 'requests' && <RequestsPage canManage={canManageOperations} />}
        {page === 'pharmacies' && <PharmaciesPage canManage={canManageContent} />}
        {page === 'meclisKararlari' && <MeclisKararlariPage canManage={canManageContent} />}
        {page === 'vefatEdenler' && <VefatEdenlerPage canManage={canManageContent} />}
        {page === 'wifiNoktalari' && <WifiNoktalariPage canManage={canManageContent} />}
        {page === 'suHizmetleri' && <SuHizmetleriPage canManage={canManageContent} />}
        {page === 'asevi' && <AseviPage canManage={canManageContent} />}
        {page === 'camiler' && <CamilerPage canManage={canManageContent} />}
        {page === 'onemliKurumlar' && <OnemliKurumlarPage canManage={canManageContent} />}
        {page === 'parklar' && <ParklarPage canManage={canManageContent} />}
        {page === 'tarihiYerler' && <TarihiYerlerPage canManage={canManageContent} />}
        {page === 'users' && isSuperAdmin && <UsersPage />}
      </main>
    </div>
  );
}

export default App;
