import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
  const yil = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <img src={logo} alt="Kapaklı Belediyesi" />
          <p>
            Kapaklı Belediyesi, vatandaşlarına daha hızlı ve şeffaf hizmet
            sunmak için dijital dönüşümüne devam ediyor.
          </p>
        </div>

        <div className="site-footer__col">
          <h4>Kurumsal</h4>
          <Link to="/baskan">Başkanımız</Link>
          <Link to="/hakkimizda">Hakkımızda</Link>
          <Link to="/meclis">Meclis Gündemi &amp; Kararları</Link>
          <Link to="/iletisim">Bize Ulaşın</Link>
        </div>

        <div className="site-footer__col">
          <h4>Duyuru &amp; İçerik</h4>
          <Link to="/haberler">Haberler</Link>
          <Link to="/duyurular">Duyurular</Link>
          <Link to="/ilanlar">İlanlar</Link>
          <Link to="/ihaleler">İhaleler</Link>
        </div>

        <div className="site-footer__col">
          <h4>Hizmetler</h4>
          <Link to="/hizmetler">Tüm Hizmetler</Link>
          <Link to="/kent-rehberi">Kent Rehberi</Link>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {yil} Kapaklı Belediyesi. Tüm hakları saklıdır.</span>
      </div>
    </footer>
  );
}

export default Footer;
