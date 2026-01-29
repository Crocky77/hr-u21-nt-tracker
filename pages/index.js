import Link from "next/link";

export default function HomePage() {
  // 8 klikabilnih “U izradi” (neutralno, ali klikabilno)
  const tiles = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    label: "U izradi",
    href: `/#u-izradi-${i + 1}`,
  }));

  return (
    <div className="page">
      {/* HEADER (kao slika 3) */}
      <div className="topbar">
        <div className="brand">
          <img className="logo" src="/logo.png" alt="Logo" />
          <div className="brandText">HRVATSKI U21 / NT TRACKER</div>
        </div>
      </div>

      {/* CENTRALNI PANEL (kao slika 3) */}
      <div className="wrap">
        <div className="panel">
          <h1 className="title">Moji igrači u Hrvatskom trackeru</h1>
          <div className="subtitle">
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </div>

          {/* 3 gornje kartice (klikabilne) */}
          <div className="topCards">
            <Link href="/team/nt" legacyBehavior>
              <a className="topCard nt">
                <span className="topCardText">NT Hrvatska</span>
              </a>
            </Link>

            <Link href="/team/u21" legacyBehavior>
              <a className="topCard u21">
                <span className="topCardText">U21 Hrvatska</span>
              </a>
            </Link>

            {/* Transfer mora biti klikabilan, ali “disabled” vizualno */}
            <Link href="/team/nt/transfers" legacyBehavior>
              <a className="topCard transfer disabled" aria-disabled="true" title="Privremeno isključeno do CHPP licence">
                <span className="topCardText">
                  <span className="arrow">⇵</span> Transfer lista
                </span>
              </a>
            </Link>
          </div>

          {/* 8 widgeta u 2 reda po 4 (klikabilni) */}
          <div className="grid">
            {tiles.map((t) => (
              <Link key={t.id} href={t.href} legacyBehavior>
                <a className="tile">{t.label}</a>
              </Link>
            ))}
          </div>

          {/* FOOTER LINKOVI */}
          <div className="footer">
            <Link href="/about" legacyBehavior><a>O alatu</a></Link>
            <Link href="/help" legacyBehavior><a>Pomoć</a></Link>
            <Link href="/donate" legacyBehavior><a>Donacije</a></Link>
            <Link href="/privacy" legacyBehavior><a>Privacy</a></Link>
            <Link href="/terms" legacyBehavior><a>Terms</a></Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ✅ BEZ HERO POZADINE (nema slike igrača) — samo crveno/crno kao slika 3 */
        .page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(circle at 50% 40%, rgba(255, 0, 0, 0.35), rgba(0, 0, 0, 0.92)),
            radial-gradient(circle at 50% 55%, rgba(120, 0, 0, 0.55), rgba(0, 0, 0, 0.96));
        }

        /* TOP BAR */
        .topbar {
          height: 110px;
          width: 100%;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.92), rgba(35, 0, 0, 0.88));
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        /* Logo skroz lijevo + malo “preko” */
        .brand {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 18px;
          padding-left: 10px;
        }

        .logo {
          height: 92px;
          width: auto;
          margin-top: -16px;
        }

        .brandText {
          color: #fff;
          font-weight: 900;
          letter-spacing: 0.8px;
          font-size: 28px;
          text-transform: uppercase;
        }

        /* PANEL */
        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px 80px;
        }

        .panel {
          border-radius: 18px;
          padding: 44px 38px 28px;
          background: rgba(10, 10, 10, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
        }

        .title {
          margin: 0;
          text-align: center;
          color: #fff;
          font-size: 42px;
          font-weight: 900;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55);
        }

        .subtitle {
          margin-top: 10px;
          text-align: center;
          color: rgba(255, 255, 255, 0.78);
          font-size: 16px;
        }

        /* TOP CARDS */
        .topCards {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1.25fr 1fr 0.9fr;
          gap: 16px;
        }

        .topCard {
          display: flex;
          align-items: center;
          padding: 18px 22px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35);
          transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
          cursor: pointer;
        }

        .topCard:hover {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
        }

        .topCardText {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .nt {
          color: #7a0f18;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(235, 235, 235, 0.92));
        }

        .u21 {
          color: #fff;
          background: linear-gradient(135deg, rgba(200, 0, 0, 0.92), rgba(255, 80, 80, 0.78));
        }

        .transfer {
          color: #fff;
          background: linear-gradient(135deg, rgba(60, 0, 0, 0.92), rgba(25, 0, 0, 0.90));
          justify-content: center;
        }

        /* “disabled” vizualno, ali klikabilno (kako si tražio) */
        .disabled {
          opacity: 0.78;
        }

        .arrow {
          font-weight: 900;
          margin-right: 10px;
        }

        /* 8 tiles */
        .grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .tile {
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.68);
          font-size: 22px;
          font-weight: 900;
          background: rgba(245, 245, 245, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.30);
          transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
          cursor: pointer;
        }

        .tile:hover {
          transform: translateY(-2px);
          filter: brightness(1.02);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.40);
        }

        /* footer */
        .footer {
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
          display: flex;
          justify-content: center;
          gap: 26px;
        }

        .footer a {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          font-weight: 700;
        }

        .footer a:hover {
          color: #fff;
          text-decoration: underline;
        }

        @media (max-width: 980px) {
          .brandText {
            font-size: 20px;
          }
          .logo {
            height: 70px;
            margin-top: -10px;
          }
          .topCards {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .title {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
}
