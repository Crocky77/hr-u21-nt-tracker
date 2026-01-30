import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>
            Moji igrači u Hrvatskom trackeru
          </h1>

          <p style={subtitleStyle}>
            CHPP dozvola je kasnije. Za sada pripremamo UI + DB za "moji igrači".
          </p>

          {/* MOJI IGRACI – JEDINI KLIKABILNI BLOK */}
          <div style={myPlayersBox}>
            <div>
              <strong>Moji igrači u Hrvatskom trackeru</strong>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Otvori modul i prijavi se (CHPP kasnije).
              </div>
            </div>

            <button style={loginButton}>
              Prijava (CHPP kasnije)
            </button>
          </div>

          {/* GLAVNI WIDGETI */}
          <div style={mainWidgets}>
            <div style={widgetNT}>NT Hrvatska</div>
            <div style={widgetU21}>U21 Hrvatska</div>
            <div style={widgetTransfer}>Transfer lista</div>
          </div>

          {/* U IZRADI GRID */}
          <div style={grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={comingBox}>U izradi</div>
            ))}
          </div>

          {/* JEDINI FOOTER – GORNJI */}
          <div style={footer}>
            <a href="/about" style={footerLink}>O alatu</a>
            <a href="/help" style={footerLink}>Pomoć</a>
            <a href="/donations" style={footerLink}>Donacije</a>
            <a href="/privacy" style={footerLink}>Privacy</a>
            <a href="/terms" style={footerLink}>Terms</a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================== STILOVI ================== */

const pageStyle = {
  minHeight: "100vh",
  backgroundImage: "url(/backgrounds/home-red.jpg)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardStyle = {
  width: "100%",
  maxWidth: 1100,
  background: "rgba(35,35,35,0.88)",
  borderRadius: 18,
  padding: "32px 36px 28px",
  color: "#fff",
};

const titleStyle = {
  textAlign: "center",
  fontSize: 34,
  marginBottom: 8,
};

const subtitleStyle = {
  textAlign: "center",
  opacity: 0.8,
  marginBottom: 22,
};

const myPlayersBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(60,60,60,0.85)",
  padding: "16px 18px",
  borderRadius: 12,
  marginBottom: 22,
};

const loginButton = {
  background: "#2f7cf6",
  border: "none",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 20,
  cursor: "pointer",
};

const mainWidgets = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 14,
  marginBottom: 26,
};

const widgetNT = {
  padding: 18,
  borderRadius: 12,
  background: "#eaeaea",
  color: "#b00000",
  fontWeight: "bold",
};

const widgetU21 = {
  padding: 18,
  borderRadius: 12,
  background: "#c00000",
  color: "#fff",
  fontWeight: "bold",
};

const widgetTransfer = {
  padding: 18,
  borderRadius: 12,
  background: "#1f1f1f",
  color: "#fff",
  fontWeight: "bold",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 14,
  marginBottom: 34,
};

const comingBox = {
  background: "#e6e6e6",
  color: "#555",
  padding: "18px 0",
  textAlign: "center",
  borderRadius: 10,
  fontWeight: "bold",
};

const footer = {
  marginTop: 24,
  paddingTop: 16,
  paddingBottom: 14,
  background: "rgba(45,45,45,0.85)",
  borderRadius: 12,
  display: "flex",
  justifyContent: "center",
  gap: 28,
};

const footerLink = {
  color: "#e0e0e0",
  fontSize: 14,
  textDecoration: "none",
};
