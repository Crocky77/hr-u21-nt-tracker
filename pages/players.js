import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

const HR_COUNTRY_ID = 191;

function getActiveTeam() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTeam");
}

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" },
  };
  return map[kind] || map.watch;
}

function calcAgeApprox(dateStr) {
  if (!dateStr) return "-";
  const dob = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  const ms = now.getTime() - dob.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  const years = Math.floor(days / 365);
  const remDays = days % 365;
  return `${years}g (${remDays}d)`;
}

export default function PlayersPage() {
  const [activeTeam, setActiveTeam] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  // role iz users tablice (da zadržimo logiku “admin može dodavati i uređivati”)
  const [role, setRole] = useState(null);

  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    dob: "",
    status: "watch",
    notes: "",
  });

  useEffect(() => {
    setActiveTeam(getActiveTeam());
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) return;

      const { data: urows } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .limit(1);

      if (urows && urows.length > 0) setRole(urows[0].role);
    })();
  }, []);

  async function fetchPlayers() {
    if (!activeTeam) return;
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, dob, country_id, team_type, status, notes, created_at")
      .eq("team_type", activeTeam)
      .order("id", { ascending: false });

    if (error) alert("Greška kod dohvata igrača: " + error.message);
    else setRows(data || []);

    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (activeTeam) fetchPlayers();
  }, [activeTeam]);

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

  async function addPlayer(e) {
    e.preventDefault();
    if (!activeTeam) return;

    const payload = {
      country_id: HR_COUNTRY_ID,
      team_type: activeTeam,
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      dob: newPlayer.dob,
      status: newPlayer.status,
      notes: newPlayer.notes,
      ht_player_id: newPlayer.ht_player_id ? Number(newPlayer.ht_player_id) : null,
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
      dob: "",
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

  return (
    <AppLayout title="Igrači">
      {/* Filteri */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        <button
          onClick={fetchPlayers}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Osvježi
        </button>
      </div>

      {/* Admin: dodavanje igrača */}
      {role === "admin" && (
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj igrača (MVP) — tim: {activeTeam}</div>

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

            <select
              value={newPlayer.position}
              onChange={(e) => setNewPlayer((p) => ({ ...p, position: e.target.value }))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
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
              value={newPlayer.dob}
              onChange={(e) => setNewPlayer((p) => ({ ...p, dob: e.target.value }))}
              required
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            />

            <select
              value={newPlayer.status}
              onChange={(e) => setNewPlayer((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
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
              style={{ gridColumn: "span 3", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            />

            <button
              type="submit"
              style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Dodaj
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: HT dob (21g+111d) i automatika upozorenja dolaze uskoro.
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
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>DOB</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Dob (MVP)</th>
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
                    {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.position}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.dob}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{calcAgeApprox(r.dob)}</td>
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
                  Nema rezultata. (Ako si admin, dodaj prvog igrača gore.)
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Sljedeće: prava HT dob (21g+111d) + “U21 eligible” oznaka + bilješke po skautu (player_notes tablica).
      </div>
    </AppLayout>
  );
}
