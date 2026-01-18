import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

// Minimalni kriteriji (za sada) – spremamo u criteria JSONB
function defaultCriteria() {
  return {
    age_min: null,
    age_max: null,
    notes: "",
    // skills je slobodan JSON (kasnije ćemo ga pretvoriti u pravi builder)
    skills: {},
  };
}

export default function TeamRequestsPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const [teamRow, setTeamRow] = useState(null);
  const [requests, setRequests] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState(defaultCriteria());
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (!team) return "Zahtjevi";
    return `Zahtjevi — ${teamLabel(team)}`;
  }, [team]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!team) return;
      setLoading(true);
      setError("");

      const { data: sessData } = await supabase.auth.getSession();
      if (!mounted) return;
      const sess = sessData?.session || null;
      setSession(sess);

      // Bez prijave: pokaži samo skeleton (preview), ali bez podataka iz DB-a
      if (!sess) {
        setTeamRow(null);
        setRequests([]);
        setLoading(false);
        return;
      }

      // 1) Nađi team po slug-u (u21/nt)
      // Očekujemo tablicu: public.teams (slug, id, name) – ako se zove drugačije, javit će error.
      const { data: tData, error: tErr } = await supabase
        .from("teams")
        .select("id, slug, name")
        .eq("slug", team)
        .maybeSingle();

      if (!mounted) return;

      if (tErr) {
        setError(`Greška (teams): ${tErr.message}`);
        setTeamRow(null);
        setRequests([]);
        setLoading(false);
        return;
      }

      if (!tData) {
        setError(`Ne postoji team slug: ${team}`);
        setTeamRow(null);
        setRequests([]);
        setLoading(false);
        return;
      }

      setTeamRow(tData);

      // 2) Učitaj zahtjeve
      const { data: rData, error: rErr } = await supabase
        .from("team_requests")
        .select("id, team_id, name, criteria, created_at")
        .eq("team_id", tData.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (rErr) {
        setError(`Greška (team_requests): ${rErr.message}`);
        setRequests([]);
        setLoading(false);
        return;
      }

      setRequests(rData || []);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [team]);

  async function onCreate() {
    setError("");
    if (!session) {
      setError("Moraš biti prijavljen da bi kreirao zahtjev.");
      return;
    }
    if (!teamRow?.id) {
      setError("Team nije učitan.");
      return;
    }
    if (!name.trim()) {
      setError("Naziv zahtjeva je obavezan.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        team_id: teamRow.id,
        name: name.trim(),
        criteria: criteria || defaultCriteria(),
        created_by: session.user.id,
      };

      const { error: insErr } = await supabase.from("team_requests").insert(payload);
      if (insErr) throw insErr;

      // refresh list
      const { data: rData, error: rErr } = await supabase
        .from("team_requests")
        .select("id, team_id, name, criteria, created_at")
        .eq("team_id", teamRow.id)
        .order("created_at", { ascending: false });

      if (rErr) throw rErr;

      setRequests(rData || []);
      setFormOpen(false);
      setName("");
      setCriteria(defaultCriteria());
    } catch (e) {
      setError(e?.message || "Greška kod spremanja.");
    } finally {
      setSaving(false);
    }
  }

  const base = team ? `/team/${team}` : "/";

  return (
    <AppLayout title={title}>
      <div className="hr-pageWrap">
        <div className="hr-pageCard">
          <div className="hr-pageHeaderRow">
            <div>
              <h1 className="hr-pageTitle">Zahtjevi</h1>
              <div className="hr-pageSub">
                {team ? (
                  <>
                    Tim: <b>{teamLabel(team)}</b> — kreiraj i spremaj kriterije za pretraživanje baze.
                  </>
                ) : (
                  "Odaberi tim."
                )}
              </div>
            </div>

            <Link className="hr-backBtn" href={base}>
              ← Nazad
            </Link>
          </div>

          {!session ? (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}>
              <b>Preview (bez prijave)</b>
              <div style={{ marginTop: 6, opacity: 0.75 }}>
                Struktura postoji, ali lista zahtjeva i uređivanje su dostupni tek nakon prijave.
              </div>
            </div>
          ) : null}

          {error ? (
            <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "rgba(255,0,0,0.08)" }}>
              <b>Greška:</b> {error}
            </div>
          ) : null}

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 900 }}>
              Spremljeni zahtjevi {session ? `(${requests.length})` : ""}
            </div>

            {session ? (
              <button
                className="hr-backBtn"
                type="button"
                onClick={() => setFormOpen((v) => !v)}
                style={{ cursor: "pointer" }}
              >
                {formOpen ? "Zatvori" : "+ Novi zahtjev"}
              </button>
            ) : null}
          </div>

          {formOpen ? (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <b>Naziv</b>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='npr. "GK 28-32 / GK 18+"'
                    style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <b>Dob min</b>
                    <input
                      value={criteria.age_min ?? ""}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, age_min: e.target.value === "" ? null : Number(e.target.value) }))
                      }
                      placeholder="npr. 28"
                      style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <b>Dob max</b>
                    <input
                      value={criteria.age_max ?? ""}
                      onChange={(e) =>
                        setCriteria((c) => ({ ...c, age_max: e.target.value === "" ? null : Number(e.target.value) }))
                      }
                      placeholder="npr. 32"
                      style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                    />
                  </label>
                </div>

                <label style={{ display: "grid", gap: 6 }}>
                  <b>Bilješka (opcionalno)</b>
                  <textarea
                    value={criteria.notes || ""}
                    onChange={(e) => setCriteria((c) => ({ ...c, notes: e.target.value }))}
                    placeholder="npr. 'Primarni: GK, sekundarno: SP...'"
                    rows={3}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <b>Skills JSON (privremeno)</b>
                  <textarea
                    value={JSON.stringify(criteria.skills || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value || "{}");
                        setCriteria((c) => ({ ...c, skills: parsed }));
                        setError("");
                      } catch (err) {
                        setError("Skills JSON nije validan.");
                      }
                    }}
                    rows={6}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", fontFamily: "monospace" }}
                  />
                </label>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    className="hr-backBtn"
                    type="button"
                    onClick={onCreate}
                    disabled={saving}
                    style={{ cursor: "pointer" }}
                  >
                    {saving ? "Spremam..." : "Spremi zahtjev"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {loading ? (
              <div style={{ opacity: 0.7 }}>Učitavam…</div>
            ) : session ? (
              requests.length === 0 ? (
                <div style={{ opacity: 0.7 }}>Nema zahtjeva još. Kreiraj prvi.</div>
              ) : (
                requests.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.75)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div style={{ fontWeight: 1000 }}>{r.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                      </div>
                    </div>

                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                      <b>Kriteriji:</b>{" "}
                      <span style={{ fontFamily: "monospace" }}>{JSON.stringify(r.criteria || {}, null, 0)}</span>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                      Sljedeće: “Primijeni zahtjev” na stranici Igrači (Task 15.3) + builder UI (Task 15.4).
                    </div>
                  </div>
                ))
              )
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
