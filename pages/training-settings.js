import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import supabase from "../utils/supabaseClient";
import AppLayout from "../components/AppLayout";

const POSITIONS = ["GK", "DEF", "WB", "IM", "W", "FWD"];

const SKILLS = [
  "GOALKEEPING",
  "DEFENDING",
  "PLAYMAKING",
  "WINGER",
  "PASSING",
  "SCORING",
  "SET_PIECES",
  "STAMINA",
];

function canWrite(role) {
  return role === "admin" || role === "coach";
}

export default function TrainingSettingsPage() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [me, setMe] = useState({ email: null, role: null, team_type: null });

  const [activeTeam, setActiveTeam] = useState("U21"); // admin može prebaciti, ostali ne
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // učitaj user + prava
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

      // default tim = njegov tim, admin može prebaciti kasnije
      setActiveTeam(u.team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  async function fetchSettings(teamType) {
    setMsg("");
    const { data, error } = await supabase
      .from("training_settings")
      .select("id, team_type, position, target_skill, min_gain_per_week, max_weeks_without_gain, note, updated_at")
      .eq("team_type", teamType)
      .order("position", { ascending: true });

    if (error) {
      setMsg("Greška kod učitavanja: " + error.message);
      return;
    }
    setRows(data || []);
  }

  useEffect(() => {
    if (access === "ok") fetchSettings(activeTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, activeTeam]);

  const grid = useMemo(() => {
    // map po position
    const byPos = {};
    for (const r of rows) byPos[r.position] = r;

    return POSITIONS.map((pos) => {
      const r = byPos[pos];
      return {
        position: pos,
        id: r?.id ?? null,
        target_skill: r?.target_skill ?? (pos === "GK" ? "GOALKEEPING" : "DEFENDING"),
        min_gain_per_week: r?.min_gain_per_week ?? 0,
        max_weeks_without_gain: r?.max_weeks_without_gain ?? 4,
        note: r?.note ?? "",
      };
    });
  }, [rows]);

  function updateLocal(pos, patch) {
    setRows((prev) => {
      // pretvori prev -> map -> update -> nazad u listu
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.position === pos && x.team_type === activeTeam);
      if (idx >= 0) {
        copy[idx] = { ...copy[idx], ...patch };
      } else {
        copy.push({
          id: null,
          team_type: activeTeam,
          position: pos,
          target_skill: pos === "GK" ? "GOALKEEPING" : "DEFENDING",
          min_gain_per_week: 0,
          max_weeks_without_gain: 4,
          note: "",
          ...patch,
        });
      }
      return copy;
    });
  }

  async function saveAll() {
    setMsg("");
    if (!canWrite(me.role)) {
      setMsg("Nemaš ovlasti za uređivanje (samo admin ili izbornik).");
      return;
    }

    setSaving(true);

    // upsert po unique(team_type, position)
    const payload = grid.map((g) => ({
      team_type: activeTeam,
      position: g.position,
      target_skill: g.target_skill,
      min_gain_per_week: Number(g.min_gain_per_week || 0),
      max_weeks_without_gain: Number(g.max_weeks_without_gain || 0),
      note: g.note || null,
    }));

    const { error } = await supabase
      .from("training_settings")
      .upsert(payload, { onConflict: "team_type,position" });

    setSaving(false);

    if (error) {
      setMsg("Greška kod spremanja: " + error.message);
      return;
    }

    setMsg("✅ Spremljeno.");
    fetchSettings(activeTeam);
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Training Settings</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        Učitavam...
      </main>
    );
  }

  return (
    <AppLayout title="Postavke treninga" active="training-settings">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Hrvatski U21/NT Tracker</div>
          <h1 style={{ margin: "6px 0 0", color: "#c00" }}>Postavke treninga</h1>
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
            Ulogiran: <strong>{me.email}</strong> · Uloga: <strong>{me.role}</strong>
            {" "}· Tim: <strong>{me.team_type}</strong>
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
            onClick={saveAll}
            disabled={saving || !canWrite(me.role)}
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
            {saving ? "Spremam..." : "Spremi sve"}
          </button>
        </div>
      </div>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          Idealni trening — {activeTeam}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Poz</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Target skill</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Min gain / week</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Max tjedana bez gain</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Napomena</th>
            </tr>
          </thead>

          <tbody>
            {grid.map((g) => (
              <tr key={g.position}>
                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                  {g.position}
                </td>

                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  <select
                    value={g.target_skill}
                    onChange={(e) => updateLocal(g.position, { target_skill: e.target.value })}
                    disabled={!canWrite(me.role)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }}
                  >
                    {SKILLS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>

                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={g.min_gain_per_week}
                    onChange={(e) => updateLocal(g.position, { min_gain_per_week: e.target.value })}
                    disabled={!canWrite(me.role)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", width: 140 }}
                  />
                </td>

                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  <input
                    type="number"
                    value={g.max_weeks_without_gain}
                    onChange={(e) => updateLocal(g.position, { max_weeks_without_gain: e.target.value })}
                    disabled={!canWrite(me.role)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", width: 160 }}
                  />
                </td>

                <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", minWidth: 260 }}>
                  <input
                    value={g.note}
                    onChange={(e) => updateLocal(g.position, { note: e.target.value })}
                    disabled={!canWrite(me.role)}
                    placeholder="npr: fokus na DEF do QF"
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: 12, fontSize: 12, opacity: 0.75, borderTop: "1px solid #e5e7eb" }}>
          Ovdje definiraš “idealni trening”. Alerts će (kasnije) usporediti snapshotove igrača i javiti tko kasni / stagnira.
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Linkovi:{" "}
        <Link href="/alerts">Alerts</Link>
        {" · "}
        <Link href="/players">Igrači</Link>
        {" · "}
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </AppLayout>
  );
}
