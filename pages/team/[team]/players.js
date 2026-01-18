import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// VAŽNO: u projektu smo standardizirali da supabaseClient exporta NAMED export.
// Ako tvoj file exporta default, javi i odmah ću ti dati FULL FIX i za supabaseClient.
import { supabase } from "../../../utils/supabaseClient";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function safeJson(obj) {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export default function TeamPlayers() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [teamId, setTeamId] = useState(null);

  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const [q, setQ] = useState("");

  // FUTURE: kad dodamo tablicu igrača, ovdje će ići results
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!team) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      setPlayers([]);
      setRequests([]);
      setSelectedRequestId("");
      setTeamId(null);

      try {
        // 1) Dohvati team_id iz teams po slug-u (u21/nt)
        const tRes = await supabase.from("teams").select("id, slug, name").eq("slug", team).single();

        if (tRes.error) throw tRes.error;
        if (!tRes.data?.id) throw new Error("Team nije pronađen u tablici teams.");

        if (cancelled) return;
        setTeamId(tRes.data.id);

        // 2) Dohvati zahtjeve za taj team
        const rRes = await supabase
          .from("team_requests")
          .select("id, title, status, criteria, created_at")
          .eq("team_id", tRes.data.id)
          .order("created_at", { ascending: false });

        if (rRes.error) throw rRes.error;

        if (cancelled) return;
        const list = Array.isArray(rRes.data) ? rRes.data : [];
        setRequests(list);

        // Auto-select prvi zahtjev (ako postoji)
        if (list.length > 0) setSelectedRequestId(list[0].id);

        // 3) FUTURE: ovdje ćemo napraviti query igrača po selectedRequest.criteria
        // Za sada ostaje 0 rezultata, jer nemamo punu tablicu igrača/skillova u ovom flow-u.
        setPlayers([]);
      } catch (e) {
        if (cancelled) return;
        setErr(e?.message || "Greška pri učitavanju.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [team]);

  if (!team) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Igrači</h1>
            <div className="hr-pageSub">Aktivni tim: {teamLabel(team)} (prema zahtjevima)</div>
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

        {/* STATUS / ERROR */}
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div style={{ opacity: 0.75, fontWeight: 900 }}>Učitavanje...</div>
          ) : err ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.06)",
                color: "rgba(153,27,27,0.95)",
                fontWeight: 900,
                whiteSpace: "pre-wrap",
              }}
            >
              Greška: {err}
            </div>
          ) : (
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              Team ID: <span style={{ fontWeight: 900 }}>{teamId || "—"}</span> · Zahtjeva:{" "}
              <span style={{ fontWeight: 900 }}>{requests.length}</span>
            </div>
          )}
        </div>

        {/* REQUEST SELECT */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 220, fontWeight: 1000 }}>Odaberi zahtjev:</div>

          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            style={{
              flex: "1",
              minWidth: 240,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              background: "rgba(255,255,255,0.95)",
              fontWeight: 900,
            }}
            disabled={loading || !!err || requests.length === 0}
          >
            {requests.length === 0 ? (
              <option value="">Nema zahtjeva (idi na “Zahtjevi” i kreiraj)</option>
            ) : (
              requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.status ? `(${r.status})` : ""}
                </option>
              ))
            )}
          </select>

          <Link
            className="hr-backBtn"
            href={`/team/${team}/requests`}
            style={{ fontSize: 13, padding: "10px 14px" }}
          >
            + Novi zahtjev
          </Link>
        </div>

        {/* QUICK FILTER (lokalno) */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (kasnije): ime, HT ID, pozicija..."
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
            onClick={() => alert("Učitavanje igrača dolazi kad spojimo tablicu igrača + query po criteria.")}
          >
            Osvježi
          </button>
        </div>

        {/* REQUEST DETAILS (da potvrdiš da radi “zahtjev → criteria”) */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Odabrani zahtjev (criteria preview)</div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div style={{ padding: 12, background: "rgba(0,0,0,0.04)", fontWeight: 900 }}>
              {selectedRequest ? selectedRequest.title : "—"}
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                fontSize: 12,
                lineHeight: "1.25rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                opacity: 0.9,
              }}
            >
              {selectedRequest ? safeJson(selectedRequest.criteria) : "Nema odabranog zahtjeva."}
            </pre>
          </div>
        </div>

        {/* PLAYERS TABLE (placeholder dok ne dođe full DB) */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Popis igrača ({players.length})</div>

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

            {players.length === 0 ? (
              <div style={{ padding: "12px", opacity: 0.7 }}>
                Nema rezultata — trenutno je ovo “skeleton”.
                <br />
                Sljedeći korak: dodati tablicu igrača + query “criteria → rezultati”.
              </div>
            ) : (
              players
                .filter((p) => {
                  if (!q.trim()) return true;
                  const s = q.trim().toLowerCase();
                  return (
                    (p.name || "").toLowerCase().includes(s) ||
                    String(p.ht_player_id || "").includes(s) ||
                    (p.position || "").toLowerCase().includes(s)
                  );
                })
                .map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 0.8fr 0.8fr 1fr 1fr",
                      padding: "10px 12px",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{p.name}</div>
                    <div>{p.position || "—"}</div>
                    <div>{p.status || "—"}</div>
                    <div>{p.ht_player_id || "—"}</div>
                    <div style={{ fontWeight: 900, textDecoration: "underline" }}>Otvori →</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
                   }
