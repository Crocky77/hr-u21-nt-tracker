import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Hrvatski U21 / NT Tracker</title>
      </Head>

      {/* POZADINA – NE SMIJE PRIMATI KLIK */}
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at center, #c8381a 0%, #4a0d0d 55%, #120606 100%)",
          paddingTop: "120px",
          pointerEvents: "none", // 🔥 KLJUČNO
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
            pointerEvents: "none", // 🔥 KLJUČNO
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

          {/* WIDGET – MOJI IGRAČI */}
          <div
            style={{
              border: "2px solid #c8381a",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "28px",
              background: "rgba(40,40,40,0.8)",
              pointerEvents: "auto", // ✅ OVDJE SE KLIK VRAĆA
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
                  Upravljanje mojim igračima
                </strong>
                <div style={{ color: "#aaa", fontSize: "13px" }}>
                  Prijava i povezivanje (CHPP kasnije)
                </div>
              </div>

              {/* PRAVI KLIK */}
              <button
                onClick={() => {
                  console.log("CLICK RADI");
                  router.push("/login");
                }}
                style={{
                  background: "#1e6fe3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "18px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  cursor: "pointer",
                  pointerEvents: "auto", // ✅ NAJBITNIJE
                }}
              >
                Prijava
              </button>
            </div>
          </div>

          {/* OSTALI WIDGETI (ZA SADA NEKLIKABILNI) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
              pointerEvents: "none",
            }}
          >
            <div style={smallWidget}>NT Hrvatska</div>
            <div style={{ ...smallWidget, background: "#c8381a" }}>
              U21 Hrvatska
            </div>
            <div style={smallWidget}>Transfer lista</div>
          </div>

          {/* FOOTER */}
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
            O alatu · Pomoć · Donacije · Privacy · Terms
          </div>
        </div>
      </div>
    </>
  );
}

const smallWidget = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: "10px",
  padding: "14px",
  textAlign: "center",
  color: "#fff",
  fontWeight: "bold",
};
