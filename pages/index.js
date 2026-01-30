import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* ================= HEADER ================= */}
      <header
        style={{
          background: "#0f0f0f",
          borderBottom: "2px solid #b11226",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
          <span style={{ color: "#fff", fontWeight: 700 }}>
            Hrvatski U21 / NT Tracker
          </span>
        </div>

        <div style={{ color: "#ccc", fontSize: "14px" }}>Nisi prijavljen</div>
      </header>

      {/* ================= CONTENT ================= */}
      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background:
            "radial-gradient(circle at center, #7a1414 0%, #2b0a0a 60%, #0b0505 100%)",
          padding: "50px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            background: "rgba(20,20,20,0.75)",
            borderRadius: "18px",
            padding: "40px",
          }}
        >
          <h1 style={{ color: "#fff", marginBottom: "10px" }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ color: "#ccc", marginBottom: "30px" }}>
            Prijava i upravljanje igračima (CHPP kasnije).
          </p>

          {/* ================= MOJI IGRAČI WIDGET ================= */}
          <Link href="/login">
            <a
              style={{
                display: "block",
                border: "2px solid #b11226",
                borderRadius: "18px",
                padding: "24px",
                marginBottom: "40px",
                textDecoration: "none",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div>
                  <h3 style={{ color: "#fff", marginBottom: "6px" }}>
                    Upravljanje mojim igračima
                  </h3>
                  <p style={{ color: "#ccc", margin: 0 }}>
                    Admin prijava (email) + CHPP povezivanje (uskoro)
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      padding: "10px 18px",
                      background: "#b11226",
                      color: "#fff",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                  >
                    Admin login
                  </span>

                  <span
                    style={{
                      padding: "10px 18px",
                      background: "#555",
                      color: "#ddd",
                      borderRadius: "20px",
                      fontWeight: 600,
                      opacity: 0.6,
                    }}
                  >
                    CHPP (uskoro)
                  </span>
                </div>
              </div>
            </a>
          </Link>

          {/* ================= MAIN MODULES ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <Link href="/team/nt">
              <a style={cardStyle}>NT Hrvatska</a>
            </Link>

            <Link href="/team/u21">
              <a style={cardStyleActive}>U21 Hrvatska</a>
            </Link>

            <Link href="/transfers">
              <a style={cardStyle}>Transfer lista</a>
            </Link>
          </div>

          {/* ================= PLACEHOLDERS ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Link href="/uskoro" key={i}>
                <a style={placeholderStyle}>U izradi</a>
              </Link>
            ))}
          </div>

          {/* ================= FOOTER ================= */}
          <footer
            style={{
              marginTop: "50px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              fontSize: "14px",
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
    </>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "rgba(255,255,255,0.08)",
  padding: "26px",
  borderRadius: "14px",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "700",
  textAlign: "center",
};

const cardStyleActive = {
  ...cardStyle,
  background: "#b11226",
};

const placeholderStyle = {
  background: "#e6e6e6",
  padding: "18px",
  borderRadius: "12px",
  color: "#333",
  textDecoration: "none",
  fontWeight: "600",
  textAlign: "center",
};
