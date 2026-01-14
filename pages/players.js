// pages/players.js
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" },
  };
  return map[kind] || map.watch;
}

export default function Players() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");
  const [teamType, setTeamType] = useState("ALL"); // ALL | U21 | NT

  // admin forma za dodavanje igrača
  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    team_type: "U21",
    status: "watch",
    notes: "",
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
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role);
      setAccess("ok");
    })();
  }, []);

  async function fetchPlayers() {
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      // ✅ STANDARD: ht_player_id
      .select("id, ht_player_id, full_name, position, team_type, status, notes, last_seen_at")
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok") fetchPlayers();
  }, [access]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !query ||
        (r.full_name || "").toLowerCase().includes(query) ||
        String(r.ht_player_id || "").includes(query) ||
        (r.position || "").toLowerCase().includes(query);

      const matchesTeam = teamType === "ALL" || r.team_type === teamType;
      return matchesQ && matchesTeam;
    });
  }, [rows, q, teamType]);

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
      team_type: newPlayer.team_type,
      status: newPlayer.status,
      notes: newPlayer.notes,
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
      team_type: "U21",
      status: "watch",
      notes: "",
    });

    fetchPlayers();
  }

  async function quickSaveNotes(id, notes) {
    const { error } = await supabase.from("players").update({ notes }).eq("id", id);
    if (error) alert("Greška kod spremanja bilješki: " + error.message);
    else fetchPlayers();
  }

  if (access === "denied") {
    return (
      <AppLayout title="Igrači">
        <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ color: "#c00" }}>Igrači</h1>
          <p>
            <strong>Nemaš pristup.</strong>
          </p>
          <Link href="/login">→ Prijava</Link>
        </main>
      </AppLayout>
    );
  }

  if (access === "loading") {
    return (
      <AppLayout title="Igrači">
        <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Igrači">
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
            <h1 style={{ margin: "6px 0 0", color: "#c00" }}>Igrači (globalno)</h1>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
              Ulogiran: <strong>{email}</strong> · Uloga: <strong>{role}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
              Naslovna
            </Link>
            <Link href="/dashboard" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
              Dashboard
            </Link>
            <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
              Odjava
            </button>
          </div>
        </div>

        {/* Filteri */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: ime, HT ID, pozicija..."
            style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />

          <select value={teamType} onChange={(e) => setTeamType(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}>
            <option value="ALL">U21 + NT</option>
            <option value="U21">Samo U21</option>
            <option value="NT">Samo NT</option>
          </select>

          <button onClick={fetchPlayers} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}>
            Osvježi
          </button>
        </div>

        {/* Admin: dodavanje igrača */}
        {role === "admin" && (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj igrača (MVP)</div>
            <form onSubmit={addPlayer} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              <input
                value={newPlayer.full_name}
                onChange={(e) => setNewPlayer((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Ime i prezime"
                required
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <input
                value={newPlayer.ht_player_id}
                onChange={(e) => setNewPlayer((p) => ({ ...p, ht_player_id: e.target.value }))}
                placeholder="HT ID (opcionalno)"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <select value={newPlayer.position} onChange={(e) => setNewPlayer((p) => ({ ...p, position: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <option value="GK">GK</option>
                <option value="DEF">DEF</option>
                <option value="WB">WB</option>
                <option value="IM">IM</option>
                <option value="W">W</option>
                <option value="FWD">FWD</option>
              </select>

              <select value={newPlayer.team_type} onChange={(e) => setNewPlayer((p) => ({ ...p, team_type: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <option value="U21">U21</option>
                <option value="NT">NT</option>
              </select>

              <select value={newPlayer.status} onChange={(e) => setNewPlayer((p) => ({ ...p, status: e.target.value }))}
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <option value="core">core</option>
                <option value="rotation">rotation</option>
                <option value="watch">watch</option>
                <option value="risk">risk</option>
              </select>

              <input
                value={newPlayer.notes}
                onChange={(e) => setNewPlayer((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Bilješka (kratko)"
                style={{ gridColumn: "span 2", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <button type="submit" style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
                Dodaj
              </button>
            </form>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Napomena: “Globalno” je legacy stranica. Glavni rad je kroz /team/nt i /team/u21.
            </div>
          </div>
        )}

        {/* Tablica */}
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
          <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
            Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Ime</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Poz</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Tip</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>HT ID</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Bilješke</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const b = badgeStyle(r.status);
                return (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                      {r.full_name}
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.position}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.team_type}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      {r.ht_player_id ? String(r.ht_player_id) : "—"}
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", minWidth: 260 }}>
                      <textarea
                        defaultValue={r.notes || ""}
                        placeholder="Bilješke..."
                        style={{ width: "100%", minHeight: 46, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                        disabled={role !== "admin"}
                        onBlur={(e) => {
                          if (role === "admin") quickSaveNotes(r.id, e.target.value);
                        }}
                      />
                      {role !== "admin" ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>MVP: bilješke uređuje samo admin.</div> : null}
                    </td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
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
                    Nema rezultata.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </main>
    </AppLayout>
  );
}
