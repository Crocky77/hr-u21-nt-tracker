import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* HEADER */}
      <header
        style={{
          background: "linear-gradient(90deg, #0b0b0b, #1a0f14)",
          borderBottom: "2px solid #b11226",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo.png"
            alt="HT Logo"
            style={{ height: 42 }}
          />
          <strong style={{ color: "#fff", fontSize: 18 }}>
            Hrvatski U21 / NT Tracker
          </strong>
        </div>

        <div style={{ color: "#bbb", fontSize: 14 }}>
          Nisi prijavljen
        </div>
      </header>

      {/* POZADINA */}
      <main
        style={{
          minHeight: "calc(100vh - 140px)",
          background: "radial-gradient(circle at center, #5a0d14 0%, #0b0b0b 70%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        {/* GLAVNA KARTICA */}
        <div
          style={{
            width: "100%",
            maxWidth: 920,
            background: "rgba(30,30,30,0.85)",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          <h1 style={{ color: "#fff", textAlign: "center" }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ color: "#ccc", textAlign: "center", marginBottom: 24 }}>
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </p>

          {/* INFO BAR */}
          <div
            style={{
              background: "#2a2a2a",
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div style={{ color: "#eee" }}>
              <strong>Moji igrači u Hrvatskom trackeru</strong>
              <div style={{ fontSize: 13, color: "#aaa" }}>
                Otvori modul i prijavi se (CHPP kasnije).
              </div>
            </div>

            <button
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Prijava (CHPP kasnije)
            </button>
          </div>

          {/* TOP WIDGETI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div className="widget nt">NT Hrvatska</div>
            <div className="widget u21">U21 Hrvatska</div>
            <div className="widget transfer">Transfer lista</div>
          </div>

          {/* PLACEHOLDER WIDGETI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="placeholder">
                U izradi
              </div>
            ))}
          </div>

          {/* FOOTER (JEDINI) */}
          <footer
            style={{
              marginTop: 28,
              paddingTop: 12,
              borderTop: "1px solid #444",
              display: "flex",
              justifyContent: "center",
              gap: 18,
              fontSize: 14,
            }}
          >
            <Link href="/about">O alatu</Link>
            <Link href="/help">Pomoć</Link>
            <Link href="/donations">Donacije</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </footer>
        </div>
      </main>

      {/* STILOVI */}
      <style jsx>{`
        a {
          color: #ddd;
          text-decoration: none;
        }
        a:hover {
          color: #fff;
        }

        .widget {
          padding: 14px;
          border-radius: 12px;
          color: #fff;
          text-align: center;
          font-weight: bold;
        }

        .nt {
          background: #e5e5e5;
          color: #b11226;
        }

        .u21 {
          background: linear-gradient(90deg, #b11226, #e11d48);
        }

        .transfer {
          background: #111;
        }

        .placeholder {
          background: #e5e5e5;
          border-radius: 10px;
          padding: 18px;
          text-align: center;
          font-weight: 600;
          color: #444;
        }
      `}</style>
    </>
  );
}
