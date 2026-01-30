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
          background: "#111",
          borderBottom: "2px solid #b11226",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
          <strong style={{ color: "#fff" }}>
            Hrvatski U21 / NT Tracker
          </strong>
        </div>
        <span style={{ color: "#bbb" }}>Nisi prijavljen</span>
      </header>

      {/* CONTENT */}
      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background:
            "radial-gradient(circle at center, #7a1414 0%, #2b0a0a 60%, #0b0505 100%)",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            background: "rgba(20,20,20,0.75)",
            borderRadius: 18,
            padding: "40px",
          }}
        >
          <h1 style={{ color: "#fff", marginBottom: 6 }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ color: "#ccc", marginBottom: 24 }}>
            Prijava i upravljanje igračima (CHPP kasnije).
          </p>

          {/* MOJI IGRAČI – MANJI, MIRNI WIDGET */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14,
              padding: "20px",
              marginBottom: 36,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <strong style={{ color: "#fff" }}>
              Upravljanje mojim igračima
            </strong>
            <p style={{ color: "#aaa", margin: "6px 0 16px" }}>
              Admin login (email) + CHPP povezivanje (uskoro)
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/login">
                <a
                  style={{
                    padding: "8px 16px",
                    background: "#b11226",
                    color: "#fff",
                    borderRadius: 20,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Admin login
                </a>
              </Link>

              <span
                style={{
                  padding: "8px 16px",
                  background: "#555",
                  color: "#ddd",
                  borderRadius: 20,
                  fontWeight: 600,
                  opacity: 0.6,
                }}
              >
                CHPP (uskoro)
              </span>
            </div>
          </div>

          {/* MODULES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginBottom: 28,
            }}
          >
            <div style={card}>NT Hrvatska</div>
            <div style={{ ...card, background: "#b11226" }}>
              U21 Hrvatska
            </div>
            <div style={card}>Transfer lista</div>
          </div>

          {/* PLACEHOLDERS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={placeholder}>
                U izradi
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <footer
            style={{
              marginTop: 40,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              gap: 20,
              fontSize: 14,
              color: "#ccc",
            }}
          >
            <span>O alatu</span>
            <span>Pomoć</span>
            <span>Donacije</span>
            <span>Privacy</span>
            <span>Terms</span>
          </footer>
        </div>
      </main>
    </>
  );
}

const card = {
  background: "rgba(255,255,255,0.08)",
  padding: "24px",
  borderRadius: 14,
  color: "#fff",
  fontWeight: 700,
  textAlign: "center",
};

const placeholder = {
  background: "#e6e6e6",
  padding: "16px",
  borderRadius: 12,
  color: "#333",
  fontWeight: 600,
  textAlign: "center",
};
