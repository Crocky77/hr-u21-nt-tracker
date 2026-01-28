import "../styles/globals.css";

export default function App({ Component, pageProps, router }) {
  // INTRO STRANICA — bez ikakvog layouta
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // SVE OSTALE STRANICE
  return <Component {...pageProps} />;
}
