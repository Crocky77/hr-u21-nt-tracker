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

// U21 limit: 21g + 111d (HT)
function u21Info(team, y, d) {
  if (team !== "U21") return { label: "—", ok: null };

  if (y == null || d == null) return { label: "— (unesi HT dob)", ok: null };

  const years = Number(y);
  const days = Number(d);

  if (years < 21) return { label: "✅ Eligible", ok: true };
  if (years > 21) return { label: "⛔ Out", ok: false };

  // years === 21
  if (days <= 111) return { label: `✅ Eligible (${111 - days}d do limita)`, ok: true };
  return { label: "⛔ Out", ok: false };
}

export default function PlayersPage() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState(null); // U21 | NT

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    status: "watch",
    notes: "",
    ht_age_years: "",
    ht_age_days: "",
  });

  // 1) Auth + users lookup (role + team_type)
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

      if (!urows || urows.length === 0 || !urows[0].team_type) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role);
      setTeam(urows[0].team_type); // U21 ili NT
      setAccess("ok");
    })();
  }, []);

  async function fetchPlayers() {
    if (!team) return;
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, team_type, status, notes, ht_age_years, ht_age_days")
      .eq("team_type", team)
      .order("id", { ascending: false });

    if (error) {
      alert("Greška kod dohvata igrača: " + error.message);
      setRows([]);
    } else {
      setRows(data || []);
    }

    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok" && team) fetchPlayers();
  }, [access, team]);

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
    if (!team) return;

    const payload = {
      team_type: team, // ✅ uvijek po user teamu
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      status: newPlayer.status,
      notes: newPlayer.notes,

      ht_player_id: newPlayer.ht_player_id ? Number(newPlayer.ht_player_id) : null,
      ht_age_years: newPlayer.ht_age_years !== "" ? Number(newPlayer.ht_age_years) : null,
      ht_age_days: newPlayer.ht_age_days !== "" ? Number(newPlayer.ht_age_days) : null,
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
      status: "watch",
      notes: "",
      ht_age_years: "",
      ht_age_days: "",
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
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#b91c1c" }}>Igrači</h1>
        <p><strong>Nemaš pristup</strong> ili nemaš dodijeljen team_type.</p>
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
    <AppLayout pageTitle={`Igrači — ${team}`}>
      {/* Filter */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />

        <button
          onClick={fetchPlayers}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Osvježi
        </button>
      </div>

      {/* Admin form (dok ste svi admini, svi vide) */}
      {role === "admin" && (
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj igrača — tim: {team}</div>

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

            {/* HT dob polja */}
            <input
              value={newPlayer.ht_age_years}
              onChange={(e) => setNewPlayer((p) => ({ ...p, ht_age_years: e.target.value }))}
              placeholder="HT godine (npr 21)"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            />

            <input
              value={newPlayer.ht_age_days}
              onChange={(e) => setNewPlayer((p) => ({ ...p, ht_age_days: e.target.value }))}
              placeholder="HT dani (0–111)"
              style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            />

            <input
              value={newPlayer.notes}
              onChange={(e) => setNewPlayer((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Bilješka (kratko)"
              style={{ gridColumn: "span 2", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
            />

            <button
              type="submit"
              style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Dodaj
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * U21 status se računa samo u U21 timu: do 21g + 111d.
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Ime</th>
              <th style={th}>Poz</th>
              {team === "U21" ? <th style={th}>U21 status</th> : null}
              {team === "U21" ? <th style={th}>HT dob</th> : null}
              <th style={th}>Status</th>
              <th style={th}>Bilješke</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const b = badgeStyle(r.status);
              const u21 = u21Info(team, r.ht_age_years, r.ht_age_days);

              return (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 10px", fontWeight: 900 }}>
                    {r.full_name}
                    {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                  </td>
                  <td style={{ padding: "10px 10px" }}>{r.position}</td>

                  {team === "U21" ? (
                    <td style={{ padding: "10px 10px", fontWeight: 900 }}>
                      {u21.label}
                    </td>
                  ) : null}

                  {team === "U21" ? (
                    <td style={{ padding: "10px 10px" }}>
                      {r.ht_age_years ?? "?"}g {r.ht_age_days ?? "?"}d
                    </td>
                  ) : null}

                  <td style={{ padding: "10px 10px" }}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                      {r.status}
                    </span>
                  </td>

                  <td style={{ padding: "10px 10px", minWidth: 280 }}>
                    <textarea
                      defaultValue={r.notes || ""}
                      placeholder="Bilješke..."
                      style={{ width: "100%", minHeight: 46, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                      disabled={role !== "admin"}
                      onBlur={(e) => {
                        if (role === "admin") quickSaveNotes(r.id, e.target.value);
                      }}
                    />
                    {role !== "admin" ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>MVP: uređivanje samo admin.</div> : null}
                  </td>

                  <td style={{ padding: "10px 10px" }}>
                    <Link href={`/players/${r.id}`} style={{ textDecoration: "none", fontWeight: 900 }}>
                      Detalji →
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!loadingPlayers && filtered.length === 0 ? (
              <tr>
                <td colSpan={team === "U21" ? 7 : 5} style={{ padding: 14, opacity: 0.75 }}>
                  Nema igrača. Dodaj prvog gore.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Sljedeće: “Trening alarmi” (koliko igrač zaostaje za idealnim treningom) + bilješke po skautu (posebna tablica).
      </div>
    </AppLayout>
  );
}

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
