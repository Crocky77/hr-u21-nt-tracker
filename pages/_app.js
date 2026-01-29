import "../styles/globals.css";
import TopBar from "../components/TopBar";

export default function App({ Component, pageProps, router }) {
  // INTRO STRANICA — bez ikakvog layouta
  if (router.pathname === "/intro") {
    return <Component {...pageProps} />;
  }

  // Na kojim stranicama želimo tamni "home" background
  const darkRoutes = [
    "/", // naslovnica
    "/my-players",
    "/coming-soon",
    "/team/[team]/transfers",
  ];

  const isDark =
    router.pathname === "/" ||
    router.pathname === "/my-players" ||
    router.pathname === "/coming-soon" ||
    router.pathname === "/team/[team]/transfers";

  return (
    <div className={isDark ? "app app--dark" : "app app--light"}>
      <TopBar />
      <main className="app__main">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
