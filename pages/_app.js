// pages/_app.js
import "../styles/globals.css";
import AdminBadge from "../components/AdminBadge";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      {/* Globalni admin badge + Odjava (samo kad je user prijavljen) */}
      <AdminBadge />
    </>
  );
}

export default MyApp;
