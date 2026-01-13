// pages/team/[team]/players.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" }
  };
  return map[kind] || map.watch;
}

function teamLabel(team) {
  return team === "u21" ? "U21 Hrvatska" : "NT Hrvatska";
}

function teamTypeDB(team) {
  return team === "u21" ? "U21" : "NT";
}

export default function TeamPlayers() {
  const router = useRouter();
  const team = (router.query.team || "").toString().toLowerCase(); // "u21" | "nt"

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userTeamType, setUserTeamType] = useState(null); // "U21" | "NT" | null

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

  // 1) auth + users tablica
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
        .select("*")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role || "");
      setUserTeamType(urows[0].team_type || null);
      setAccess("ok");
    })();
  }, []);

  // 2) zaštita: staff vidi samo svoj team (admin vidi sve)
  useEffect(() => {
    if (access !== "ok") return;
    if (!team || (team !== "u21" && team !== "nt")) return;

    const wanted = teamTypeDB(team);

    if (role !== "admin") {
      if (!userTeamType || userTeamType !== wanted) {
        // nema pristup tuđem timu
        router.replace("/");
      }
    }
  }, [access, team, role, userTeamType, router]);

  async function fetchPlayers() {
    if (!team || (team !== "u21" && team !== "nt")) return;
    setLoadingPlayers(true);

    const wanted = teamTypeDB(team);

    // SELECT * da izbjegnemo “schema cache / column not found” probleme dok mijenjamo tablicu
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_type", wanted)
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok") fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, team]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !query ||
        (r.full_name || "").toLowerCase().includes(query) ||
        String(r.ht_player_id || "").includes(query) ||
        (r.position || "").toLowerCase().includes(query);

      return matchesQ;
    });
  }, [rows, q]);

  async function addPlayer(e) {
    e.preventDefault();
    if (!team || (team !== "u21" && team !== "nt")) return;

    const wanted = teamTypeDB(team);

    const payload = {
      ht_player_id: newPlayer.ht_player_id ? Number(newPlayer.ht_player_id) : null,
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      date_of_birth: newPlayer.date_of_birth,
      team_type: wanted,
      status: newPlayer.status,
      notes: newPlayer.notes
    };

    const { error } = await supabase.from("players").insert(payload);
    if (error) {
      alert("Greška: " + error.message);
      return;
    }

    setNewPlayer({ ht_player_id: "", full_name: "", position: "DEF", date_of_birth: "", status: "watch", notes: "" });
    fetchPlayers();
  }

  async function quickSaveNotes(id, notes) {
    const { error } = await supabase.from("players").update({ notes }).eq("id", id);
    if (error) alert("Greška kod spremanja bilješki: " + error.message);
    else fetchPlayers();
  }

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid #e5e7eb" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Igrači</h1>
          <p><strong>Nemaš pristup.</strong></p>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading" || !team) {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Hrvatski U21/NT Tracker"
      team={team}
      teamLabel={teamLabel(team)}
      email={email}
      role={role}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Igrači</h1>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
            Aktivni tim: <strong>{teamLabel(team)}</strong>
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{ flex: 1, minWidth: 260, padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff" }}
        />

        <button
          onClick={fetchPlayers}
          style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Osvježi
        </button>
      </div>

      {/* Admin: dodavanje igrača */}
      {role === "admin" && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, background: "#fff", padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 10 }}>
            Dodaj igrača (MVP) — sprema u: <strong>{teamLabel(team)}</strong>
          </div>

          <form onSubmit={addPlayer} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
            <input
              value={newPlayer.full_name}
              onChange={(e) => setNewPlayer((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Ime i prezime"
              required
              style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
            />

            <input
              value={newPlayer.ht_player_id}
              onChange={(e) => setNewPlayer((p) => ({ ...p, ht_player_id: e.target.value }))}
              placeholder="HT ID (opcionalno)"
              style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
            />

            <select
              value={newPlayer.position}
              onChange={(e) => setNewPlayer((p) => ({ ...p, position: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
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
              style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
            />

            <select
              value={newPlayer.status}
              onChange={(e) => setNewPlayer((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
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
              style={{ gridColumn: "span 3", padding: 12, borderRadius: 14, border: "1px solid #e5e7eb" }}
            />

            <button
              type="submit"
              style={{ gridColumn: "span 4", padding: "12px 14px", borderRadius: 16, border: "none", background: "#101114", color: "#fff", fontWeight: 1000, cursor: "pointer" }}
            >
              Dodaj
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: CHPP sync i prava HT logika (trening / subskill) dolazi kad dobijemo licencu.
          </div>
        </div>
      )}

      {/* Tablica */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 1000, borderBottom: "1px solid #e5e7eb" }}>
          Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Ime</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Poz</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>DOB</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>HT dob</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Bilješke</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const b = badgeStyle(r.status);
              const dob = r.date_of_birth || r.dob || "";
              const htAge = (r.ht_age_years != null && r.ht_age_days != null) ? `${r.ht_age_years}g (${r.ht_age_days}d)` : "—";

              return (
                <tr key={r.id}>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 1000 }}>
                    {r.full_name}
                    {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.position}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{dob || "—"}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{htAge}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 12, background: b.bg, color: b.fg, fontWeight: 1000 }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", minWidth: 280 }}>
                    <textarea
                      defaultValue={r.notes || ""}
                      placeholder="Bilješke..."
                      style={{ width: "100%", minHeight: 48, padding: 10, borderRadius: 14, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                      disabled={role !== "admin"}
                      onBlur={(e) => {
                        if (role === "admin") quickSaveNotes(r.id, e.target.value);
                      }}
                    />
                    {role !== "admin" ? <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>MVP: bilješke uređuje samo admin.</div> : null}
                  </td>
                </tr>
              );
            })}

            {!loadingPlayers && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, opacity: 0.75 }}>
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
