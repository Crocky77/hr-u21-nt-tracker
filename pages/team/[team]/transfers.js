// pages/team/[team]/transfers.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/AppLayout";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function formatAsking(askingPrice) {
  if (!askingPrice) return "—";
  return `${askingPrice}`;
}

export default function TeamTransfersPage() {
  const router = useRouter();
  const { team } = router.query;

  const safeTeam = team === "u21" ? "u21" : team === "nt" ? "nt" : null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!safeTeam) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await fetch(`/api/transfers/${safeTeam}`).then((r) => r.json());
        if (cancelled) return;
        if (data?.error) throw new Error(data.error);
        setPlayers(Array.isArray(data?.players) ? data.players : []);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [safeTeam]);

  const title = safeTeam ? `Transfer lista — ${teamLabel(safeTeam)}` : "Transfer lista";

  const rows = useMemo(() => players, [players]);

  return (
    <AppLayout title={title}>
      <div className="hr-pageWrap">
        <div className="hr-pageCard">
          <div className="hr-pageHeaderRow">
            <div>
              <h1 className="hr-pageTitle">Transfer lista</h1>
              <div className="hr-pageSub">
                Tim: {safeTeam ? teamLabel(safeTeam) : "—"} · izvor: Toxttrick (privremeno, bez CHPP)
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {safeTeam ? (
                <Link className="hr-backBtn" href={`/team/${safeTeam}`}>
                  ← Natrag na module
                </Link>
              ) : null}
              <Link className="hr-backBtn" href="/">
                Naslovnica
              </Link>
            </div>
          </div>

          {!safeTeam ? (
            <div style={{ marginTop: 14, color: "crimson", fontWeight: 900 }}>
              Neispravan team u URL-u. Koristi /team/u21/transfers ili /team/nt/transfers
            </div>
          ) : loading ? (
            <div style={{ marginTop: 14, opacity: 0.75 }}>Učitavam…</div>
          ) : err ? (
            <div style={{ marginTop: 14, color: "crimson", fontWeight: 900 }}>Greška: {err}</div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Ukupno: {rows.length}</div>

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
                    gridTemplateColumns: "1.4fr 0.6fr 0.9fr 1.2fr 0.9fr",
                    padding: "10px 12px",
                    fontWeight: 900,
                    background: "rgba(0,0,0,0.04)",
                  }}
                >
                  <div>Igrač</div>
                  <div>Dob</div>
                  <div>HT ID</div>
                  <div>Deadline</div>
                  <div>Traži</div>
                </div>

                {rows.length === 0 ? (
                  <div style={{ padding: "12px", opacity: 0.75 }}>Nema rezultata.</div>
                ) : (
                  rows.map((p) => (
                    <div
                      key={p.htId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 0.6fr 0.9fr 1.2fr 0.9fr",
                        padding: "10px 12px",
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{p.name || "—"}</div>
                      <div>{p.ageYears ?? "—"}</div>
                      <div>
                        <a
                          href={p.toxttrickPlayerUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "underline", fontWeight: 900 }}
                        >
                          {p.htId}
                        </a>
                      </div>
                      <div style={{ opacity: 0.85, fontSize: 12 }}>{p.deadline || "—"}</div>
                      <div style={{ fontWeight: 900 }}>{formatAsking(p.askingPrice)}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                Napomena: ovo je privremeno (scrape). Kad dođe CHPP licenca, zamjenjujemo izvor podataka.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
                  }
