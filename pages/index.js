import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* POZADINA – NE DIRATI (TASK 1 ZAKLJUČAN) */}
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at center, #c8381a 0%, #4a0d0d 55%, #120606 100%)",
          paddingTop: "120px",
        }}
      >
        {/* GLAVNI CONTAINER */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px",
            background: "rgba(20,20,20,0.65)",
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* NASLOV */}
          <h1
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: "8px",
            }}
          >
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

          {/* ============================= */}
          {/* GLAVNI WIDGET – MOJI IGRAČI */}
          {/* ============================= */}
          <Link href="/login" style={{ textDecoration: "none" }}>
            <div
              style={{
                border: "2px solid #c8381a",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "28px",
                background: "rgba(40,40,40,0.8)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div>
                  <strong style={{ color: "#fff", fontSize: "16px" }}>
                    Moji igrači u Hrvatskom trackeru
                  </strong>
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    Otvori modul i prijavi se (CHPP kasnije)
                  </div>
                </div>

                <button
                  style={{
                    background: "#1e6fe3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "18px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Prijava (CHPP kasnije)
                </button>
              </div>
            </div>
          </Link>

          {/* ============================= */}
          {/* OSTALI WIDGETI – PLACEHOLDER */}
          {/* ============================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={smallWidget}>NT Hrvatska</div>
            <div style={{ ...smallWidget, background: "#c8381a" }}>
              U21 Hrvatska
            </div>
            <div style={smallWidget}>Transfer lista</div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={comingSoon}>
                U izradi
              </div>
            ))}
          </div>

          {/* FOOTER (NE DIRATI SADA) */}
          <div
            style={{
              marginTop: "26px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              textAlign: "center",
              fontSize: "13px",
              color: "#ccc",
            }}
          >
            O alatu &nbsp;&nbsp; Pomoć &nbsp;&nbsp; Donacije &nbsp;&nbsp;
            Privacy &nbsp;&nbsp; Terms
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================= */
/* STILOVI */
/* ============================= */

const smallWidget = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "14px",
  textAlign: "center",
  color: "#fff",
  fontWeight: "bold",
};

const comingSoon = {
  background: "#e9e9e9",
  borderRadius: "10px",
  padding: "14px",
  textAlign: "center",
  color: "#333",
  fontWeight: "bold",
};
