import "../styles/globals.css";
import Layout from "../components/Layout";

export default function App({ Component, pageProps, router }) {
  // ✅ INTRO STRANICA ostaje potpuno bez layouta (zaključano)
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // ✅ Default vrijednosti za sve ostale stranice
  // Naslovnica: bez nav linkova
  const isHome = router.pathname === "/";
  const title = isHome ? "Hrvatski U21 / NT Tracker" : "HR U21 / NT Tracker";
  const showNavLinks = !isHome; // samo na ostalim stranicama (ne na naslovnici)

  // ✅ HERO/DATA mod (za sad svi hero, kasnije ćemo precizno po stranicama)
  const mode = "hero";

  return (
    <Layout title={title} mode={mode} showNavLinks={showNavLinks}>
      <Component {...pageProps} />
    </Layout>
  );
}
