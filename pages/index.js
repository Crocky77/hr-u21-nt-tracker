import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* PAGE WRAPPER */}
      <div style={{ minHeight: "100vh", background: "#0b0b0b" }}>
        {/* HEADER */}
        <header
          style={{
            background: "linear-gradient(90deg, #0b0b0b, #1a0f14)",
            borderBottom: "2px solid #c4161c",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="HT" style={{ height: 40 }} />
            <strong style={{ color: "#fff", fontSize: 18 }}>
              Hrvatski U21 / NT Tracker
            </strong>
          </div>
          <div style={{ color: "#bbb" }}>Nisi prijavljen</div>
        </header>

        {/* BACKGROUND */}
        <main
          style={{
            minHeight: "calc(100vh - 70px)",
            background:
              "radial-gradient(circle at center, #5a0d14 0%, #0b0b0b 70%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          {/* CARD */}
          <div
            style={{
              width: "100%",
              maxWidth: 960,
              background: "#1f1f1f",
              borderRadius: 18,
              padding: 32,
              boxShadow: "0 0 60px rgba(0,0,0,0.7)",
            }}
          >
            <h1 style={{ color: "#fff", textAlign: "center" }}>
              Moji igrači u Hrvatskom trackeru
            </h1>

            <p
              style={{
                color: "#ccc",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
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
              <div>
                <strong style={{ color: "#fff" }}>
                  Moji igrači u Hrvatskom trackeru
                </strong>
                <div style={{ color: "#aaa", fontSize: 13 }}>
                  Otvori modul i prijavi se (CHPP kasnije).
                </div>
              </div>

              <button
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
              >
                Prijava (CHPP kasnije)
              </button>
            </div>

            {/* TOP WIDGETS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div style={styles.nt}>NT Hrvatska</div>
              <div style={styles.u21}>U21 Hrvatska</div>
              <div style={styles.transfer}>⇅ Transfer lista</div>
            </div>

            {/* PLACEHOLDERS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={styles.placeholder}>
                  U izradi
                </div>
              ))}
            </div>

            {/* FOOTER (ONLY ONE) */}
            <div
              style={{
                marginTop: 28,
                padding: "14px 0",
                background: "#1a1a1a",
                borderRadius: 12,
                display: "flex",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <Link href="/about">O alatu</Link>
              <Link href="/help">Pomoć</Link>
              <Link href="/donations">Donacije</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        a {
          color: #ddd;
          text-decoration: none;
        }
        a:hover {
          color: #fff;
        }
      `}</style>
    </>
  );
}

const styles = {
  nt: {
    background: "#f2f2f2",
    color: "#c4161c",
    borderRadius: 14,
    padding: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  u21: {
    background: "#c4161c",
    color: "#fff",
    borderRadius: 14,
    padding: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  transfer: {
    background: "#2a0f12",
    color: "#fff",
    borderRadius: 14,
    padding: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  placeholder: {
    background: "#e6e6e6",
    color: "#444",
    borderRadius: 12,
    padding: 18,
    textAlign: "center",
    fontWeight: 600,
  },
};
