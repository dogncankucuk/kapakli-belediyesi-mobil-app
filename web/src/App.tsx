import { Route, Routes } from "react-router-dom";
import { getDuyurular, getHaberler, getIhaleler, getIlanlar } from "./api";
import Layout from "./components/Layout";
import BaskanPage from "./pages/BaskanPage";
import HakkimizdaPage from "./pages/HakkimizdaPage";
import HaberBenzeriDetayPage from "./pages/HaberBenzeriDetayPage";
import HaberBenzeriListePage from "./pages/HaberBenzeriListePage";
import HizmetlerPage from "./pages/HizmetlerPage";
import HomePage from "./pages/HomePage";
import IletisimPage from "./pages/IletisimPage";
import KentRehberiPage from "./pages/KentRehberiPage";
import MeclisPage from "./pages/MeclisPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route
          path="/haberler"
          element={
            <HaberBenzeriListePage
              eyebrow="Güncel"
              baslik="Haberler"
              aciklama="Belediyemizden son gelişmeler ve etkinlik haberleri."
              yolOnEki="/haberler"
              getir={getHaberler}
            />
          }
        />
        <Route
          path="/haberler/:id"
          element={<HaberBenzeriDetayPage geriYolu="/haberler" geriEtiketi="Haberler" getir={getHaberler} />}
        />

        <Route
          path="/duyurular"
          element={
            <HaberBenzeriListePage
              eyebrow="Güncel"
              baslik="Duyurular"
              aciklama="Resmi duyurular ve askı ilanları."
              yolOnEki="/duyurular"
              getir={getDuyurular}
            />
          }
        />
        <Route
          path="/duyurular/:id"
          element={<HaberBenzeriDetayPage geriYolu="/duyurular" geriEtiketi="Duyurular" getir={getDuyurular} />}
        />

        <Route
          path="/ilanlar"
          element={
            <HaberBenzeriListePage
              eyebrow="Güncel"
              baslik="İlanlar"
              aciklama="İmar planı ve diğer resmi ilanlar."
              yolOnEki="/ilanlar"
              getir={getIlanlar}
            />
          }
        />
        <Route
          path="/ilanlar/:id"
          element={<HaberBenzeriDetayPage geriYolu="/ilanlar" geriEtiketi="İlanlar" getir={getIlanlar} />}
        />

        <Route
          path="/ihaleler"
          element={
            <HaberBenzeriListePage
              eyebrow="Güncel"
              baslik="İhaleler"
              aciklama="Devam eden ve sonuçlanan ihale duyuruları."
              yolOnEki="/ihaleler"
              getir={getIhaleler}
            />
          }
        />
        <Route
          path="/ihaleler/:id"
          element={<HaberBenzeriDetayPage geriYolu="/ihaleler" geriEtiketi="İhaleler" getir={getIhaleler} />}
        />

        <Route path="/meclis" element={<MeclisPage />} />
        <Route path="/hizmetler" element={<HizmetlerPage />} />
        <Route path="/kent-rehberi" element={<KentRehberiPage />} />
        <Route path="/baskan" element={<BaskanPage />} />
        <Route path="/hakkimizda" element={<HakkimizdaPage />} />
        <Route path="/iletisim" element={<IletisimPage />} />
      </Route>
    </Routes>
  );
}

export default App;
