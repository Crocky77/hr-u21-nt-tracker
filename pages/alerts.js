import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

const TYPE_LABEL = {
  training_gap: "Zaostatak treninga",
  stagnation: "Stagnacija",
  wrong_training: "Krivi trening",
  form_drop: "Pad forme",
  stamina_issue: "Problem stamina",
  note: "Bilješka"
};

const HT_YEAR_DAYS = 112;
const U21_MAX_YEARS = 21;
const U21_MAX_DAYS = 111;

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(dateA, dateB) {
  const a = new Date(Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate()));
  const b = new Date(Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate()));
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function htAgeFromDob(dobStr, atIso) {
  if (!dobStr || !atIso) return null;
  const dob = new Date(dobStr + "T00:00:00Z");
  const at = new Date(atIso + "T00:00:00Z");
  const d = daysBetween(at, dob);
  if (d < 0) return { years: 0, days: 0 };
  return { years: Math.floor(d / HT_YEAR_DAYS), days: d % HT_YEAR_DAYS };
}

function htAgeToDays(age) {
  return age.years * HT_YEAR_DAYS + age.days;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function normalizeEmail(x) {
  return (x || "").trim().toLowerCase();
}

// pronađi profile koji vrijedi za dob (ageDays) i poziciju
function pickProfileForPlayer(profiles, position, ageDays) {
  const list = profiles.filter((p) => p.position === position);
  for (const p of list) {
    const minDays = p.min_ht_years * HT_YEAR_DAYS + p.min_ht_days;
    const maxDays = p.max_ht_years * HT_YEAR_DAYS + p.max_ht_days;
    if (ageDays >= minDays && ageDays <= maxDays) return p;
  }
  return null;
}

function pill(sev) {
  const map = {
    low: { bg: "#e0f2fe", fg: "#075985" },
    medium: { bg: "#ffedd5", fg: "#9a3412" },
    high: { bg: "#fee2e2", fg: "#991b1b" }
  };
  const c = map[sev] || map.medium;
  return {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: c.bg,
    color: c.fg,
    fontWeight: 900,
    fontSize: 12
  };
}

export default function Alerts() {
  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null);

  const canManage = role === "admin" || role === "coach";

  const [players, setPlayers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingEngine, setLoadingEngine] = useState(false);

  const [filterStatus, setFilterStatus] = useState("open"); // open | ack | closed | all

  // ručni “note” alarm (ostaje)
  const [form, setForm] = useState({
    player_id: "",
    severity: "medium",
    message: ""
  });

  // pragovi za severity (MVP)
  // gap = koliko levela ispod idealnog
  const GAP_MEDIUM = 1;
  const GAP_HIGH = 2;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role);
      setTeamType(urows[0].team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function fetchPlayers() {
    if (!teamType) return;
    const { data } = await supabase
      .from("players")
      .select("id, full_name, position, date_of_birth, team_type")
      .eq("team_type", teamType)
      .order("full_name", { ascending: true });
    if (data) setPlayers(data);
  }

  async function fetchProfiles() {
    if (!teamType) return;
    const { data } = await supabase
      .from("training_profiles")
      .select("*")
      .eq("team_type", teamType);
    if (data) setProfiles(data);
  }

  async function fetchLatestSnapshots() {
    if (!teamType) return;

    // MVP: dohvatimo sve snapshote pa u JS uzmemo latest po player_id
    // (kasnije optimiziramo s view ili RPC)
    const { data } = await supabase
      .from("player_snapshots")
      .select("id, team_type, player_id, snapshot_date, primary_skill, primary_level, secondary_skill, secondary_level, training_type, training_intensity")
      .eq("team_type", teamType)
      .order("snapshot_date", { ascending: false });

    if (!data) {
      setSnapshots([]);
      return;
    }

    const latestMap = new Map();
    for (const s of data) {
      if (!latestMap.has(s.player_id)) {
        latestMap.set(s.player_id, s);
      }
    }
    setSnapshots(Array.from(latestMap.values()));
  }

  async function fetchAlerts() {
    if (!teamType) return;

    setLoadingAlerts(true);

    let q = supabase
      .from("training_alerts")
      .select("id, team_type, player_id, alert_type, severity, status, message, assigned_to_email, due_at, created_at, created_by_email")
      .eq("team_type", teamType)
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") q = q.eq("status", filterStatus);

    const { data, error } = await q;
    if (!error && data) setAlerts(data);
    setLoadingAlerts(false);
  }

  useEffect(() => {
    if (access === "ok" && teamType) {
      fetchPlayers();
      fetchProfiles();
      fetchLatestSnapshots();
      fetchAlerts();
    }
  }, [access, teamType]);

  useEffect(() => {
    if (access === "ok" && teamType) fetchAlerts();
  }, [filterStatus]);

  const playerNameById = useMemo(() => {
    const map = new Map();
    for (const p of players) map.set(p.id, p.full_name);
    return map;
  }, [players]);

  const playerById = useMemo(() => {
    const map = new Map();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const snapshotByPlayerId = useMemo(() => {
    const map = new Map();
    for (const s of snapshots) map.set(s.player_id, s);
    return map;
  }, [snapshots]);

  // --- RUČNI NOTE ALARM (ostaje) ---
  async function addNoteAlert(e) {
    e.preventDefault();
    const payload = {
      team_type: teamType,
      player_id: form.player_id ? Number(form.player_id) : null,
      alert_type: "note",
      severity: form.severity,
      status: "open",
      message: form.message.trim(),
      created_by_email: email
    };

    const { error } = await supabase.from("training_alerts").insert(payload);
    if (error) return alert("Greška: " + error.message);

    setForm({ player_id: "", severity: "medium", message: "" });
    fetchAlerts();
  }

  async function setStatus(id, status) {
    const { error } = await supabase.from("training_alerts").update({ status }).eq("id", id);
    if (error) return alert("Greška: " + error.message);
    fetchAlerts();
  }

  // --- ENGINE: GENERATE GAPS (MVP) ---
  async function generateGaps() {
    if (!canManage) return;

    setLoadingEngine(true);

    try {
      // refresh osnovnih podataka
      await fetchPlayers();
      await fetchProfiles();
      await fetchLatestSnapshots();

      const today = isoToday();

      const inserts = [];
      let missingSnapshots = 0;
      let missingProfiles = 0;
      let createdCount = 0;

      for (const p of players) {
        const s = snapshotByPlayerId.get(p.id);

        // ako nemamo snapshot, preskoči (kasnije ćemo napraviti alert "missing snapshot")
        if (!s) {
          missingSnapshots++;
          continue;
        }

        // dob u HT danima
        const age = htAgeFromDob(p.date_of_birth, today);
        if (!age) continue;
        const ageDays = htAgeToDays(age);

        // profil za dob+poziciju
        const prof = pickProfileForPlayer(profiles, p.position, ageDays);
        if (!prof) {
          missingProfiles++;
          continue;
        }

        // očekivanja
        const expPrimarySkill = prof.target_primary_skill;
        const expPrimaryLevel = Number(prof.target_primary_level || 0);
        const expSecondarySkill = prof.target_secondary_skill || null;
        const expSecondaryLevel = prof.target_secondary_level ?? null;

        // stvarno stanje iz snapshota (MVP: uspoređujemo samo ako se skill name poklapa)
        const actualPrimaryLevel =
          s.primary_skill && s.primary_skill === expPrimarySkill ? Number(s.primary_level || 0) : null;
        const actualSecondaryLevel =
          expSecondarySkill && s.secondary_skill && s.secondary_skill === expSecondarySkill
            ? Number(s.secondary_level || 0)
            : null;

        // gap kalkulacija: ako ne poklapa skill name, trenutno ne računamo (MVP)
        const gapPrimary = actualPrimaryLevel === null ? null : expPrimaryLevel - actualPrimaryLevel;
        const gapSecondary =
          expSecondarySkill && expSecondaryLevel !== null && actualSecondaryLevel !== null
            ? Number(expSecondaryLevel) - actualSecondaryLevel
            : null;

        // ako nemamo primary podatke, preskoči (kasnije: alert "krivi skill mapping")
        if (gapPrimary === null) continue;

        // samo ako je zaostao
        const worstGap = Math.max(gapPrimary, gapSecondary ?? -999);

        if (worstGap <= 0) continue;

        // severity
        const sev = worstGap >= GAP_HIGH ? "high" : worstGap >= GAP_MEDIUM ? "medium" : "low";

        // poruka
        let msg = `[MVP] ${p.position} · profil: ${prof.profile_name}. `;
        msg += `Primarni (${expPrimarySkill}): ideal ${expPrimaryLevel}, trenutno ${actualPrimaryLevel} (gap ${gapPrimary}).`;

        if (gapSecondary !== null && expSecondarySkill) {
          msg += ` Sekundarni (${expSecondarySkill}): ideal ${expSecondaryLevel}, trenutno ${actualSecondaryLevel} (gap ${gapSecondary}).`;
        } else if (expSecondarySkill) {
          msg += ` Sekundarni cilj je ${expSecondarySkill} ${expSecondaryLevel}, ali snapshot nema poklapanje (MVP).`;
        }

        // spriječi spam: ne kreiraj isti open training_gap za istog igrača s istom porukom
        // (brza provjera u JS: pogledaj postojeće open/ack)
        const already = alerts.some(
          (a) =>
            a.alert_type === "training_gap" &&
            a.player_id === p.id &&
            a.status !== "closed" &&
            (a.message || "") === msg
        );
        if (already) continue;

        inserts.push({
          team_type: teamType,
          player_id: p.id,
          alert_type: "training_gap",
          severity: sev,
          status: "open",
          message: msg,
          created_by_email: email
        });
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from("training_alerts").insert(inserts);
        if (error) {
          alert("Greška kod upisa alarma: " + error.message);
        } else {
          createdCount = inserts.length;
        }
      }

      await fetchAlerts();

      alert(
        `Generate gaps (MVP) završeno.\n` +
          `Kreirano alarma: ${createdCount}\n` +
          `Igrača bez snapshota: ${missingSnapshots}\n` +
          `Igrača bez profila za dob/poz: ${missingProfiles}\n\n` +
          `Napomena: MVP računa gap samo kad se skill name u snapshotu poklapa s profilom.`
      );
    } finally {
      setLoadingEngine(false);
    }
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Upozorenja</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading" || !teamType) {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout
      title="Upozorenja"
      subtitle={`Trening alarmi (MVP) · Tim: ${teamType}`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <Link href="/players" style={btnGhost}>Igrači</Link>
          <Link href="/staff" style={btnGhost}>Osoblje</Link>
          <Link href="/training-settings" style={btnGhost}>Postavke treninga</Link>

          {canManage ? (
            <button onClick={generateGaps} style={btnBlue} disabled={loadingEngine}>
              {loadingEngine ? "Generiram..." : "Generate gaps (MVP)"}
            </button>
          ) : null}

          <button onClick={fetchAlerts} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={input}>
          <option value="open">Samo open</option>
          <option value="ack">Samo ack</option>
          <option value="closed">Samo closed</option>
          <option value="all">Sve</option>
        </select>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          MVP: “Generate gaps” radi usporedbu zadnjeg snapshota i idealnog profila po dobi/poziciji.
        </div>
      </div>

      {/* RUČNI NOTE */}
      {canManage ? (
        <div style={{ ...card, marginTop: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Dodaj ručno (MVP): bilješka / alarm</div>

          <form onSubmit={addNoteAlert} style={{ display: "grid", gridTemplateColumns: "1fr 0.6fr 1.6fr", gap: 10, marginTop: 12 }}>
            <select value={form.player_id} onChange={(e) => setForm((p) => ({ ...p, player_id: e.target.value }))} style={input}>
              <option value="">(bez igrača)</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>

            <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))} style={input}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>

            <input
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Upiši poruku..."
              required
              style={input}
            />

            <button type="submit" style={{ gridColumn: "span 3", ...btnBlack }}>
              Dodaj alarm
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Tip “note” je ručni. Tip “training_gap” generira gumb iznad.
          </div>
        </div>
      ) : null}

      {/* LISTA ALARMA */}
      <div style={{ ...card, marginTop: 14, overflowX: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          Popis upozorenja {loadingAlerts ? " (učitavam...)" : `(${alerts.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Igrač</th>
              <th style={th}>Tip</th>
              <th style={th}>Severity</th>
              <th style={th}>Status</th>
              <th style={th}>Poruka</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>

          <tbody>
            {!loadingAlerts && alerts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, opacity: 0.7 }}>Nema upozorenja.</td></tr>
            ) : null}

            {alerts.map((a) => (
              <tr key={a.id}>
                <td style={tdStrong}>{a.player_id ? (playerNameById.get(a.player_id) || `#${a.player_id}`) : "—"}</td>
                <td style={td}>{TYPE_LABEL[a.alert_type] || a.alert_type}</td>
                <td style={td}><span style={pill(a.severity)}>{a.severity}</span></td>
                <td style={td}>{a.status}</td>
                <td style={td}>{a.message}</td>
                <td style={td}>
                  {canManage ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {a.status !== "ack" ? <button onClick={() => setStatus(a.id, "ack")} style={btnGhostSmall}>Ack</button> : null}
                      {a.status !== "closed" ? <button onClick={() => setStatus(a.id, "closed")} style={btnDangerSmall}>Close</button> : null}
                      {a.status !== "open" ? <button onClick={() => setStatus(a.id, "open")} style={btnGhostSmall}>Reopen</button> : null}
                    </div>
                  ) : (
                    <span style={{ opacity: 0.6 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          MVP ograničenja: gap se računa samo ako se naziv skilla u snapshotu poklapa s profilom (npr. playmaking/defending).
        </div>
      </div>

      {/* DIJAGNOSTIKA (korisno za sad) */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ fontWeight: 900 }}>Dijagnostika (MVP)</div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
          Igrača: <b>{players.length}</b> · Profila: <b>{profiles.length}</b> · Zadnjih snapshota: <b>{snapshots.length}</b>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
          Ako je “snapshota” malo, prvo dodaj snapshotove (ručno) ili kasnije CHPP sync.
        </div>
      </div>
    </AppLayout>
  );
}

// --- styles ---
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
};

const input = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff"
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  textDecoration: "none",
  fontWeight: 900,
  color: "#111",
  cursor: "pointer"
};

const btnBlack = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer"
};

const btnBlue = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 900,
  cursor: "pointer"
};

const btnGhostSmall = {
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer"
};

const btnDangerSmall = {
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#991b1b",
  fontWeight: 900,
  cursor: "pointer"
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" };
const tdStrong = { ...td, fontWeight: 900 };
