import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap">
      <section className="panel" aria-label="Moji igrači u Hrvatskom trackeru">
        <h1 className="h1">Moji igrači u Hrvatskom trackeru</h1>
        <p className="sub">
          CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
        </p>

        {/* 3 gornja widgeta */}
        <div className="topRow">
          <Link href="/team/nt" className="card cardNt" aria-label="NT Hrvatska">
            <div className="cardTitle">NT Hrvatska</div>
          </Link>

          <Link href="/team/u21" className="card cardU21" aria-label="U21 Hrvatska">
            <div className="cardTitle">U21 Hrvatska</div>
          </Link>

          <Link
            href="/team/nt/transfers"
            className="card cardTransfer"
            aria-label="Transfer lista"
          >
            <div className="transferIcon">⇵</div>
            <div className="cardTitle">Transfer lista</div>
          </Link>
        </div>

        {/* 8 neutralnih widgeta - klikabilni (ali vode na placeholder) */}
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Link key={i} href="/tools" className="mini" aria-label="U izradi">
              U izradi
            </Link>
          ))}
        </div>

        <div className="divider" />

        {/* Footer linkovi */}
        <footer className="footer">
          <Link href="/about" className="fLink">
            O alatu
          </Link>
          <Link href="/help" className="fLink">
            Pomoć
          </Link>
          <Link href="/donations" className="fLink">
            Donacije
          </Link>
          <Link href="/privacy" className="fLink">
            Privacy
          </Link>
          <Link href="/terms" className="fLink">
            Terms
          </Link>
        </footer>
      </section>

      <style jsx>{`
        .wrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /* Srednji “glass” panel */
        .panel {
          width: min(980px, 94vw);
          border-radius: 14px;
          padding: 34px 34px 22px;
          background: rgba(15, 15, 15, 0.55); /* sivkasto/tamno kao na slici */
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
        }

        .h1 {
          margin: 0;
          text-align: center;
          font-size: 38px;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 3px 14px rgba(0, 0, 0, 0.55);
        }

        .sub {
          margin: 8px 0 0;
          text-align: center;
          color: rgba(255, 255, 255, 0.78);
          font-size: 14px;
        }

        .topRow {
          margin-top: 22px; /* odvoji naslov od prvog reda */
          display: grid;
          grid-template-columns: 1.35fr 1fr 0.7fr;
          gap: 16px;
          align-items: stretch;
        }

        .card {
          border-radius: 10px;
          padding: 18px 18px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
          transition: transform 0.12s ease, filter 0.12s ease;
        }

        .card:hover {
          transform: translateY(-1px);
          filter: brightness(1.04);
        }

        .cardTitle {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.2px;
        }

        /* NT */
        .cardNt {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(235, 235, 235, 0.92));
          color: #8b0010;
          position: relative;
          overflow: hidden;
        }

        .cardNt::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 10% 50%, rgba(255, 0, 0, 0.25), transparent 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.18), transparent 45%);
          pointer-events: none;
        }

        /* U21 */
        .cardU21 {
          background: linear-gradient(180deg, rgba(220, 10, 25, 0.95), rgba(140, 0, 10, 0.92));
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .cardU21::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 90px;
          height: 100%;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.35), transparent 60%);
          opacity: 0.85;
          pointer-events: none;
        }

        /* Transfer */
        .cardTransfer {
          background: linear-gradient(180deg, rgba(40, 10, 12, 0.95), rgba(20, 5, 6, 0.9));
          color: #ffffff;
          justify-content: center;
        }

        .transferIcon {
          font-size: 26px;
          font-weight: 900;
          opacity: 0.95;
        }

        /* 8 widgeta */
        .grid {
          margin-top: 18px; /* odvoji 1. red od 2. reda */
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .mini {
          height: 62px;
          border-radius: 10px;
          background: rgba(235, 235, 235, 0.95);
          color: #4a4a4a;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
          transition: transform 0.12s ease, filter 0.12s ease;
        }

        .mini:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }

        .divider {
          margin: 18px 0 10px; /* footer odvoji od widgeta */
          height: 1px;
          background: rgba(255, 255, 255, 0.16);
        }

        .footer {
          display: flex;
          justify-content: center;
          gap: 22px;
          padding: 10px 0 0;
        }

        .fLink {
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
        }

        .fLink:hover {
          text-decoration: underline;
          color: rgba(255, 255, 255, 0.95);
        }

        @media (max-width: 820px) {
          .topRow {
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
