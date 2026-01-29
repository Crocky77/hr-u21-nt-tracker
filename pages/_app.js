import "../styles/globals.css";
import Layout from "../components/Layout";

export default function App({ Component, pageProps, router }) {
  // ✅ INTRO ostaje potpuno bez layouta (zaključano)
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // ✅ NASLOVNICA ide potpuno custom (kao slika 2) — bez Layout headera/footera
  if (router.pathname === "/") {
    return <Component {...pageProps} />;
  }

  // ✅ sve ostalo ima Layout
  const title = "HR U21 / NT Tracker";
  const showNavLinks = true; // gore desno: Naslovnica | NT | U21 (na ostalim stranicama)

  return (
    <Layout title={title} mode="hero" showNavLinks={showNavLinks}>
      <Component {...pageProps} />
    </Layout>
  );
}
