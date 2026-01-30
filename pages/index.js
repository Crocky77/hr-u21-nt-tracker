import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* ===== PAGE WRAPPER (POZADINA) ===== */}
      <div className="page-root">
        {/* ===== HEADER (privremeno, samo da ne puca layout) ===== */}
        <header className="top-header">
          <div className="header-inner">
            <div className="logo-title">
              <img src="/logo.png" alt="HT Logo" />
              <span>Hrvatski U21 / NT Tracker</span>
            </div>
            <div className="auth-status">Nisi prijavljen</div>
          </div>
        </header>

        {/* ===== CENTRALNI CONTENT (widgeti dolaze kasnije) ===== */}
        <main className="content">
          <div className="placeholder-box">
            <h1>Moji igrači u Hrvatskom trackeru</h1>
            <p>
              CHPP dozvola je kasnije. Za sada pripremamo UI + DB za
              "moji igrači".
            </p>
          </div>
        </main>

        {/* ===== FOOTER (JEDAN, DONJI) ===== */}
        <footer className="footer">
          <span>O alatu</span>
          <span>Pomoć</span>
          <span>Donacije</span>
          <span>Privacy</span>
          <span>Terms</span>
        </footer>
      </div>

      {/* ===== STYLES ===== */}
      <style jsx>{`
        /* RESET */
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          height: 100%;
        }

        /* PAGE ROOT – OVO JE KLJUČ */
        .page-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: radial-gradient(
            ellipse at center,
            #8b0000 0%,
            #4b0000 45%,
            #120000 100%
          );
        }

        /* HEADER */
        .top-header {
          border-bottom: 2px solid #b00000;
          background: linear-gradient(
            to right,
            #0f0f0f,
            #2a0000,
            #0f0f0f
          );
        }

        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
        }

        .logo-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 18px;
        }

        .logo-title img {
          height: 36px;
        }

        .auth-status {
          opacity: 0.8;
          font-size: 14px;
        }

        /* CONTENT */
        .content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .placeholder-box {
          background: rgba(30, 30, 30, 0.85);
          border-radius: 14px;
          padding: 40px 50px;
          color: #fff;
          text-align: center;
          max-width: 720px;
          width: 100%;
        }

        .placeholder-box h1 {
          margin-top: 0;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 18px;
          display: flex;
          justify-content: center;
          gap: 28px;
          color: #ddd;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.25);
        }

        .footer span {
          cursor: pointer;
          opacity: 0.85;
        }

        .footer span:hover {
          opacity: 1;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
