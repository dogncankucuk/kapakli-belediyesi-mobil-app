import { useEffect, useMemo, useState } from 'react';
import { getPublicPanelTemasi, logout, me } from './api';
import { applyPanelTemasi } from './applyTheme';
import type { AdminUser } from './types';
import LoginPage from './LoginPage';
import AnnouncementsPage from './AnnouncementsPage';
import HaberlerPage from './HaberlerPage';
import IlanlarPage from './IlanlarPage';
import IhalelerPage from './IhalelerPage';
import MakalelerPage from './MakalelerPage';
import MeclisGundemleriPage from './MeclisGundemleriPage';
import BaskanPage from './BaskanPage';
import HakkimizdaPage from './HakkimizdaPage';
import YardimMerkeziPage from './YardimMerkeziPage';
import BizeUlasinPage from './BizeUlasinPage';
import FaturaOdemePage from './FaturaOdemePage';
import UlasimHizmetleriPage from './UlasimHizmetleriPage';
import UlasimHatlariPage from './UlasimHatlariPage';
import TemaAyarlariPage from './TemaAyarlariPage';
import PanelTemasiPage from './PanelTemasiPage';
import MedyaPage from './MedyaPage';
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
import FormlarPage from './FormlarPage';
import BasvuruHizmetleriPage from './BasvuruHizmetleriPage';
import MapEditorPage from './MapEditorPage';
import UsersPage from './UsersPage';
import RolesPage from './RolesPage';
import AdminUsersPage from './AdminUsersPage';
import './App.css';

type Page =
  | 'haberler'
  | 'announcements'
  | 'ilanlar'
  | 'ihaleler'
  | 'makaleler'
  | 'meclisGundemleri'
  | 'baskan'
  | 'hakkimizda'
  | 'yardimMerkezi'
  | 'bizeUlasin'
  | 'faturaOdeme'
  | 'ulasimHizmetleri'
  | 'ulasimHatlari'
  | 'temaAyarlari'
  | 'panelTemasi'
  | 'medya'
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
  | 'formlar'
  | 'basvuruHizmetleri'
  | 'mapEditor'
  | 'users'
  | 'roles'
  | 'adminUsers';

interface NavGroup {
  heading: string;
  items: { page: Page; label: string }[];
}

