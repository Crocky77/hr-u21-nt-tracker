import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* HEADER */}
      <header
        style={{
          background: "#0f0f0f",
          borderBottom: "2px solid #b11226",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
          <strong style={{ color: "#fff" }}>
            Hrvatski U21 / NT Tracker
          </strong>
        </div>
        <span style={{ color: "#ccc" }}>Nisi prijavljen</span>
      </header>

      {/* CONTENT */}
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
          <h1 style={{ color: "#fff" }}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={{ color: "#ccc", marginBottom: "30px" }}>
            Prijava i upravljanje igračima (CHPP kasnije).
          </p>

          {/* 🔥 MOJI IGRAČI – FULL CLICK WIDGET */}
          <div
            onClick={() => router.push("/login")}
            style={{
              cursor: "pointer",
              border: "2px solid #b11226",
              borderRadius: "18px",
              padding: "24px",
              marginBottom: "40px",
              background: "rgba(0,0,0,0.4)",
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
                  Admin login (email) + CHPP povezivanje (uskoro)
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div
                  style={{
                    padding: "10px 18px",
                    background: "#b11226",
                    color: "#fff",
                    borderRadius: "20px",
                    fontWeight: 600,
                  }}
                >
                  Admin login
                </div>

                <div
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
                </div>
              </div>
            </div>
          </div>

          {/* MODULES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "30px",
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
              gap: "16px",
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
              marginTop: "50px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              gap: "20px",
              fontSize: "14px",
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
  padding: "26px",
  borderRadius: "14px",
  color: "#fff",
  fontWeight: "700",
  textAlign: "center",
};

const placeholder = {
  background: "#e6e6e6",
  padding: "18px",
  borderRadius: "12px",
  color: "#333",
  fontWeight: "600",
  textAlign: "center",
};
