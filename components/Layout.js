import { useRouter } from "next/router";
import Header from "./Header";

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  // Home koristi crvenu pozadinu + centrirani panel
  // Data stranice ostaju “bijele” (one već imaju svoj UI), ali header je isti (bez TopBar-a).
  return (
    <div className={isHome ? "appShell appShellHome" : "appShell appShellDefault"}>
      <Header showNav={!isHome} />
      <main className={isHome ? "mainHome" : "mainDefault"}>{children}</main>

      <style jsx global>{`
        .appShell {
          min-height: 100vh;
          width: 100%;
        }

        /* HOME background */
        .appShellHome {
          background: url("/backgrounds/home-red.jpg") center top / cover no-repeat fixed;
        }

        /* Default background (za sve druge stranice) */
        .appShellDefault {
          background: #ffffff;
        }

        /* HOME layout */
        .mainHome {
          min-height: calc(100vh - 86px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 16px 64px;
        }

        /* Default pages */
        .mainDefault {
          padding: 0;
        }
      `}</style>
    </div>
  );
}
