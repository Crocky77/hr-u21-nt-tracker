import "@/styles/globals.css";

export default function App({ Component, pageProps, router }) {
  // ⛔ INTRO PAGE → BEZ LAYOUTA
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // ✅ SVE OSTALE STRANICE → NORMALAN APP
  return <Component {...pageProps} />;
}
