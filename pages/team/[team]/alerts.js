import Link from "next/link";
import { useRouter } from "next/router";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

export default function TeamAlerts() {
  const router = useRouter();
  const { team } = router.query;
  if (!team) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Upozorenja</h1>
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
            placeholder="Search: message / severity / type..."
            style={{
              flex: "1",
              minWidth: 260,
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
            onClick={() => alert("Alert logika dolazi kad definiramo pravila + DB.")}
          >
            Osvježi
          </button>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Training alerti (0)</div>
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
                gridTemplateColumns: "1fr 1fr 1fr 2fr 1fr 1fr",
                padding: "10px 12px",
                fontWeight: 900,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Status</div>
              <div>Severity</div>
              <div>Type</div>
              <div>Message</div>
              <div>Due</div>
              <div>Akcija</div>
            </div>
            <div style={{ padding: "12px", opacity: 0.7 }}>Nema alertova za ovaj tim.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
