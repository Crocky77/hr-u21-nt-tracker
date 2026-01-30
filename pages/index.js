import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* BACKGROUND */}
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: "url(/backgrounds/home-red.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* MAIN WRAPPER */}
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            background: "rgba(0,0,0,0.65)",
            borderRadius: 16,
            padding: 32,
            color: "#fff",
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* TITLE */}
          <h1 style={{ textAlign: "center", marginBottom: 8 }}>
            Moji igrači u Hrvatskom trackeru
          </h1>
          <p style={{ textAlign: "center", opacity: 0.85, marginBottom: 24 }}>
            Prijava i upravljanje igračima (CHPP kasnije).
          </p>

          {/* === MOJI IGRACI WIDGET (KLIKABILAN) === */}
          <div
            style={{
              border: "2px solid #b11226",
              borderRadius: 14,
              padding: 20,
              marginBottom: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.55)",
            }}
          >
            <div>
              <strong>Upravljanje mojim igračima</strong>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Admin login (email) + CHPP povezivanje (uskoro)
              </div>
            </div>

            {/* ADMIN LOGIN – SIGURAN LINK */}
            <a
              href="/login"
              style={{
                padding: "8px 16px",
                background: "#b11226",
                color: "#fff",
                borderRadius: 20,
                fontWeight: 600,
                textDecoration: "none",
                pointerEvents: "auto",
                position: "relative",
                zIndex: 10,
              }}
            >
              Admin login
            </a>
          </div>

          {/* === MAIN BUTTONS === */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: "#ddd",
                color: "#000",
                padding: 14,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              NT Hrvatska
            </div>

            <div
              style={{
                background: "#b11226",
                color: "#fff",
                padding: 14,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              U21 Hrvatska
            </div>

            <div
              style={{
                background: "#333",
                color: "#fff",
                padding: 14,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Transfer lista
            </div>
          </div>

          {/* === PLACEHOLDER WIDGETS === */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <a
                key={i}
                href="/uskoro"
                style={{
                  background: "#eee",
                  color: "#000",
                  padding: 14,
                  borderRadius: 10,
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                U izradi
              </a>
            ))}
          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: 30,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "center",
              gap: 16,
              fontSize: 13,
              opacity: 0.8,
            }}
          >
            <a href="/about" style={{ color: "#fff" }}>
              O alatu
            </a>
            <a href="/help" style={{ color: "#fff" }}>
              Pomoć
            </a>
            <a href="/donacije" style={{ color: "#fff" }}>
              Donacije
            </a>
            <a href="/privacy" style={{ color: "#fff" }}>
              Privacy
            </a>
            <a href="/terms" style={{ color: "#fff" }}>
              Terms
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
