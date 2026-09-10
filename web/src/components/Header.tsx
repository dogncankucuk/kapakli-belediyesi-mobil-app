import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

const NAV_LINKS: { to: string; label: string }[] = [
  { to: "/haberler", label: "Haberler" },
  { to: "/duyurular", label: "Duyurular" },
  { to: "/ilanlar", label: "İlanlar" },
  { to: "/ihaleler", label: "İhaleler" },
  { to: "/meclis", label: "Meclis" },
  { to: "/hizmetler", label: "Hizmetler" },
  { to: "/kent-rehberi", label: "Kent Rehberi" },
  { to: "/baskan", label: "Başkanımız" },
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/iletisim", label: "İletişim" },
];

function Header() {
  const [menuAcik, setMenuAcik] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__bar container">
        <NavLink to="/" className="site-header__brand" onClick={() => setMenuAcik(false)}>
          <img src={logo} alt="Kapaklı Belediyesi" />
        </NavLink>

        <nav className={`site-header__nav ${menuAcik ? "is-open" : ""}`} aria-label="Ana menü">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-header__link${isActive ? " is-active" : ""}`}
              onClick={() => setMenuAcik(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            className="btn btn--gold site-header__cta"
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
          >
            Uygulamayı İndir
          </a>
          <button
            type="button"
            className="site-header__toggle"
            aria-label="Menüyü aç/kapat"
            aria-expanded={menuAcik}
            onClick={() => setMenuAcik((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
