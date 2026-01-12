import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

const SKILLS = [
  "playmaking",
  "defending",
  "passing",
  "scoring",
  "wing",
  "goalkeeping",
  "set_pieces"
];

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Snapshots() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null);

  const canManage = role === "admin" || role === "coach";

  const [players, setPlayers] = useState([]);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const [q, setQ] = useState("");
  const [playerFilter, setPlayerFilter] = useState(""); // player_id or ""
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD or ""

  const [form, setForm] = useState({
    player_id: "",
    snapshot_date: isoToday(),
    primary_skill: "playmaking",
    primary_level: 0,
    secondary_skill: "passing",
    secondary_level: 0,
    training_type: "",
    training_intensity: 100,
    coach_level: null,
    assistants_count: null,
    form_level: null,
    stamina_level: null,
    note: ""
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) return setAccess("denied");
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) return setAccess("denied");

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
      .select("id, full_name, position")
      .eq("team_type", teamType)
      .order("full_name", { ascending: true });
    if (data) setPlayers(data);
  }

  async function fetchSnapshots() {
    if (!teamType) return;
    setLoadingRows(true);

    let query = supabase
      .from("player_snapshots")
      .select(
        "id, team_type, player_id, snapshot_date, primary_skill, primary_level, secondary_skill, secondary_level, training_type, training_intensity, coach_level, assistants_count, form_level, stamina_level, note, created_by_email, created_at"
      )
      .eq("team_type", teamType)
      .order("snapshot_date", { ascending: false })
      .order("id", { ascending: false });

    if (playerFilter) query = query.eq("player_id", Number(playerFilter));
    if (dateFilter) query = query.eq("snapshot_date", dateFilter);

    const { data, error } = await query;
    if (!error && data) setRows(data);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && teamType) {
      fetchPlayers();
      fetchSnapshots();
    }
  }, [access, teamType]);

  useEffect(() => {
    if (access === "ok" && teamType) fetchSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerFilter, dateFilter]);

  const playerNameById = useMemo(() => {
    const map = new Map();
    for (const p of players) map.set(p.id, `${p.full_name} (${p.position})`);
    return map;
  }, [players]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((r) => {
      const name = (playerNameById.get(r.player_id) || "").toLowerCase();
      const note = (r.note || "").toLowerCase();
      const tr = (r.training_type || "").toLowerCase();
      return name.includes(query) || note.includes(query) || tr.includes(query);
    });
  }, [rows, q, playerNameById]);

  async function addSnapshot(e) {
    e.preventDefault();
    if (!canManage) return;

    if (!form.player_id) {
      alert("Odaberi igrača.");
      return;
    }

    const payload = {
      team_type: teamType,
      player_id: Number(form.player_id),
      snapshot_date: form.snapshot_date,
      primary_skill: form.primary_skill || null,
      primary_level: form.primary_level !== "" ? Number(form.primary_level) : null,
      secondary_skill: form.secondary_skill || null,
      secondary_level: form.secondary_level !== "" ? Number(form.secondary_level) : null,
      training_type: form.training_type ? form.training_type.trim() : null,
      training_intensity: form.training_intensity !== "" ? Number(form.training_intensity) : null,
      coach_level: form.coach_level !== null && form.coach_level !== "" ? Number(form.coach_level) : null,
      assistants_count: form.assistants_count !== null && form.assistants_count !== "" ? Number(form.assistants_count) : null,
      form_level: form.form_level !== null && form.form_level !== "" ? Number(form.form_level) : null,
      stamina_level: form.stamina_level !== null && form.stamina_level !== "" ? Number(form.stamina_level) : null,
      note: form.note ? form.note.trim() : null,
      created_by_email: email
    };

    const { error } = await supabase.from("player_snapshots").insert(payload);
    if (error) {
      alert("Greška: " + error.message);
      return;
    }

    setForm((p) => ({
      ...p,
      note: "",
      primary_level: p.primary_level,
      secondary_level: p.secondary_level,
      snapshot_date: isoToday()
    }));

    await fetchSnapshots();
    alert("Snapshot spremljen.");
  }

  async function deleteSnapshot(id) {
    if (!canManage) return;
    if (!confirm("Obrisati snapshot?")) return;
    const { error } = await supabase.from("player_snapshots").delete().eq("id", id);
    if (error) return alert("Greška: " + error.message);
    fetchSnapshots();
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Snapshotovi</h1>
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
      title="Snapshotovi"
      subtitle={`Ručno bilježenje stanja (MVP) · Tim: ${teamType}`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <Link href="/players" style={btnGhost}>Igrači</Link>
          <Link href="/alerts" style={btnGhost}>Upozorenja</Link>
          <Link href="/training-settings" style={btnGhost}>Postavke treninga</Link>
          <button onClick={fetchSnapshots} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      {/* forma za unos */}
      {canManage ? (
        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Dodaj snapshot (MVP)</div>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Ovo je privremeni unos dok čekamo CHPP. Kasnije će se snapshotovi puniti automatski.
          </div>

          <form onSubmit={addSnapshot} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.7fr 0.7fr", gap: 10, marginTop: 12 }}>
            <select
              value={form.player_id}
              onChange={(e) => setForm((p) => ({ ...p, player_id: e.target.value }))}
              style={input}
              required
            >
              <option value="">Odaberi igrača…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name} ({p.position})</option>
              ))}
            </select>

            <input
              type="date"
              value={form.snapshot_date}
              onChange={(e) => setForm((p) => ({ ...p, snapshot_date: e.target.value }))}
              style={input}
              required
            />

            <select
              value={form.primary_skill}
              onChange={(e) => setForm((p) => ({ ...p, primary_skill: e.target.value }))}
              style={input}
            >
              {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <input
              type="number"
              value={form.primary_level}
              onChange={(e) => setForm((p) => ({ ...p, primary_level: e.target.value }))}
              style={input}
              placeholder="Primarni lvl"
            />

            <select
              value={form.secondary_skill}
              onChange={(e) => setForm((p) => ({ ...p, secondary_skill: e.target.value }))}
              style={input}
            >
              {SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <input
              type="number"
              value={form.secondary_level}
              onChange={(e) => setForm((p) => ({ ...p, secondary_level: e.target.value }))}
              style={input}
              placeholder="Sekundarni lvl"
            />

            <input
              value={form.training_type}
              onChange={(e) => setForm((p) => ({ ...p, training_type: e.target.value }))}
              style={input}
              placeholder="Trening tip (npr. playmaking)"
            />

            <input
              type="number"
              value={form.training_intensity}
              onChange={(e) => setForm((p) => ({ ...p, training_intensity: e.target.value }))}
              style={input}
              placeholder="Intenzitet (0-100)"
            />

            <input
              type="number"
              value={form.coach_level ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, coach_level: e.target.value }))}
              style={input}
              placeholder="Lvl trenera (opcionalno)"
            />

            <input
              type="number"
              value={form.assistants_count ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, assistants_count: e.target.value }))}
              style={input}
              placeholder="Asistenti (opcionalno)"
            />

            <input
              type="number"
              value={form.form_level ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, form_level: e.target.value }))}
              style={input}
              placeholder="Forma (opcionalno)"
            />

            <input
              type="number"
              value={form.stamina_level ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, stamina_level: e.target.value }))}
              style={input}
              placeholder="Stamina (opcionalno)"
            />

            <input
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              style={{ ...input, gridColumn: "span 4" }}
              placeholder="Bilješka (opcionalno)"
            />

            <button type="submit" style={{ gridColumn: "span 4", ...btnBlack }}>
              Spremi snapshot
            </button>
          </form>
        </div>
      ) : (
        <div style={card}>
          <b>Read-only:</b> snapshotove dodaje samo izbornik/admin.
        </div>
      )}

      {/* filteri */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ fontWeight: 900 }}>Filteri</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraga: ime, trening, bilješka..."
            style={{ ...input, minWidth: 260, flex: 1 }}
          />

          <select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)} style={input}>
            <option value="">Svi igrači</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={input}
          />

          <button
            onClick={() => { setPlayerFilter(""); setDateFilter(""); setQ(""); }}
            style={btnGhost}
          >
            Reset
          </button>
        </div>
      </div>

      {/* tablica */}
      <div style={{ ...card, marginTop: 14, overflowX: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          Snapshotovi {loadingRows ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Datum</th>
              <th style={th}>Igrač</th>
              <th style={th}>Primarni</th>
              <th style={th}>Sekundarni</th>
              <th style={th}>Trening</th>
              <th style={th}>Bilješka</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {!loadingRows && filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 12, opacity: 0.7 }}>
                  Nema snapshota za odabrane filtere.
                </td>
              </tr>
            ) : null}

            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={tdStrong}>{r.snapshot_date}</td>
                <td style={td}>{playerNameById.get(r.player_id) || `#${r.player_id}`}</td>
                <td style={td}>{r.primary_skill || "—"} {r.primary_level ?? ""}</td>
                <td style={td}>{r.secondary_skill || "—"} {r.secondary_level ?? ""}</td>
                <td style={td}>
                  {r.training_type ? `${r.training_type} (${r.training_intensity ?? "—"}%)` : "—"}
                </td>
                <td style={td}>{r.note || "—"}</td>
                <td style={td}>
                  {canManage ? (
                    <button onClick={() => deleteSnapshot(r.id)} style={btnDanger}>
                      Obriši
                    </button>
                  ) : (
                    <span style={{ opacity: 0.6 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Tipično: ubaci snapshot jednom tjedno za ključne kandidate → klikni “Generate gaps (MVP)” na Upozorenjima.
        </div>
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

const btnDanger = {
  padding: "8px 10px",
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
