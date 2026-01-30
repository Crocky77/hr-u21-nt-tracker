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
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* LEFT: LOGO + TITLE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src="/logo.png"
              alt="Hrvatski U21 / NT Tracker"
              style={{
                height: "40px",
                width: "auto",
              }}
            />
            <span
              style={{
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: "700",
                whiteSpace: "nowrap",
              }}
            >
              Hrvatski U21 / NT Tracker
            </span>
          </div>

          {/* RIGHT: AUTH STATUS */}
          <div
            style={{
              color: "#cccccc",
              fontSize: "14px",
            }}
          >
            Nisi prijavljen
          </div>
        </div>
      </header>

      {/* ================= PAGE CONTENT (BASELINE) ================= */}
      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background:
            "radial-gradient(circle at center, #7a1414 0%, #2b0a0a 60%, #0b0505 100%)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "rgba(20,20,20,0.75)",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          {/* MAIN WIDGET */}
          <h1 style={{ color: "#ffffff", marginBottom: "16px" }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ color: "#cccccc", marginBottom: "24px" }}>
            Prijava i upravljanje igračima (CHPP kasnije).
          </p>

          <Link href="/my-players">
            <a
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#b11226",
                color: "#ffffff",
                borderRadius: "20px",
                textDecoration: "none",
                fontWeight: "600",
                marginBottom: "32px",
              }}
            >
              Prijava (CHPP kasnije)
            </a>
          </Link>

          {/* NT / U21 / TRANSFER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <Link href="/team/nt">
              <a style={cardStyle}>NT Hrvatska</a>
            </Link>

            <Link href="/team/u21">
              <a style={cardStyle}>U21 Hrvatska</a>
            </Link>

            <Link href="/transfers">
              <a style={cardStyle}>Transfer lista</a>
            </Link>
          </div>

          {/* U IZRADI */}
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

          {/* FOOTER */}
          <footer
            style={{
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              color: "#cccccc",
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

const cardStyle = {
  background: "rgba(255,255,255,0.08)",
  padding: "24px",
  borderRadius: "14px",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "700",
  textAlign: "center",
};

const placeholderStyle = {
  background: "#e6e6e6",
  padding: "18px",
  borderRadius: "12px",
  color: "#333333",
  textDecoration: "none",
  fontWeight: "600",
  textAlign: "center",
};
