import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Supabase import – kompatibilno s više varijanti exporta:
 * - export default supabase
 * - export const supabase
 * - export const supabaseClient
 */
import * as supabaseModule from "../utils/supabaseClient";
const supabase =
  supabaseModule?.default ||
  supabaseModule?.supabase ||
  supabaseModule?.supabaseClient;

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function safeJsonParse(str) {
  try {
    const v = JSON.parse(str);
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: e?.message || "Neispravan JSON" };
  }
}

export default function RequestsClient({ team }) {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  const [teamId, setTeamId] = useState(null);
  const [teamIdLoading, setTeamIdLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState(50);
  const [criteriaText, setCriteriaText] = useState(
    JSON.stringify(
      {
        q: "spec",
        age_min: null,
        age_max: 21,
        position: null,
        skills: { goalkeeping: 8 },
      },
      null,
      2
    )
  );

  const base = useMemo(() => `/team/${team}`, [team]);
  const title = useMemo(() => teamLabel(team), [team]);

  // 1) get session user
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        if (!supabase?.auth?.getSession) {
          // Ako supabaseClient nije dobro postavljen, pokaži jasnu grešku
          if (mounted) {
            setSessionUser(null);
            setError(
              "Supabase client nije dostupan. Provjeri utils/supabaseClient.js export."
            );
          }
          return;
        }

        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user || null;
        if (mounted) setSessionUser(user);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod čitanja sessiona.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) resolve teamId from teams.slug
  useEffect(() => {
    let mounted = true;

    async function loadTeamId() {
      setTeamIdLoading(true);
      setError("");

      try {
        if (!team) return;
        if (!supabase?.from) return;

        const { data, error: e } = await supabase
          .from("teams")
          .select("id, slug")
          .eq("slug", team)
          .maybeSingle();

        if (e) throw e;

        if (!data?.id) {
          throw new Error(
            `Ne mogu naći tim u tablici teams za slug="${team}".`
          );
        }

        if (mounted) setTeamId(data.id);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod dohvaćanja teamId.");
      } finally {
        if (mounted) setTeamIdLoading(false);
      }
    }

    loadTeamId();

    return () => {
      mounted = false;
    };
  }, [team]);

  async function refresh() {
    setError("");
    try {
      if (!supabase?.from) return;
      if (!teamId) return;

      const { data, error: e } = await supabase
        .from("team_requests")
        .select(
          "id, name, status, priority, created_at, updated_at, created_by"
        )
        .eq("team_id", teamId)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (e) throw e;
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Greška kod učitavanja zahtjeva.");
    }
  }

  // 3) load requests
  useEffect(() => {
    if (!teamIdLoading && teamId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdLoading, teamId]);

  async function createRequest() {
    setError("");

    if (!sessionUser?.id) {
      setError("Moraš biti prijavljen da bi kreirao zahtjev.");
      return;
    }

    if (!teamId) {
      setError("teamId nije spreman (teams.slug lookup nije uspio).");
      return;
    }

    if (!name.trim()) {
      setError("Naziv zahtjeva je obavezan.");
      return;
    }

    const parsed = safeJsonParse(criteriaText);
    if (!parsed.ok) {
      setError(`Criteria JSON error: ${parsed.error}`);
      return;
    }

    const pr = Number(priority);
    const prNorm = Number.isFinite(pr) ? pr : 50;

    try {
      const payload = {
        team_id: teamId,
        created_by: sessionUser.id,
        name: name.trim(),
        status,
        priority: prNorm,
        criteria: parsed.value,
      };

      const { error: e } = await supabase.from("team_requests").insert(payload);
      if (e) throw e;

      setCreateOpen(false);
      setName("");
      setStatus("open");
      setPriority(50);
      await refresh();
    } catch (e) {
      setError(e?.message || "Greška kod kreiranja zahtjeva.");
    }
  }

  if (loading) {
    return (
      <div className="hr-pageWrap">
        <div className="hr-pageCard">
          <div style={{ fontWeight: 900 }}>Učitavam…</div>
        </div>
      </div>
    );
  }

  // Guest / not logged in: show preview only
  const isLoggedIn = !!sessionUser?.id;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Zahtjevi — {title}</h1>
            <div className="hr-pageSub">
              Zahtjevi su “srce” trackera: kasnije će filtrirati stranicu Igrači i
              puniti liste.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={base}>
              ← Natrag
            </Link>

            {isLoggedIn ? (
              <button
                className="hr-backBtn"
                type="button"
                onClick={() => setCreateOpen((v) => !v)}
              >
                + Novi zahtjev
              </button>
            ) : (
              <span
                className="hr-backBtn"
                style={{ opacity: 0.75, cursor: "default" }}
              >
                Zaključano bez prijave
              </span>
            )}
          </div>
        </div>

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(220,38,38,0.06)",
              color: "rgba(220,38,38,0.95)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {!isLoggedIn ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.03)",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            Gost vidi samo “preview”. Za kreiranje zahtjeva treba prijava (auth
            flow ćemo ispolirati kasnije).
          </div>
        ) : null}

        {createOpen && isLoggedIn ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div style={{ fontWeight: 1000, marginBottom: 8 }}>
              Novi zahtjev
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Naziv
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='npr. "U21 GK (spec) 18+"'
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    outline: "none",
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                  Status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      marginLeft: 8,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                    <option value="archived">archived</option>
                  </select>
                </label>

                <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                  Priority
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      width: 90,
                      marginLeft: 8,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
              </div>

              <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Criteria (JSON)
                <textarea
                  value={criteriaText}
                  onChange={(e) => setCriteriaText(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    outline: "none",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: 12,
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="hr-backBtn" type="button" onClick={createRequest}>
                  Spremi
                </button>
                <button
                  className="hr-backBtn"
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  style={{ opacity: 0.8 }}
                >
                  Odustani
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>
            Postojeći zahtjevi
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.75)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.6fr 0.4fr 0.8fr",
                gap: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 1000,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Naziv</div>
              <div>Status</div>
              <div>Prio</div>
              <div>Created</div>
            </div>

            {rows.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.75 }}>
                Trenutno nema zahtjeva. {isLoggedIn ? "Klikni “Novi zahtjev”." : ""}
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.6fr 0.4fr 0.8fr",
                    gap: 10,
                    padding: "10px 12px",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    fontSize: 13,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{r.name}</div>
                  <div style={{ opacity: 0.8 }}>{r.status}</div>
                  <div style={{ opacity: 0.8 }}>{r.priority}</div>
                  <div style={{ opacity: 0.7 }}>
                    {r.created_at ? String(r.created_at).slice(0, 10) : "-"}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: sljedeći korak je “Request → filtrira Players” + “Dodaj u listu”.
          </div>
        </div>
      </div>
    </div>
  );
                }
