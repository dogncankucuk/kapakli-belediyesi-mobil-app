import { useEffect, useState } from 'react';
import { logout, me } from './api';
import { roleLabels } from './types';
import type { AdminUser } from './types';
import LoginPage from './LoginPage';
import AnnouncementsPage from './AnnouncementsPage';
import AppointmentsPage from './AppointmentsPage';
import RequestsPage from './RequestsPage';
import PharmaciesPage from './PharmaciesPage';
import MeclisKararlariPage from './MeclisKararlariPage';
import VefatEdenlerPage from './VefatEdenlerPage';
import WifiNoktalariPage from './WifiNoktalariPage';
import SehirKameralariPage from './SehirKameralariPage';
import UlasimHatlariPage from './UlasimHatlariPage';
import SuHizmetleriPage from './SuHizmetleriPage';
import KentLokantasiPage from './KentLokantasiPage';
import CamilerPage from './CamilerPage';
import OnemliKurumlarPage from './OnemliKurumlarPage';
import './App.css';

type Page =
  | 'announcements'
  | 'appointments'
  | 'requests'
  | 'pharmacies'
  | 'meclisKararlari'
  | 'vefatEdenler'
  | 'wifiNoktalari'
  | 'sehirKameralari'
  | 'ulasimHatlari'
  | 'suHizmetleri'
  | 'kentLokantasi'
  | 'camiler'
  | 'onemliKurumlar';

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'announcements', label: 'Duyurular' },
  { page: 'appointments', label: 'Randevular' },
  { page: 'requests', label: 'Talepler' },
  { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
  { page: 'meclisKararlari', label: 'Meclis Kararları' },
  { page: 'vefatEdenler', label: 'Vefat Edenler' },
  { page: 'wifiNoktalari', label: 'Wi-Fi Noktaları' },
  { page: 'sehirKameralari', label: 'Şehir Kameraları' },
  { page: 'ulasimHatlari', label: 'Ulaşım Hatları' },
  { page: 'suHizmetleri', label: 'Su Hizmetleri' },
  { page: 'kentLokantasi', label: 'Kent Lokantası' },
  { page: 'camiler', label: 'Camiler' },
  { page: 'onemliKurumlar', label: 'Önemli Kurumlar' },
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

  return (
    <div className="app">
      <header className="topbar">
        <nav>
          {NAV_ITEMS.map((item) => (
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
        {page === 'appointments' && <AppointmentsPage canManage={canManageOperations} />}
        {page === 'requests' && <RequestsPage canManage={canManageOperations} />}
        {page === 'pharmacies' && <PharmaciesPage canManage={canManageContent} />}
        {page === 'meclisKararlari' && <MeclisKararlariPage canManage={canManageContent} />}
        {page === 'vefatEdenler' && <VefatEdenlerPage canManage={canManageContent} />}
        {page === 'wifiNoktalari' && <WifiNoktalariPage canManage={canManageContent} />}
        {page === 'sehirKameralari' && <SehirKameralariPage canManage={canManageContent} />}
        {page === 'ulasimHatlari' && <UlasimHatlariPage canManage={canManageContent} />}
        {page === 'suHizmetleri' && <SuHizmetleriPage canManage={canManageContent} />}
        {page === 'kentLokantasi' && <KentLokantasiPage canManage={canManageContent} />}
        {page === 'camiler' && <CamilerPage canManage={canManageContent} />}
        {page === 'onemliKurumlar' && <OnemliKurumlarPage canManage={canManageContent} />}
      </main>
    </div>
  );
}

export default App;
