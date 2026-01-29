import "../styles/globals.css";
import Layout from "../components/Layout";

export default function App({ Component, pageProps, router }) {
  // ✅ INTRO je zaključan i ide bez layouta
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // ✅ NASLOVNICA je potpuno custom (zaključani dizajn kao slika 3) — bez Layout-a
  if (router.pathname === "/") {
    return <Component {...pageProps} />;
  }

  // ✅ Sve ostale stranice: DATA mod (bijela pozadina), header s linkovima
  return (
    <Layout title="HR U21 / NT Tracker" mode="data" showNavLinks={true}>
      <Component {...pageProps} />
    </Layout>
  );
}
