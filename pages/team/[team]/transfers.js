// pages/team/[team]/transfers.js
import Link from "next/link";
import { useRouter } from "next/router";

function safeStr(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function TransfersTeamPage() {
  const router = useRouter();
  const team = safeStr(router.query.team || "").toLowerCase();

  const isValidTeam = team === "u21" || team === "nt";
  const teamLabel = team === "u21" ? "Hrvatska U21" : team === "nt" ? "Hrvatska NT" : "Tim";

  if (!isValidTeam) {
    return (
      <div className="hr-homeBg">
        <main className="hr-main">
          <div className="hr-container">
            <div className="hr-3dCard">
              <div className="hr-3dCardInner">
                <div style={{ fontWeight: 1000, fontSize: 24 }}>Transfer lista</div>
                <div style={{ marginTop: 8, opacity: 0.85 }}>
                  Neispravan tim. Koristi <b>/team/u21/transfers</b> ili <b>/team/nt/transfers</b>.
                </div>

                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="hr-homePill" href="/team/u21" style={{ textDecoration: "none" }}>
                    ← Natrag na U21 module
                  </Link>
                  <Link className="hr-homePill" href="/team/nt" style={{ textDecoration: "none" }}>
                    ← Natrag na NT module
                  </Link>
                  <Link className="hr-homePill" href="/" style={{ textDecoration: "none" }}>
                    Naslovnica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hr-homeBg">
      <main className="hr-main">
        <div className="hr-container">
          <div className="hr-3dCard">
            <div className="hr-3dCardInner">
              <div style={{ fontWeight: 1000, fontSize: 40, letterSpacing: -0.5 }}>Transfer lista</div>

              <div style={{ marginTop: 6, opacity: 0.85 }}>
                Tim: <b>{teamLabel}</b>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="hr-homePill" href={`/team/${team}`} style={{ textDecoration: "none" }}>
                  ← Natrag na module
                </Link>
                <Link className="hr-homePill" href="/" style={{ textDecoration: "none" }}>
                  Naslovnica
                </Link>
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(10,63,168,0.08)",
                  border: "1px solid rgba(10,63,168,0.18)",
                }}
              >
                <div style={{ fontWeight: 1000, fontSize: 18 }}>Privremeno nedostupno</div>
                <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.4 }}>
                  Transfer modul je privremeno isključen.
                  <br />
                  Aktivirat će se nakon dobivanja službene <b>CHPP licence</b> (službeni izvor podataka).
                </div>
              </div>

              <div style={{ marginTop: 12, opacity: 0.8, fontSize: 13 }}>
                (Napomena: “scraping” izvori tipa Toxttrick ne rade pouzdano jer se transfer lista učitava dinamički.)
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
