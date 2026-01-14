// pages/index.js
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21/NT Tracker</title>
        <meta
          name="description"
          content="Javni pregled alata za praćenje hrvatskih reprezentativaca (U21 i NT)."
        />
      </Head>

      <main className="page">
        <section className="hero">
          <div className="heroInner">
            <div className="heroTitleRow">
              <div className="crest" aria-hidden="true" />
              <div>
                <h1 className="title">Hrvatski U21/NT Tracker</h1>
                <p className="subtitle">
                  Javni pregled alata za praćenje hrvatskih reprezentativaca (U21 i NT).
                  Gost može vidjeti strukturu i “preview”, ali su igrači i skilovi zaključani bez prijave.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ NOVI MODUL NA NASLOVNICI (kao na Hattrick Portalu) */}
        <section className="module">
          <div className="moduleHeader">
            <h2 className="moduleTitle">Moji igrači u globalnom trackeru</h2>
          </div>

          <div className="moduleBody">
            <p className="moduleText">
              Ukoliko želiš registrirati svoj klub i igrače u tracker, klikni na gumb ispod za prijavu.
              Autorizacijom daješ dozvolu aplikaciji da periodično skenira tvoj klub u potrazi za talentima.
            </p>

            <div className="moduleActions">
              <Link className="btnPrimary" href="/login">
                Prijava
              </Link>
              <span className="hint">
                (CHPP spajanje dolazi kasnije — sada pripremamo UI + DB)
              </span>
            </div>
          </div>
        </section>

        {/* ✅ U21/NT ulazi (preimenovano) */}
        <section className="grid">
          <div className="card">
            <div className="cardTop">
              <h3 className="cardTitle">Hrvatska U21</h3>
              <span className="pill">Preview</span>
            </div>
            <p className="cardText">
              Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
            </p>
            <div className="cardActions">
              <Link className="btnGhost" href="/team/u21">
                Otvori →
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="cardTop">
              <h3 className="cardTitle">Hrvatska NT</h3>
              <span className="pill">Preview</span>
            </div>
            <p className="cardText">
              Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
            </p>
            <div className="cardActions">
              <Link className="btnGhost" href="/team/nt">
                Otvori →
              </Link>
            </div>
          </div>
        </section>

        <section className="linksRow">
          <Link className="miniLink" href="/about">
            O alatu →
          </Link>
          <Link className="miniLink" href="/help">
            Pomoć →
          </Link>
          <Link className="miniLink" href="/donations">
            Donacije →
          </Link>
        </section>

        <p className="note">
          Napomena: u V1 gost vidi “preview” dashboarda, ali sve stranice koje prikazuju igrače/skilove traže prijavu.
        </p>
      </main>

      <style jsx>{`
        .page {
          max-width: 980px;
          margin: 0 auto;
          padding: 18px 14px 40px;
        }

        .hero {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 18px;
          padding: 18px;
        }

        .heroInner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .heroTitleRow {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .crest {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: repeating-linear-gradient(
            45deg,
            rgba(120, 20, 20, 0.9),
            rgba(120, 20, 20, 0.9) 8px,
            rgba(255, 255, 255, 0.9) 8px,
            rgba(255, 255, 255, 0.9) 16px
          );
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .title {
          margin: 0;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -0.2px;
        }

        .subtitle {
          margin: 6px 0 0;
          color: rgba(0, 0, 0, 0.7);
          line-height: 1.45;
          max-width: 780px;
        }

        .module {
          margin-top: 16px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(120, 20, 20, 0.25);
          border-radius: 18px;
          overflow: hidden;
        }

        .moduleHeader {
          padding: 12px 14px;
          background: rgba(120, 20, 20, 0.06);
          border-bottom: 1px solid rgba(120, 20, 20, 0.12);
        }

        .moduleTitle {
          margin: 0;
          font-size: 18px;
        }

        .moduleBody {
          padding: 14px;
        }

        .moduleText {
          margin: 0 0 12px;
          line-height: 1.45;
          color: rgba(0, 0, 0, 0.78);
        }

        .moduleActions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btnPrimary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(120, 20, 20, 0.92);
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }

        .btnPrimary:hover {
          filter: brightness(1.05);
        }

        .hint {
          color: rgba(0, 0, 0, 0.55);
          font-size: 13px;
        }

        .grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .card {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 18px;
          padding: 14px;
        }

        .cardTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTitle {
          margin: 0;
          font-size: 18px;
        }

        .pill {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.06);
          color: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.07);
          white-space: nowrap;
        }

        .cardText {
          margin: 10px 0 0;
          line-height: 1.45;
          color: rgba(0, 0, 0, 0.72);
        }

        .cardActions {
          margin-top: 12px;
        }

        .btnGhost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: rgba(0, 0, 0, 0.82);
          font-weight: 700;
        }

        .btnGhost:hover {
          background: rgba(0, 0, 0, 0.07);
        }

        .linksRow {
          margin-top: 14px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .miniLink {
          color: rgba(120, 20, 20, 0.95);
          text-decoration: none;
          font-weight: 700;
        }

        .miniLink:hover {
          text-decoration: underline;
        }

        .note {
          margin-top: 10px;
          color: rgba(0, 0, 0, 0.55);
          font-size: 13px;
        }

        @media (max-width: 760px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .title {
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}
