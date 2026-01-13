import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function badgeStyle(kind) {
  const map = {
    core: { bg: "#dcfce7", fg: "#166534" },
    rotation: { bg: "#e0f2fe", fg: "#075985" },
    watch: { bg: "#f3f4f6", fg: "#111827" },
    risk: { bg: "#fee2e2", fg: "#991b1b" },
  };
  return map[kind] || map.watch;
}

export default function TeamPlayers() {
  const router = useRouter();
  const teamSlug = router.query.team; // "u21" | "nt"
  const teamType = teamSlug === "nt" ? "NT" : "U21";

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [userTeam, setUserTeam] = useState(null); // U21/NT (iz users.team_type)

  const [rows, setRows] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [q, setQ] = useState("");

  // admin: forma za dodavanje igrača (MVP)
  const [newPlayer, setNewPlayer] = useState({
    ht_player_id: "",
    full_name: "",
    position: "DEF",
    date_of_birth: "",
    team_type: teamType,
    status: "watch",
    notes: "",
  });

  useEffect(() => {
    if (!router.isReady) return;

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
      setUserTeam(urows[0].team_type || null);

      // Ako nije admin i pokušava otvoriti krivi tim → vrati na odabir tima
      if (urows[0].role !== "admin" && urows[0].team_type && urows[0].team_type !== teamType) {
        router.replace("/team");
        return;
      }

      setAccess("ok");
    })();
  }, [router.isReady, teamType]);

  async function fetchPlayers() {
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      .select(
        "id, ht_player_id, full_name, position, team_type, status, notes, last_seen_at, dob, date_of_birth, ht_age_years, ht_age_days"
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
      if (!query) return true;
      return (
        (r.full_name || "").toLowerCase().includes(query) ||
        String(r.ht_player_id || "").includes(query) ||
        (r.position || "").toLowerCase().includes(query) ||
        (r.status || "").toLowerCase().includes(query)
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
      date_of_birth: newPlayer.date_of_birth || null,
      team_type: teamType,
      status: newPlayer.status,
      notes: newPlayer.notes || "",
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
      team_type: teamType,
      status: "watch",
      notes: "",
    });

    fetchPlayers();
  }

  if (access === "denied") {
    return (
      <AppLayout title="Igrači">
        <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ margin: "6px 0 0" }}>Igrači</h1>
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
        <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>Učitavam...</main>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Igrači">
      <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Aktivni tim: <strong>{teamType} Hrvatska</strong>
            </div>
            <h1 style={{ margin: "6px 0 0" }}>Igrači</h1>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              Ulogiran: <strong>{email}</strong> · Uloga: <strong>{role}</strong>
              {userTeam ? (
                <>
                  {" "}
                  · Moj tim: <strong>{userTeam}</strong>
                </>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/team" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
              Odaberi tim
            </Link>
            <Link
              href={`/team/${teamSlug}/dashboard`}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}
            >
              Dashboard
            </Link>
            <Link
              href={`/team/${teamSlug}/alerts`}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}
            >
              Upozorenja
            </Link>
            <button
              onClick={logout}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Odjava
            </button>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: ime, HT ID, pozicija, status..."
            style={{ flex: 1, minWidth: 260, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <button
            onClick={fetchPlayers}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
          >
            Osvježi
          </button>
        </div>

        {/* Admin: dodavanje */}
        {role === "admin" && (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj igrača (MVP) — sprema u: {teamType} Hrvatska</div>
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
                style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
              >
                Dodaj
              </button>
            </form>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Napomena: CHPP sync dolazi nakon licence. Ovo je MVP ručna baza + bilješke.
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
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>HT dob</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
                <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => {
                const b = badgeStyle(r.status);
                const dobVal = r.date_of_birth || r.dob || "";
                const htAge =
                  typeof r.ht_age_years === "number" && typeof r.ht_age_days === "number"
                    ? `${r.ht_age_years}g (${r.ht_age_days}d)`
                    : "—";

                return (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                      {r.full_name}
                      {r.ht_player_id ? <div style={{ fontSize: 12, opacity: 0.7 }}>HT ID: {r.ht_player_id}</div> : null}
                    </td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.position || "—"}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{dobVal || "—"}</td>
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{htAge}</td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "6px 10px",
                          borderRadius: 10,
                          background: b.bg,
                          color: b.fg,
                          fontWeight: 900,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                      <Link href={`/team/${teamSlug}/players/${r.id}`} style={{ textDecoration: "none", fontWeight: 900 }}>
                        Detalji →
                      </Link>
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
      </main>
    </AppLayout>
  );
}
