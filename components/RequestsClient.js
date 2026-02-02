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

export default function RequestsClient({ team }) {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  const [teamId, setTeamId] = useState(null);
  const [teamIdLoading, setTeamIdLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [error, setError] = useState("");

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
    setRowsLoading(true);
    try {
      if (!supabase?.rpc) return;
      if (!teamId) return;

      const tries = [
        { p_team_id: teamId },
        { team_id: teamId },
        { p_team_slug: team },
        { team_slug: team },
      ];

      let data = null;
      let lastError = null;

      for (const args of tries) {
        if (Object.values(args).every((v) => v === null || typeof v === "undefined")) {
          continue;
        }

        const res = await supabase.rpc("list_team_requirements", args);
        if (res?.error) {
          lastError = res.error;
          continue;
        }

        if (Array.isArray(res?.data)) {
          data = res.data;
          break;
        }
      }

      if (!data && lastError) {
        throw lastError;
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Greška kod učitavanja zahtjeva.");
      setRows([]);
    } finally {
      setRowsLoading(false);
    }
  }

  // 3) load requests
  useEffect(() => {
    if (!teamIdLoading && teamId) {
      refresh();
      return;
    }

    if (!teamIdLoading && !teamId) {
      setRows([]);
      setRowsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdLoading, teamId]);

  async function deleteRequirement(requirementId) {
    setError("");

    if (!sessionUser?.id) {
      setError("Moraš biti prijavljen da bi obrisao zahtjev.");
      return;
    }

    if (!requirementId) return;

    try {
      const { error: delError } = await supabase
        .from("requirements")
        .delete()
        .eq("id", requirementId);

      if (delError) throw delError;
      await refresh();
    } catch (e) {
      setError(e?.message || "Greška kod brisanja zahtjeva.");
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

            <button
              className="hr-backBtn"
              type="button"
              onClick={() => alert("Uskoro: ručni unos zahtjeva.")}
              disabled={!isLoggedIn}
              style={!isLoggedIn ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
            >
              + Novi zahtjev
            </button>
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
            Samo admini mogu dodavati i brisati zahtjeve. Prijavi se za punu
            funkcionalnost.
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
                gridTemplateColumns: "1.2fr 0.4fr 0.4fr 0.7fr 0.4fr",
                gap: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 1000,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Naziv</div>
              <div>Pravila</div>
              <div>Aktivno</div>
              <div>Datum</div>
              <div>Akcija</div>
            </div>

            {rowsLoading ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.75 }}>
                Učitavanje…
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.75 }}>
                Trenutno nema zahtjeva. {isLoggedIn ? "Klikni “Novi zahtjev”." : ""}
              </div>
            ) : (
              rows.map((r) => {
                const rulesCount =
                  r?.rules_count ??
                  r?.rule_count ??
                  r?.rulesCount ??
                  r?.rules?.length ??
                  0;
                const isActive =
                  typeof r?.is_active !== "undefined"
                    ? r.is_active
                    : r?.active ?? false;
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 0.4fr 0.4fr 0.7fr 0.4fr",
                      gap: 10,
                      padding: "10px 12px",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      fontSize: 13,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{r.name}</div>
                    <div style={{ opacity: 0.8 }}>{rulesCount}</div>
                    <div style={{ opacity: 0.8 }}>{isActive ? "Da" : "Ne"}</div>
                    <div style={{ opacity: 0.7 }}>
                      {r.created_at ? String(r.created_at).slice(0, 10) : "-"}
                    </div>
                    <div>
                      <button
                        className="hr-backBtn"
                        type="button"
                        onClick={() => deleteRequirement(r.id)}
                        disabled={!isLoggedIn}
                        style={
                          !isLoggedIn
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : undefined
                        }
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: sljedeći korak je povezati odabrani zahtjev s filtriranjem
            igrača.
          </div>
        </div>
      </div>
    </div>
  );
}