// Ana basliklar + alt sekmeler - butonlar sol sidebar'da bu gruplamayla
// gosterilir. Bu panelin tamami adminler icindir - hicbir grup vatandasa
// acik degildir. Bazi gruplar sadece mobil uygulamadan gelen vatandas
// verisini (randevu/talep/hesap) yonetmeye yarar, bu farkli bir sey -
// grup basliklari bu yuzden "kim kullanir" degil "admin ne yapiyor"
// mantigiyla adlandirilir (bkz. Gurkan'in duzeltmesi: panel vatandas icin
// degil, mobil uygulamayi yonetecek adminler icindir).
// "Harita Konumları" grubu, lat/lng iceren tum icerik turlerini (harita
// katmanlarini besleyen kaynaklar) ve harita editorunu bir arada toplar.
const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Duyurular',
    items: [
      { page: 'haberler', label: 'Haberler' },
      { page: 'announcements', label: 'Duyurular' },
      { page: 'ilanlar', label: 'İlanlar' },
      { page: 'ihaleler', label: 'İhaleler' },
      { page: 'makaleler', label: 'Makaleler' },
      { page: 'meclisGundemleri', label: 'Meclis Gündemleri' },
      { page: 'meclisKararlari', label: 'Meclis Kararları' },
    ],
  },
  {
    heading: 'Kurumsal',
    items: [
      { page: 'baskan', label: 'Başkanımız' },
      { page: 'hakkimizda', label: 'Hakkımızda' },
      { page: 'yardimMerkezi', label: 'Yardım Merkezi' },
      { page: 'bizeUlasin', label: 'Bize Ulaşın' },
    ],
  },
  {
    // Mobil uygulamadaki "Hizmetler" sekmesindeki servis katalogunun
    // (SERVICE_CATALOG) birebir eslesigi - hava durumu/hava kalitesi haric
    // (onlar dis API'den canli cekiliyor, admin panelde yonetilecek icerik
    // yok). Bazi ogeler baska gruplarda zaten var olan sayfalara isaret
    // eder (ayni kaynagi iki basliktan erisilebilir kilmak icin kasitli).
    heading: 'Hizmetler',
    items: [
      { page: 'faturaOdeme', label: 'Fatura Ödeme' },
      { page: 'suHizmetleri', label: 'Su Hizmetleri' },
      { page: 'formlar', label: 'Formlar ve Dilekçeler' },
      { page: 'basvuruHizmetleri', label: 'Engelli / Yaşlı Hizmetleri' },
      { page: 'ulasimHizmetleri', label: 'Ulaşım Hizmetleri' },
      { page: 'ulasimHatlari', label: 'Ulaşım Hatları' },
      { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
      { page: 'atikNoktalari', label: 'Atık Noktaları' },
      { page: 'asevi', label: 'Aşevi' },
      { page: 'vefatEdenler', label: 'Vefat Edenler' },
    ],
  },
  {
    heading: 'Talepler',
    items: [{ page: 'requests', label: 'Talepler' }],
  },
  {
    heading: 'Randevular',
    items: [{ page: 'appointments', label: 'Randevular' }],
  },
  {
    heading: 'Başvurular',
    items: [],
  },
  {
    heading: 'Harita Konumları',
    items: [
      { page: 'mapEditor', label: 'Harita Editörü' },
      { page: 'camiler', label: 'Camiler' },
      { page: 'onemliKurumlar', label: 'Önemli Kurumlar' },
      { page: 'parklar', label: 'Parklar' },
      { page: 'tarihiYerler', label: 'Tarihi Yerler' },
      { page: 'wifiNoktalari', label: 'Wi-Fi Noktaları' },
      { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
    ],
  },
  {
    heading: 'Medya',
    items: [{ page: 'medya', label: 'Medya Kütüphanesi' }],
  },
  {
    heading: 'Ayarlar',
    items: [
      { page: 'panelTemasi', label: 'Panel Görünümü' },
      { page: 'temaAyarlari', label: 'Mobil Görünüm Ayarları' },
    ],
  },
  {
    heading: 'Panel Yönetimi',
    items: [
      { page: 'roles', label: 'Roller' },
      { page: 'adminUsers', label: 'Yönetici Kullanıcılar' },
      { page: 'users', label: 'Mobil Uygulama Kullanıcıları' },
    ],
  },
];

// Harita Editörü tek bir kaynağa değil, harita katmanlarını besleyen tüm
// kaynaklara bağlı - bunlardan en az birini yönetebilen görebilir.
const MAP_EDITOR_RESOURCES = [
  'camiler',
  'onemliKurumlar',
  'parklar',
  'tarihiYerler',
  'wifiNoktalari',
  'pharmacies',
];

function pageResource(page: Page): string | null {
  return page === 'mapEditor' ? null : page;
}

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
    // Login ekrani dahil her sayfa temali gorunsun diye kimlik dogrulama
    // sonucunu beklemeden, kimlik dogrulamasiz genel uctan cekilir.
    getPublicPanelTemasi()
      .then(applyPanelTemasi)
      .catch(() => {
        // Tema alinamazsa index.css'teki varsayilan degerlerle devam edilir.
      });
  }, []);

  const canView = useMemo(() => {
    return (resource: string): boolean => {
      if (!user) return false;
      if (user.role.isFullAccess) return true;
      return (user.permissions[resource] ?? []).includes('list');
    };
  }, [user]);

  const canManage = useMemo(() => {
    return (resource: string): boolean => {
      if (!user) return false;
      if (user.role.isFullAccess) return true;
      return (user.permissions[resource] ?? []).includes('manage');
    };
  }, [user]);

  const canViewPage = useMemo(() => {
    return (p: Page): boolean => {
      if (p === 'mapEditor') {
        return MAP_EDITOR_RESOURCES.some((r) => canManage(r));
      }
      const resource = pageResource(p);
      return resource ? canView(resource) : false;
    };
  }, [canView, canManage]);

  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => canViewPage(item.page)),
    }));
  }, [canViewPage]);

  useEffect(() => {
    if (!user) return;
    if (page && canViewPage(page)) return;
    const firstVisible = visibleGroups[0]?.items[0]?.page ?? null;
    setPage(firstVisible);
  }, [user, page, canViewPage, visibleGroups]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setPage(null);
    }
  }

  if (!authChecked) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="topbar-brand-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2 2 7v2h20V7L12 2Z M4 10v9H2v2h20v-2h-2v-9h-2v9h-3v-9h-2v9H9v-9H7v9H4v-9Z"
                fill="currentColor"
              />
            </svg>
          </span>
          Kapaklı Belediyesi
        </div>

        <nav className="sidebar-nav">
          {visibleGroups.map((group) => (
            <div className="sidebar-group" key={group.heading}>
              <div className="sidebar-group-heading">{group.heading}</div>
              {group.items.map((item) => (
                <button
                  key={item.page}
                  className={
                    'sidebar-link' + (page === item.page ? ' active' : '')
                  }
                  onClick={() => setPage(item.page)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="user-info-text">
            {user.email} &middot; {user.role.name}
          </span>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </aside>
      <main>
        {page === 'haberler' && <HaberlerPage canManage={canManage('haberler')} />}
        {page === 'announcements' && <AnnouncementsPage canManage={canManage('announcements')} />}
        {page === 'ilanlar' && <IlanlarPage canManage={canManage('ilanlar')} />}
        {page === 'ihaleler' && <IhalelerPage canManage={canManage('ihaleler')} />}
        {page === 'makaleler' && <MakalelerPage canManage={canManage('makaleler')} />}
        {page === 'meclisGundemleri' && (
          <MeclisGundemleriPage canManage={canManage('meclisGundemleri')} />
        )}
        {page === 'baskan' && <BaskanPage canManage={canManage('baskan')} />}
        {page === 'hakkimizda' && <HakkimizdaPage canManage={canManage('hakkimizda')} />}
        {page === 'yardimMerkezi' && (
          <YardimMerkeziPage canManage={canManage('yardimMerkezi')} />
        )}
        {page === 'bizeUlasin' && <BizeUlasinPage canManage={canManage('bizeUlasin')} />}
        {page === 'faturaOdeme' && <FaturaOdemePage canManage={canManage('faturaOdeme')} />}
        {page === 'ulasimHizmetleri' && (
          <UlasimHizmetleriPage canManage={canManage('ulasimHizmetleri')} />
        )}
        {page === 'ulasimHatlari' && (
          <UlasimHatlariPage canManage={canManage('ulasimHatlari')} />
        )}
        {page === 'temaAyarlari' && (
          <TemaAyarlariPage canManage={canManage('temaAyarlari')} />
        )}
        {page === 'panelTemasi' && (
          <PanelTemasiPage canManage={canManage('panelTemasi')} />
        )}
        {page === 'medya' && <MedyaPage canManage={canManage('medya')} />}
        {page === 'atikNoktalari' && <AtikNoktalariPage canManage={canManage('atikNoktalari')} />}
        {page === 'appointments' && <AppointmentsPage canManage={canManage('appointments')} />}
        {page === 'requests' && <RequestsPage canManage={canManage('requests')} />}
        {page === 'pharmacies' && <PharmaciesPage canManage={canManage('pharmacies')} />}
        {page === 'meclisKararlari' && (
          <MeclisKararlariPage canManage={canManage('meclisKararlari')} />
        )}
        {page === 'vefatEdenler' && <VefatEdenlerPage canManage={canManage('vefatEdenler')} />}
        {page === 'wifiNoktalari' && <WifiNoktalariPage canManage={canManage('wifiNoktalari')} />}
        {page === 'suHizmetleri' && <SuHizmetleriPage canManage={canManage('suHizmetleri')} />}
        {page === 'asevi' && <AseviPage canManage={canManage('asevi')} />}
        {page === 'camiler' && <CamilerPage canManage={canManage('camiler')} />}
        {page === 'onemliKurumlar' && (
          <OnemliKurumlarPage canManage={canManage('onemliKurumlar')} />
        )}
        {page === 'parklar' && <ParklarPage canManage={canManage('parklar')} />}
        {page === 'tarihiYerler' && <TarihiYerlerPage canManage={canManage('tarihiYerler')} />}
        {page === 'formlar' && <FormlarPage canManage={canManage('formlar')} />}
        {page === 'basvuruHizmetleri' && (
          <BasvuruHizmetleriPage canManage={canManage('basvuruHizmetleri')} />
        )}
        {page === 'mapEditor' && (
          <MapEditorPage canManage={MAP_EDITOR_RESOURCES.some((r) => canManage(r))} />
        )}
        {page === 'users' && <UsersPage canManage={canManage('users')} />}
        {page === 'roles' && <RolesPage canManage={canManage('roles')} />}
        {page === 'adminUsers' && <AdminUsersPage canManage={canManage('adminUsers')} />}
      </main>
    </div>
  );
}

export default App;
