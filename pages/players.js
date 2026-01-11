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

// HT U21 limit: 21g + 111d
function u21Eligibility(htYears, htDays) {
  if (htYears == null || htDays == null) return { ok: null, left: null, label: "—" };

  const total = htYears * 112 + htDays;
  const limit = 21 * 112 + 111;
  const left = limit - total;

  const ok = left >= 0;
  return {
    ok,
    left,
    label: ok ? `✅ Eligible (${left}d)` : `⛔ Out (${Math.abs(left)}d)`,
  };
}

function formatHtAge(y, d) {
  if (y == null || d == null) return "—";
  return `${y}.${String(d).padStart(2, "0")}`; // npr 21.60
}

export default function PlayersPage() {
  const [activeTeam, setActiveTeam] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  const [role, setRole] = useState(null);

  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    dob: "",
    status: "watch",
    notes: "",
    ht_age_years: "",
    ht_age_days: "",
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
      .select("id, ht_player_id, full_name, position, dob, team_type, status, notes, ht_age_years, ht_age_days")
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
      dob: newPlayer.dob || null,
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
      dob: "",
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

  return (
    <AppLayout title="Igrači">
      <div style={{ display: "grid", gap: 14 }}>
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

        {role === "admin" && (
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
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
                placeholder="DOB (opcionalno)"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <input
                value={newPlayer.ht_age_years}
                onChange={(e) => setNewPlayer((p) => ({ ...p, ht_age_years: e.target.value }))}
                placeholder="HT godine (npr 21)"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <input
                value={newPlayer.ht_age_days}
                onChange={(e) => setNewPlayer((p) => ({ ...p, ht_age_days: e.target.value }))}
                placeholder="HT dani (npr 60)"
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
                style={{ gridColumn: "span 4", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
              />

              <button
                type="submit"
                style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
              >
                Dodaj
              </button>
            </form>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              U21 pravilo: do 21g + 111d. Ako uneseš HT dob, alat odmah kaže eligible i “izlazi za X dana”.
            </div>
          </div>
        )}

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", overflowX: "auto" }}>
          <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
            Popis igrača {loadingPlayers ? " (učitavam...)" : `(${filtered.length})`}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                <th style={th}>Ime</th>
                <th style={th}>Poz</th>
                <th style={th}>HT dob</th>
                <th style={th}>U21</th>
                <th style={th}>Status</th>
                <th style={th}>Bilješke</th>
                <th style={th}>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const b = badgeStyle(r.status);
                const elig = u21Eligibility(r.ht_age_years, r.ht_age_days);

                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 10px", fontWeight: 900 }}>
                      {r.full_name}
                      {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                    </td>
                    <td style={{ padding: "10px 10px" }}>{r.position}</td>

                    <td style={{ padding: "10px 10px" }}>
                      {formatHtAge(r.ht_age_years, r.ht_age_days)}
                      <div style={{ fontSize: 12, opacity: 0.65 }}>({r.ht_age_years ?? "—"}g {r.ht_age_days ?? "—"}d)</div>
                    </td>

                    <td style={{ padding: "10px 10px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "6px 10px",
                          borderRadius: 10,
                          fontWeight: 900,
                          background:
                            elig.ok === null ? "#f3f4f6" : elig.ok ? "#dcfce7" : "#fee2e2",
                          color:
                            elig.ok === null ? "#111827" : elig.ok ? "#166534" : "#991b1b",
                        }}
                      >
                        {elig.label}
                      </span>
                      {activeTeam === "NT" ? (
                        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>NT: U21 status nije relevantan</div>
                      ) : null}
                    </td>

                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                        {r.status}
                      </span>
                    </td>

                    <td style={{ padding: "10px 10px", minWidth: 260 }}>
                      <textarea
                        defaultValue={r.notes || ""}
                        placeholder="Bilješke..."
                        style={{ width: "100%", minHeight: 46, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
                        disabled={role !== "admin"}
                        onBlur={(e) => {
                          if (role === "admin") quickSaveNotes(r.id, e.target.value);
                        }}
                      />
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
                  <td colSpan={7} style={{ padding: 14, opacity: 0.75 }}>
                    Nema rezultata.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Sljedeće: na Dashboardu “Ispadaju” računamo po HT dobi (ne više risk).
        </div>
      </div>
    </AppLayout>
  );
}

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
