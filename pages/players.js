import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AppLayout from "../components/AppLayout";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const STAFF = {
  U21: { teamLabel: "U21 Hrvatska", coach: "matej1603", assistant: "Zvonzi_" },
  NT: { teamLabel: "NT Hrvatska", coach: "Zagi_", assistant: "Nosonja" },
};

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
  const [teamType, setTeamType] = useState(null); // U21 | NT

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  // admin: forma za dodavanje igrača (MVP)
  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    date_of_birth: "", // OVO je kolona u schema (NOT NULL)
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
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      const u = urows[0];
      if (!u.team_type) {
        setAccess("denied");
        return;
      }

      setRole(u.role || "user");
      setTeamType(u.team_type);
      setAccess("ok");
    })();
  }, []);

  async function fetchPlayers() {
    if (!teamType) return;

    setLoadingPlayers(true);
    const { data, error } = await supabase
      .from("players")
      .select(
        "id, ht_player_id, full_name, position, team_type, status, notes, last_seen_at, date_of_birth, ht_age_years, ht_age_days, u21_status"
      )
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok") fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, teamType]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      return (
        !query ||
        (r.full_name || "").toLowerCase().includes(query) ||
        String(r.ht_player_id || "").includes(query) ||
        (r.position || "").toLowerCase().includes(query)
      );
    });
  }, [rows, q]);

  async function addPlayer(e) {
    e.preventDefault();

    // MVP: country_id mora postojati (NOT NULL). Stavljamo default 0.
    // Kasnije iz CHPP: stvarni country_id + klub info itd.
    const payload = {
      ht_player_id: newPlayer.ht_player_id ? Number(newPlayer.ht_player_id) : null,
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      team_type: teamType, // ZAKLJUČANO na tim korisnika
      status: newPlayer.status,
      notes: newPlayer.notes,
      country_id: 0,
      date_of_birth: newPlayer.date_of_birth, // NOT NULL
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
      notes: "",
    });

    fetchPlayers();
  }

  async function quickSaveNotes(id, notes) {
    const { error } = await supabase.from("players").update({ notes }).eq("id", id);
    if (error) alert("Greška kod spremanja bilješki: " + error.message);
    else fetchPlayers();
  }

  const staff = teamType ? STAFF[teamType] : null;

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Nemaš pristup.</h2>
          <p>Prijavi se s odobrenim emailom ili kontaktiraj admina.</p>
          <Link href="/login">→ Prijava</Link>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Hrvatski U21/NT Tracker"
      subtitle="Selektorski panel • Scouting • U21/NT"
      activeTeamLabel={staff?.teamLabel || null}
    >
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: "#b91c1c" }}>Igrači</div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Aktivni tim: <b>{staff?.teamLabel}</b> · Izbornik: <b>{staff?.coach}</b> · Pomoćnik: <b>{staff?.assistant}</b>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
          Ulogiran: <b>{email}</b> · Uloga: <b>{role}</b>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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

      {/* Admin: add */}
      {role === "admin" ? (
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Dodaj igrača (MVP) — sprema u: <span style={{ color: "#b91c1c" }}>{staff?.teamLabel}</span>
          </div>

          <form onSubmit={addPlayer} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 10 }}>
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
              value={newPlayer.date_of_birth}
              onChange={(e) => setNewPlayer((p) => ({ ...p, date_of_birth: e.target.value }))}
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
            Napomena: HT dob i U21 status će biti precizni tek kad uvedemo HT formulu i CHPP sync.
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
          Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Ime</th>
              <th style={th}>Poz</th>
              <th style={th}>HT dob</th>
              {teamType === "U21" ? <th style={th}>U21</th> : null}
              <th style={th}>Status</th>
              <th style={th}>Bilješke</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const b = badgeStyle(r.status);
              return (
                <tr key={r.id}>
                  <td style={tdStrong}>
                    {r.full_name}
                    {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                  </td>

                  <td style={td}>{r.position || "-"}</td>

                  <td style={td}>
                    {r.ht_age_years != null && r.ht_age_days != null
                      ? `${r.ht_age_years}g (${r.ht_age_days}d)`
                      : "-"}
                  </td>

                  {teamType === "U21" ? <td style={td}>{r.u21_status || "-"}</td> : null}

                  <td style={td}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                      {r.status}
                    </span>
                  </td>

                  <td style={{ ...td, minWidth: 260 }}>
                    <textarea
                      defaultValue={r.notes || ""}
                      placeholder="Bilješke..."
                      style={{ width: "100%", minHeight: 46, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                      disabled={role !== "admin"} // MVP: admin uređuje
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
                <td colSpan={teamType === "U21" ? 7 : 6} style={{ padding: 14, opacity: 0.75 }}>
                  Nema rezultata. (Ako si admin, dodaj prvog igrača gore.)
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Sljedeće: bilješke po skautu (notes tablica po useru), trening alarmi, CHPP sync za skillove/sub-skillove.
      </div>
    </AppLayout>
  );
}

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };
