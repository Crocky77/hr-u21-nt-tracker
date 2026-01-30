import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* POZADINA */}
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at center, #c8381a 0%, #4a0d0d 55%, #120606 100%)",
          paddingTop: "120px",
        }}
      >
        {/* CENTRALNI WIDGET */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px",
            background: "rgba(20,20,20,0.75)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
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

          {/* MOJI IGRAČI – JEDINI KLIKABILNI DIO */}
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
              <div
                style={{
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Upravljanje mojim igračima
              </div>
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Prijava i povezivanje (CHPP kasnije)
              </div>
            </div>

            {/* ⬇⬇⬇ OVO RADI UVIJEK ⬇⬇⬇ */}
            <a
              href="/login"
              style={{
                background: "#1e6fe3",
                color: "#fff",
                borderRadius: "18px",
                padding: "10px 22px",
                fontSize: "14px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Prijava
            </a>
          </div>

          {/* NT / U21 / TRANSFER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={widgetBox}>NT Hrvatska</div>
            <div style={{ ...widgetBox, background: "#c8381a" }}>
              U21 Hrvatska
            </div>
            <div style={widgetBox}>Transfer lista</div>
          </div>

          {/* U IZRADI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "14px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <a
                key={i}
                href="/uskoro"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                  color: "#333",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                U izradi
              </a>
            ))}
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

const widgetBox = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "14px",
  textAlign: "center",
  color: "#fff",
  fontWeight: "bold",
};
