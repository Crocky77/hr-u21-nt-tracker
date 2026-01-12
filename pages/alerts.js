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

export default function Alerts() {
  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null);

  const canManage = role === "admin" || role === "coach";

  const [players, setPlayers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const [filterStatus, setFilterStatus] = useState("open"); // open | ack | closed | all
  const [form, setForm] = useState({
    player_id: "",
    severity: "medium",
    message: ""
  });

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

  async function fetchPlayers() {
    if (!teamType) return;
    const { data } = await supabase
      .from("players")
      .select("id, full_name")
      .eq("team_type", teamType)
      .order("full_name", { ascending: true });
    if (data) setPlayers(data);
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
      fetchAlerts();
    }
  }, [access, teamType]);

  useEffect(() => {
    if (access === "ok" && teamType) fetchAlerts();
  }, [filterStatus]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  const playerNameById = useMemo(() => {
    const map = new Map();
    for (const p of players) map.set(p.id, p.full_name);
    return map;
  }, [players]);

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

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Trening alarmi</h1>
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
      title="Trening alarmi"
      subtitle={`Aktivni tim: ${teamType} Hrvatska`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <Link href="/players" style={btnGhost}>Igrači</Link>
          <Link href="/staff" style={btnGhost}>Osoblje</Link>
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
          * Ovo je skeleton. Kasnije tu punimo “zaostatak za idealnim treningom”, “stagnacija”, “krivi trening”, itd.
        </div>
      </div>

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
              placeholder="Upiši poruku alarma..."
              required
              style={input}
            />

            <button type="submit" style={{ gridColumn: "span 3", ...btnBlack }}>
              Dodaj alarm
            </button>
          </form>
        </div>
      ) : (
        <div style={{ ...card, marginTop: 14 }}>
          <div style={{ fontWeight: 900 }}>Napomena</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Samo izbornik/admin mogu dodavati i zatvarati alarme. Ti ih možeš pregledavati.
          </div>
        </div>
      )}

      <div style={{ ...card, marginTop: 14, overflowX: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          Popis alarma {loadingAlerts ? " (učitavam...)" : `(${alerts.length})`}
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
              <tr><td colSpan={6} style={{ padding: 12, opacity: 0.7 }}>Nema alarma.</td></tr>
            ) : null}

            {alerts.map((a) => (
              <tr key={a.id}>
                <td style={tdStrong}>{a.player_id ? (playerNameById.get(a.player_id) || `#${a.player_id}`) : "—"}</td>
                <td style={td}>{TYPE_LABEL[a.alert_type] || a.alert_type}</td>
                <td style={td}>
                  <span style={pill(a.severity)}>{a.severity}</span>
                </td>
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
      </div>
    </AppLayout>
  );
}

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
  color: "#111"
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
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };

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
