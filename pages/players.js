import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" }
  };
  return map[kind] || map.watch;
}

// MVP HT age prikaz (112 dana = 1 HT godina)
const HT_YEAR_DAYS = 112;
function daysBetween(dateA, dateB) {
  const a = new Date(Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate()));
  const b = new Date(Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate()));
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
function htAgeFromDob(dobStr, atDateStr) {
  if (!dobStr || !atDateStr) return null;
  const dob = new Date(dobStr + "T00:00:00Z");
  const at = new Date(atDateStr + "T00:00:00Z");
  const d = daysBetween(at, dob);
  const years = Math.floor(d / HT_YEAR_DAYS);
  const days = d % HT_YEAR_DAYS;
  return { years, days };
}
function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Players() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [userTeam, setUserTeam] = useState(null); // U21 | NT
  const [activeTeam, setActiveTeam] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  // admin: forma za dodavanje igrača (MVP)
  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    date_of_birth: "",
    status: "watch",
    notes: ""
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
      setUserTeam(urows[0].team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  // aktivni tim (admin može override preko ?team=)
  useEffect(() => {
    if (access !== "ok" || !userTeam) return;

    const params = new URLSearchParams(window.location.search);
    const qpTeam = params.get("team");
    if (role === "admin" && (qpTeam === "U21" || qpTeam === "NT")) {
      setActiveTeam(qpTeam);
    } else {
      setActiveTeam(userTeam);
    }
  }, [access, userTeam, role]);

  async function fetchPlayers(teamType) {
    setLoadingPlayers(true);
    const { data, error } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, date_of_birth, team_type, status, notes, last_seen_at")
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok" && activeTeam) fetchPlayers(activeTeam);
  }, [access, activeTeam]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!query) return true;
      return (
        (r.full_name || "").toLowerCase().includes(query) ||
        String(r.ht_player_id || "").includes(query) ||
        (r.position || "").toLowerCase().includes(query)
      );
    });
  }, [rows, q]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function addPlayer(e) {
    e.preventDefault();

    const payload = {
      ht_player_id: newPlayer.ht_player_id ? Number(newPlayer.ht_player_id) : null,
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      date_of_birth: newPlayer.date_of_birth,
      team_type: activeTeam, // zaključano!
      status: newPlayer.status,
      notes: newPlayer.notes
    };

    const { error } = await supabase.from("players").insert(payload);
    if (error) {
      alert("Greška: " + error.message);
      return;
    }

    setNewPlayer({
      ht_player_id: "",
      full_name: "",
      position: "DEF",
      date_of_birth: "",
      status: "watch",
      notes: ""
    });

    fetchPlayers(activeTeam);
  }

  async function quickSaveNotes(id, notes) {
    const { error } = await supabase.from("players").update({ notes }).eq("id", id);
    if (error) alert("Greška kod spremanja bilješki: " + error.message);
    else fetchPlayers(activeTeam);
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Igrači</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading" || !activeTeam) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        Učitavam...
      </main>
    );
  }

  return (
    <AppLayout
      title="Igrači"
      subtitle={`Aktivni tim: ${activeTeam} Hrvatska`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <button onClick={() => fetchPlayers(activeTeam)} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      {/* Filteri */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
        />
      </div>

      {/* Admin: dodavanje igrača */}
      {role === "admin" && (
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Dodaj igrača (MVP) — sprema u: <span style={{ color: "#c00" }}>{activeTeam} Hrvatska</span>
          </div>

          <form onSubmit={addPlayer} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.7fr 0.9fr", gap: 10 }}>
            <input
              value={newPlayer.full_name}
              onChange={(e) => setNewPlayer((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Ime i prezime"
              required
              style={input}
            />

            <input
              value={newPlayer.ht_player_id}
              onChange={(e) => setNewPlayer((p) => ({ ...p, ht_player_id: e.target.value }))}
              placeholder="HT ID (opcionalno)"
              style={input}
            />

            <select
              value={newPlayer.position}
              onChange={(e) => setNewPlayer((p) => ({ ...p, position: e.target.value }))}
              style={input}
            >
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="WB">WB</option>
              <option value="IM">IM</option>
              <option value="W">W</option>
              <option value="FWD">FWD</option>
            </select>

            <input
              type="date"
              value={newPlayer.date_of_birth}
              onChange={(e) => setNewPlayer((p) => ({ ...p, date_of_birth: e.target.value }))}
              required
              style={input}
            />

            <select
              value={newPlayer.status}
              onChange={(e) => setNewPlayer((p) => ({ ...p, status: e.target.value }))}
              style={input}
            >
              <option value="core">core</option>
              <option value="rotation">rotation</option>
              <option value="watch">watch</option>
              <option value="risk">risk</option>
            </select>

            <input
              value={newPlayer.notes}
              onChange={(e) => setNewPlayer((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Bilješka (kratko)"
              style={{ ...input, gridColumn: "span 3" }}
            />

            <button
              type="submit"
              style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Dodaj
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: pravi HT dob + trening alarmi dolaze kasnije (CHPP sync + trening formula).
          </div>
        </div>
      )}

      {/* Tablica */}
      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", overflowX: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Ime</th>
              <th style={th}>Poz</th>
              <th style={th}>DOB</th>
              <th style={th}>Dob (MVP)</th>
              <th style={th}>Status</th>
              <th style={th}>Bilješke</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const b = badgeStyle(r.status);
              const age = htAgeFromDob(r.date_of_birth, todayIso());
              return (
                <tr key={r.id}>
                  <td style={tdStrong}>
                    {r.full_name}
                    {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                  </td>

                  <td style={td}>{r.position || "—"}</td>
                  <td style={td}>{r.date_of_birth || "—"}</td>
                  <td style={td}>{age ? `${age.years}g ${age.days}d` : "—"}</td>

                  <td style={td}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                      {r.status || "—"}
                    </span>
                  </td>

                  <td style={{ ...td, minWidth: 260 }}>
                    <textarea
                      defaultValue={r.notes || ""}
                      placeholder="Bilješke..."
                      style={{ width: "100%", minHeight: 46, padding: 10, borderRadius: 12, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                      disabled={role !== "admin"} // MVP: samo admin uređuje
                      onBlur={(e) => {
                        if (role === "admin") quickSaveNotes(r.id, e.target.value);
                      }}
                    />
                    {role !== "admin" ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>MVP: bilješke uređuje samo admin.</div> : null}
                  </td>

                  <td style={td}>
                    <Link href={`/players/${r.id}`} style={{ textDecoration: "none", fontWeight: 900 }}>
                      Detalji →
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!loadingPlayers && filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 14, opacity: 0.75 }}>
                  Nema rezultata. (Ako si admin, dodaj prvog igrača gore.)
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

// --- styles ---
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

const input = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff"
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };
