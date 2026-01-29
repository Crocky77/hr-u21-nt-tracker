import Link from "next/link";

export default function HomePage() {
  const comingSoon = [
    { id: 1, label: "U izradi" },
    { id: 2, label: "U izradi" },
    { id: 3, label: "U izradi" },
    { id: 4, label: "U izradi" },
    { id: 5, label: "U izradi" },
    { id: 6, label: "U izradi" },
    { id: 7, label: "U izradi" },
    { id: 8, label: "U izradi" },
  ];

  return (
    <div className="home">
      {/* TOP HEADER (kao na slici 2) */}
      <header className="topHeader">
        <div className="topInner">
          <div className="brand">
            <img className="logo" src="/logo.png" alt="HR U21/NT Tracker logo" />
            <div className="brandTitle">Hrvatski U21 / NT TRACKER</div>
          </div>
        </div>
      </header>

      {/* MAIN GLASS PANEL */}
      <main className="main">
        <section className="glass">
          <h1 className="h1">Moji igrači u Hrvatskom trackeru</h1>
          <div className="sub">
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </div>

          {/* TOP 3 CARDS */}
          <div className="topCards">
            <Link href="/team/nt" className="card cardNt" aria-label="NT Hrvatska">
              <div className="cardLabel">NT Hrvatska</div>
            </Link>

            <Link href="/team/u21" className="card cardU21" aria-label="U21 Hrvatska">
              <div className="cardLabel">U21 Hrvatska</div>
            </Link>

            {/* Transfer lista (disabled look, ali klik vodi na stranicu koja već kaže da je modul ugašen) */}
            <Link
              href="/team/nt/transfers"
              className="card cardTransfer cardDisabled"
              aria-label="Transfer lista (privremeno isključeno)"
              title="Privremeno isključeno do CHPP licence"
            >
              <div className="cardLabel">
                <span className="arrow">⇵</span> Transfer lista
              </div>
            </Link>
          </div>

          {/* 8 MODULES (klikabilni) */}
          <div className="grid">
            {comingSoon.map((x) => (
              <Link
                key={x.id}
                href={`/#u-izradi-${x.id}`}
                className="tile"
                aria-label={`${x.label} ${x.id}`}
                title="U izradi"
              >
                {x.label}
              </Link>
            ))}
          </div>

          {/* FOOTER LINKS (kao na slici 2) */}
          <footer className="footerLinks">
            <Link href="/about">O alatu</Link>
            <Link href="/help">Pomoć</Link>
            <Link href="/donate">Donacije</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </footer>
        </section>
      </main>

      <style jsx>{`
        .home {
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(circle at 50% 40%, rgba(220, 0, 0, 0.55), rgba(0, 0, 0, 0.92)),
            url("/backgrounds/hr-hero.jpg") center / cover no-repeat;
        }

        /* TOP HEADER */
        .topHeader {
          height: 110px;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.92), rgba(30, 0, 0, 0.82));
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .topInner {
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          height: 86px;
          width: auto;
        }

        .brandTitle {
          color: #fff;
          font-weight: 900;
          letter-spacing: 0.8px;
          font-size: 28px;
          text-transform: uppercase;
        }

        /* MAIN */
        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 20px 80px;
          display: flex;
          justify-content: center;
        }

        .glass {
          width: 100%;
          border-radius: 18px;
          padding: 44px 38px 28px;
          background: rgba(10, 10, 10, 0.58);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
        }

        .h1 {
          margin: 0;
          text-align: center;
          color: #fff;
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 0.3px;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.45);
        }

        .sub {
          margin-top: 10px;
          text-align: center;
          color: rgba(255, 255, 255, 0.75);
          font-size: 16px;
        }

        /* TOP CARDS */
        .topCards {
          margin-top: 26px;
          display: grid;
          grid-template-columns: 1.25fr 1fr 0.9fr;
          gap: 16px;
        }

        .card {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 18px 22px;
          border-radius: 14px;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.35);
          transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
        }

        .card:hover {
          transform: translateY(-2px);
          filter: brightness(1.03);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45);
        }

        .cardLabel {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        .cardNt {
          color: #7a0f18;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(235, 235, 235, 0.92));
        }

        .cardU21 {
          color: #fff;
          background: linear-gradient(135deg, rgba(200, 0, 0, 0.92), rgba(255, 80, 80, 0.78));
        }

        .cardTransfer {
          color: #fff;
          background: linear-gradient(135deg, rgba(60, 0, 0, 0.9), rgba(25, 0, 0, 0.86));
          justify-content: center;
        }

        .arrow {
          font-weight: 900;
          margin-right: 10px;
        }

        .cardDisabled {
          opacity: 0.92;
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

        /* Footer links */
        .footerLinks {
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
          display: flex;
          justify-content: center;
          gap: 26px;
        }

        .footerLinks :global(a) {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          font-weight: 700;
        }

        .footerLinks :global(a:hover) {
          color: #fff;
          text-decoration: underline;
        }

        @media (max-width: 980px) {
          .brandTitle {
            font-size: 20px;
          }
          .logo {
            height: 64px;
          }
          .topCards {
            grid-template-columns: 1fr;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
}
