import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const HR_COUNTRY_ID = 191; // Croatia (za sad hardkodirano za naš alat)

const TEAM_STAFF = {
  U21: { label: "U21 Hrvatska", coach: "matej1603", assistant: "Zvonzi_" },
  NT: { label: "NT Hrvatska", coach: "Zagi_", assistant: "Nosonja" },
};

function getActiveTeam() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeTeam");
}
function setActiveTeam(team) {
  if (typeof window === "undefined") return;
  localStorage.setItem("activeTeam", team);
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

// MVP dob: iz datuma rođenja računamo približno "g (d)" samo za osjećaj.
// Kasnije ubacujemo pravu HT dob formulu (sezone/tjedni).
function calcAgeApprox(dateStr) {
  if (!dateStr) return "-";
  const dob = new Date(dateStr + "T00:00:00Z");
  const now = new Date();
  const ms = now.getTime() - dob.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));

  // PLACEHOLDER: nije HT precizno, samo MVP
  const years = Math.floor(days / 365);
  const remDays = days % 365;

  return `${years}g (${remDays}d)`;
}

export default function Players() {
  const router = useRouter();

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [activeTeam, setActiveTeamState] = useState(null); // U21 | NT
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
    notes: "",
  });

  // 1) Active team gate
  useEffect(() => {
    const t = getActiveTeam();
    if (!t) {
      router.replace("/");
      return;
    }
    setActiveTeamState(t);
  }, [router]);

  // 2) Auth + role
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
    if (!activeTeam) return;
    setLoadingPlayers(true);

    // Filtriramo po activeTeam (opcija 2)
    const { data, error } = await supabase
      .from("players")
      .select(
        "id, ht_player_id, full_name, position, date_of_birth, country_id, team_type, status, notes, last_seen_at, created_at"
      )
      .eq("team_type", activeTeam)
      .order("id", { ascending: false });

    if (!error && data) setRows(data);
    else if (error) alert("Greška kod dohvata igrača: " + error.message);

    setLoadingPlayers(false);
  }

  useEffect(() => {
    if (access === "ok" && activeTeam) fetchPlayers();
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
    if (!activeTeam) return;

    const payload = {
      // DB constraints:
      country_id: HR_COUNTRY_ID, // NOT NULL u tvojoj tablici
      team_type: activeTeam, // automatski iz odabira
      full_name: newPlayer.full_name.trim(),
      position: newPlayer.position,
      date_of_birth: newPlayer.date_of_birth, // NOT NULL u tvojoj tablici
      status: newPlayer.status,
      notes: newPlayer.notes,

      // opcionalno
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

  const staff = activeTeam ? TEAM_STAFF[activeTeam] : null;

  const onSwitchTeam = (team) => {
    setActiveTeam(team);
    setActiveTeamState(team);
    // refresh list
    router.replace("/players");
  };

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
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 50% 0%, rgba(211,47,47,0.18) 0%, rgba(255,255,255,1) 60%)",
      }}
    >
      {/* Header (sličan dashboardu) */}
      <div
        style={{
          background: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #b71c1c 100%)",
          color: "white",
          padding: "14px 18px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Hrvatski U21/NT Tracker</div>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Igrači</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.95 }}>
              Aktivni tim: <b>{staff?.label || activeTeam}</b>
              {staff ? (
                <>
                  {" "}· Izbornik: <b>{staff.coach}</b> · Pomoćnik: <b>{staff.assistant}</b>
                </>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, opacity: 0.95 }}>
              Ulogiran: <b>{email}</b> · Uloga: <b>{role}</b>
            </span>

            {/* Team switch */}
            <div
              style={{
                display: "flex",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.12)",
              }}
            >
              {["U21", "NT"].map((t) => (
                <button
                  key={t}
                  onClick={() => onSwitchTeam(t)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    border: "none",
                    color: "white",
                    background: activeTeam === t ? "rgba(0,0,0,0.24)" : "transparent",
                    fontWeight: 900,
                  }}
                  title={`Prebaci na ${TEAM_STAFF[t].label}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Link
              href="/"
              style={{
                background: "rgba(255,255,255,0.16)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Naslovna
            </Link>

            <Link
              href="/dashboard"
              style={{
                background: "rgba(255,255,255,0.16)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.25)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Odjava
            </button>
          </div>
        </div>
      </div>

      <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        {/* Filter */}
        <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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

        {/* Admin: add player */}
        {role === "admin" && (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              Dodaj igrača (MVP) — sprema u: <span style={{ color: "#b71c1c" }}>{staff?.label || activeTeam}</span>
            </div>

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
                style={{
                  gridColumn: "span 4",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Dodaj
              </button>
            </form>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Napomena: HT dob + U21 status će biti precizni tek kad uvedemo HT formulu i CHPP sync.
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
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Ime</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Poz</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Tim</th>
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
                const dobDate = r.date_of_birth || "-";
                const approx = calcAgeApprox(r.date_of_birth);

                return (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                      {r.full_name}
                      {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                    </td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.position}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.team_type}</td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      {dobDate}
                    </td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      {approx}
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
                        style={{
                          width: "100%",
                          minHeight: 46,
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                          fontFamily: "Arial, sans-serif",
                        }}
                        disabled={role !== "admin"} // MVP: samo admin uređuje
                        onBlur={(e) => {
                          if (role === "admin") quickSaveNotes(r.id, e.target.value);
                        }}
                      />
                      {role !== "admin" ? (
                        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                          MVP: bilješke uređuje samo admin.
                        </div>
                      ) : null}
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
                  <td colSpan={8} style={{ padding: 14, opacity: 0.75 }}>
                    Nema rezultata. (Ako si admin, dodaj prvog igrača gore.)
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          Sljedeće: prava HT dob (21g+111d), U21 status, te bilješke po skautu (notes tablica po useru, ne samo admin).
        </div>
      </main>
    </div>
  );
}
