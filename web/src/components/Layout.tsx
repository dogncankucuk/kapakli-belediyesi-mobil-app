import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

function Layout() {
  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe geç
      </a>
      <Header />
      <main id="icerik">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
