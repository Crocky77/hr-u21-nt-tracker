import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import supabase from "../utils/supabaseClient";
import AppLayout from "../components/AppLayout";

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function severityStyle(sev) {
  const map = {
    low: { bg: "#f3f4f6", fg: "#111827" },
    medium: { bg: "#fff7ed", fg: "#9a3412" },
    high: { bg: "#fee2e2", fg: "#991b1b" },
  };
  return map[sev] || map.low;
}

function canWrite(role) {
  return role === "admin" || role === "coach";
}

export default function AlertsPage() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [me, setMe] = useState({ email: null, role: null, team_type: null });

  const [activeTeam, setActiveTeam] = useState("U21"); // admin može prebaciti
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data?.user?.email ?? null;

      if (!email) {
        setAccess("denied");
        return;
      }

      const { data: urows, error } = await supabase
        .from("users")
        .select("email, role, team_type")
        .eq("email", email)
        .limit(1);

      if (error || !urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      const u = urows[0];
      setMe({ email: u.email, role: u.role, team_type: u.team_type });
      setActiveTeam(u.team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  async function fetchAlerts(teamType) {
    setLoadingRows(true);
    setMsg("");

    // pretpostavka: training_alerts ima barem: id, team_type, kind, severity, message, player_id, created_at, resolved_at
    const { data, error } = await supabase
      .from("training_alerts")
      .select("id, team_type, player_id, kind, severity, message, created_at, resolved_at")
      .eq("team_type", teamType)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg("Greška kod učitavanja: " + error.message);
      setLoadingRows(false);
      return;
    }

    setRows(data || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok") fetchAlerts(activeTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, activeTeam]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => (r.message || "").toLowerCase().includes(query));
  }, [rows, q]);

  async function generateGaps() {
    setMsg("");
    if (!canWrite(me.role)) {
      setMsg("Nemaš ovlasti (samo admin ili izbornik).");
      return;
    }

    setBusy(true);

    try {
      // 1) uzmi igrače za team
      const { data: players, error: perr } = await supabase
        .from("players")
        .select("id, full_name, team_type, last_seen_at")
        .eq("team_type", activeTeam)
        .order("id", { ascending: false });

      if (perr) throw new Error(perr.message);

      // 2) obriši stare gap alarme (regeneracija)
      const { error: derr } = await supabase
        .from("training_alerts")
        .delete()
        .eq("team_type", activeTeam)
        .eq("kind", "gap");

      // ako nema RLS prava za delete, ovo će fail — ali onda radimo "best effort" insert
      if (derr) {
        // ne rušimo sve, samo javimo
        setMsg("Napomena: nisam mogao obrisati stare gap alarme (RLS). Nastavljam s generiranjem...");
      }

      // 3) generiraj gap: last_seen_at stariji od 14 dana ili null
      const threshold = daysAgoISO(14);

      const toInsert = (players || [])
        .filter((p) => !p.last_seen_at || p.last_seen_at < threshold)
        .map((p) => {
          const sev = !p.last_seen_at ? "high" : "medium";
          const when = p.last_seen_at ? new Date(p.last_seen_at).toLocaleString() : "nikad";
          return {
            team_type: activeTeam,
            player_id: p.id,
            kind: "gap",
            severity: sev,
            message: `Nema svježeg update-a za igrača: ${p.full_name} (zadnje: ${when}).`,
          };
        });

      if (toInsert.length === 0) {
        setMsg("✅ Nema gap-ova (svi igrači imaju svjež update).");
        await fetchAlerts(activeTeam);
        setBusy(false);
        return;
      }

      const { error: ierr } = await supabase.from("training_alerts").insert(toInsert);

      if (ierr) throw new Error(ierr.message);

      setMsg(`✅ Generirano gap alarma: ${toInsert.length}`);
      await fetchAlerts(activeTeam);
    } catch (e) {
      setMsg("Greška: " + (e?.message || String(e)));
    }

    setBusy(false);
  }

  async function resolveAlert(id) {
    setMsg("");
    if (!canWrite(me.role)) {
      setMsg("Nemaš ovlasti (samo admin ili izbornik).");
      return;
    }
    const { error } = await supabase
      .from("training_alerts")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) setMsg("Greška: " + error.message);
    else fetchAlerts(activeTeam);
  }

  async function unresolveAlert(id) {
    setMsg("");
    if (!canWrite(me.role)) {
      setMsg("Nemaš ovlasti (samo admin ili izbornik).");
      return;
    }
    const { error } = await supabase
      .from("training_alerts")
      .update({ resolved_at: null })
      .eq("id", id);

    if (error) setMsg("Greška: " + error.message);
    else fetchAlerts(activeTeam);
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Alerts</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout title="Alerts" active="alerts">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Hrvatski U21/NT Tracker</div>
          <h1 style={{ margin: "6px 0 0", color: "#c00" }}>Upozorenja (Alerts)</h1>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            Ulogiran: <strong>{me.email}</strong> · Uloga: <strong>{me.role}</strong> · Tim: <strong>{me.team_type}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {me.role === "admin" ? (
            <select
              value={activeTeam}
              onChange={(e) => setActiveTeam(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            >
              <option value="U21">U21</option>
              <option value="NT">NT</option>
            </select>
          ) : (
            <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff" }}>
              Aktivni tim: <strong>{activeTeam}</strong>
            </div>
          )}

          <button
            onClick={generateGaps}
            disabled={!canWrite(me.role) || busy}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: canWrite(me.role) ? "#111" : "#9ca3af",
              color: "#fff",
              fontWeight: 900,
              cursor: canWrite(me.role) ? "pointer" : "not-allowed",
            }}
          >
            {busy ? "Generiram..." : "Generate gaps"}
          </button>

          <button
            onClick={() => fetchAlerts(activeTeam)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
          >
            Osvježi
          </button>
        </div>
      </div>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search u alertima..."
          style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />
      </div>

      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          Popis upozorenja {loadingRows ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Vrijeme</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Tip</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Severity</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Poruka</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Akcija</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const sev = severityStyle(r.severity);
              const created = r.created_at ? new Date(r.created_at).toLocaleString() : "-";
              const isResolved = !!r.resolved_at;

              return (
                <tr key={r.id}>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{created}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                    {r.kind || "—"}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: sev.bg, color: sev.fg, fontWeight: 900 }}>
                      {r.severity || "low"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", minWidth: 360 }}>
                    {r.message}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    {isResolved ? "riješeno" : "otvoreno"}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    {canWrite(me.role) ? (
                      isResolved ? (
                        <button
                          onClick={() => unresolveAlert(r.id)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
                        >
                          Vrati
                        </button>
                      ) : (
                        <button
                          onClick={() => resolveAlert(r.id)}
                          style={{ padding: "8px 10px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
                        >
                          Riješi
                        </button>
                      )
                    ) : (
                      <span style={{ fontSize: 12, opacity: 0.6 }}>nema ovlasti</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {!loadingRows && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, opacity: 0.75 }}>
                  Nema upozorenja.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div style={{ padding: 12, fontSize: 12, opacity: 0.75, borderTop: "1px solid #e5e7eb" }}>
          “Generate gaps” je MVP: radi gap ako igrač nema update u zadnjih 14 dana. Kasnije ćemo ovo vezati na trening snapshotove + idealni trening.
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Linkovi:{" "}
        <Link href="/training-settings">Postavke treninga</Link>
        {" · "}
        <Link href="/players">Igrači</Link>
        {" · "}
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </AppLayout>
  );
}
