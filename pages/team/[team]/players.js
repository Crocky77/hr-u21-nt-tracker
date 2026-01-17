import Link from "next/link";
import { useRouter } from "next/router";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

export default function TeamPlayers() {
  const router = useRouter();
  const { team } = router.query;
  if (!team) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Igrači</h1>
            <div className="hr-pageSub">Aktivni tim: {teamLabel(team)} (preview)</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={`/team/${team}`}>
              ← Natrag na module
            </Link>
            <Link className="hr-backBtn" href="/">
              Naslovnica
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            placeholder="Search: ime, HT ID, pozicija..."
            style={{
              flex: "1",
              minWidth: 240,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
            }}
          />
          <button
            type="button"
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(255,255,255,0.9)",
              fontWeight: 900,
              cursor: "pointer",
            }}
            onClick={() => alert("Učitavanje igrača dolazi kad spojimo DB/CHPP.")}
          >
            Osvježi
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Popis igrača (0)</div>
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.8fr 0.8fr 1fr 1fr",
                gap: 0,
                padding: "10px 12px",
                fontWeight: 900,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Ime</div>
              <div>Poz</div>
              <div>Status</div>
              <div>HT ID</div>
              <div>Akcija</div>
            </div>
            <div style={{ padding: "12px", opacity: 0.7 }}>Nema rezultata.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
