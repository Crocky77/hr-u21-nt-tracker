// pages/index.js
import Link from "next/link";
import HrCard from "../components/HrCard";

export default function Home() {
  // Staff prikaz (privacy: bez maila, bez nicka — samo label)
  const StaffBlock = ({ team }) => {
    const isU21 = team === "U21";
    const labelStyle = {
      fontWeight: 700,
      color: isU21 ? "#b91c1c" : "#1d4ed8", // U21 crveno, NT plavo
      marginRight: 6,
    };

    // Traženi tekst (isti format za oba)
    return (
      <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.35 }}>
        <div>
          <span style={labelStyle}>Izbornik:</span>
          nepoznato
        </div>
        <div>
          <span style={labelStyle}>Pomoćnik izbornika:</span>
          nepoznato
        </div>
        <div style={{ marginTop: 6 }}>
          <span style={labelStyle}>Osoblje:</span>
        </div>
        <div>
          <span style={labelStyle}>Glavni skaut:</span>
          nepoznato
        </div>
        <div>
          <span style={labelStyle}>Skaut(i):</span>
          nepoznato
        </div>
      </div>
    );
  };

  // Transfer modul (HR boje)
  const transferCardStyle = {
    borderRadius: 22,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.35)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
    background:
      "linear-gradient(90deg, rgba(220,38,38,0.18) 0%, rgba(255,255,255,0.22) 50%, rgba(37,99,235,0.18) 100%)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    marginTop: 14,
  };

  const pill = (bg, color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    background: bg,
    color,
    fontWeight: 800,
    fontSize: 12,
    border: "1px solid rgba(0,0,0,0.08)",
  });

  const openBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.85)",
    fontWeight: 900,
    border: "1px solid rgba(0,0,0,0.08)",
  };

  return (
    <div className="hr-heroWrap">
      <div className="hr-heroCard">
        <h1 className="hr-title">Hrvatski U21/NT Tracker</h1>
        <p className="hr-subtitle">
          Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez
          prijave.
        </p>

        <div className="hr-btnRow">
          <Link className="hr-pillBtn" href="/about">
            O alatu
          </Link>
          <Link className="hr-pillBtn" href="/help">
            Pomoć
          </Link>
          <Link className="hr-pillBtn" href="/donate">
            Donacije
          </Link>
          <Link className="hr-pillBtn" href="/privacy">
            Privacy
          </Link>
          <Link className="hr-pillBtn" href="/terms">
            Terms
          </Link>
        </div>

        {/* U21 + NT kartice */}
        <div className="hr-grid2">
          <div>
            <HrCard
              title="Hrvatska U21"
              description="Pregled modula (preview). Igrači i skillovi su zaključani bez prijave."
              badge="U21"
              href="/dashboard"
            />
            <StaffBlock team="U21" />
          </div>

          <div>
            <HrCard
              title="Hrvatska NT"
              description="Pregled modula (preview). Igrači i skillovi su zaključani bez prijave."
              badge="NT"
              href="/dashboard_nt"
            />
            <StaffBlock team="NT" />
          </div>
        </div>

        {/* Moji igrači */}
        <div className="hr-wideCard">
          <div>
            <h2 className="hr-wideTitle">Moji igrači u Hrvatskom trackeru</h2>
            <p className="hr-wideDesc">
              CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji
              igrači”.
            </p>
          </div>

          <Link className="hr-loginBtn" href="/login">
            Prijava (CHPP kasnije)
          </Link>
        </div>

        {/* TRANSFER MODUL (VRACEN) */}
        <div style={transferCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                Hrvatski U21/NT igrači na transfer listi
              </h2>
              <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>
                Live (privremeno): Toxttrick scraping — samo hrvatski igrači,
                rotacija svakih 6h
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={pill("rgba(37,99,235,0.12)", "#1d4ed8")}>U21 (0)</span>
              <span style={pill("rgba(220,38,38,0.12)", "#b91c1c")}>NT (0)</span>

              {/* VAŽNO: link ostaje isti kao prije — ako tvoja stranica koristi drugi path,
                  samo mi reci koji je path i promijenit ćemo. */}
              <Link href="/transferi" style={openBtnStyle}>
                Otvori popis <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
            Nema hrvatskih igrača na TL (po izvoru).
          </div>
        </div>

        <p className="hr-note">
          Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje
          prikazuju igrače/skillove traže prijavu.
        </p>
      </div>
    </div>
  );
            }
