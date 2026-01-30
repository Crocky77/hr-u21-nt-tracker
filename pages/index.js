import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* CIJELA POZADINA – NE PRIMA KLIK */}
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at center, #c8381a 0%, #4a0d0d 55%, #120606 100%)",
          paddingTop: "120px",
          pointerEvents: "none",
        }}
      >
        {/* CENTRALNI WIDGET – PRIMA KLIK */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px",
            background: "rgba(20,20,20,0.75)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            pointerEvents: "auto",
          }}
        >
          <h1 style={{ textAlign: "center", color: "#fff" }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#ccc",
              marginBottom: "28px",
              fontSize: "14px",
            }}
          >
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
          </p>

          {/* MOJI IGRAČI */}
          <div
            style={{
              border: "2px solid #c8381a",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "32px",
              background: "rgba(35,35,35,0.85)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ color: "#fff", fontWeight: "bold" }}>
                Upravljanje mojim igračima
              </div>
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Prijava i povezivanje (CHPP kasnije)
              </div>
            </div>

            {/* LINK KOJI SADA MORA RADITI */}
            <a
              href="/login"
              style={{
                background: "#1e6fe3",
                color: "#fff",
                borderRadius: "18px",
                padding: "10px 22px",
                fontWeight: "bold",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Prijava
            </a>
          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: "32px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
              fontSize: "13px",
              color: "#ccc",
            }}
          >
            <a href="/about">O alatu</a> ·{" "}
            <a href="/help">Pomoć</a> ·{" "}
            <a href="/donations">Donacije</a> ·{" "}
            <a href="/privacy">Privacy</a> ·{" "}
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </>
  );
}
