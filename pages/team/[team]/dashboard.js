import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

// team param očekujemo: "u21" ili "nt"
function normalizeTeam(team) {
  const t = String(team || "").toLowerCase();
  if (t === "u21") return "U21";
  if (t === "nt") return "NT";
  return null;
}

export default function TeamDashboard() {
  const router = useRouter();
  const teamType = normalizeTeam(router.query.team);

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [userTeamType, setUserTeamType] = useState(null);

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // U21 ciklus
  const [competitions, setCompetitions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");

  // helper: je li korisnik admin
  const isAdmin = role === "admin";

  useEffect(() => {
    (async () => {
      // čekamo router param
      if (!router.isReady) return;

      // ako team param nije dobar, vrati na naslovnicu
      if (!teamType) {
        setAccess("denied");
        return;
      }

      // auth user
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        setAccess("denied");
        return;
      }

      setEmail(userEmail);

      // user record (role + team_type)
      const { data: urows, error: uerr } = await supabase
        .from("users")
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (uerr || !urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      const u = urows[0];
      setRole(u.role);
      setUserTeamType(u.team_type);

      // pristup: admin može sve; ostali samo svoj tim
      if (u.role !== "admin" && u.team_type !== teamType) {
        setAccess("denied");
        return;
      }

      setAccess("ok");
    })();
  }, [router.isReady, router.query.team]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPlayers() {
    if (!teamType) return;
    setLoadingPlayers(true);

    const { data, error } = await supabase
      .from("players")
      .select(
        "id, full_name, position, team_type, status, date_of_birth, ht_age_years, ht_age_days"
      )
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setPlayers(data);
    setLoadingPlayers(false);
  }

  async function fetchMilestonesForU21() {
    // ovo je samo za U21, NT nema
    const { data, error } = await supabase
      .from("milestones")
      .select("id, competition_code, label, milestone_date, sort_order")
      .order("competition_code", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) return;

    setMilestones(data || []);

    // složi competitions listu
    const uniqueCompetitions = Array.from(
      new Set((data || []).map((x) => x.competition_code).filter(Boolean))
    );

    setCompetitions(uniqueCompetitions);

    // default selections
    if (uniqueCompetitions.length > 0) {
      const comp = uniqueCompetitions[0];
      setSelectedCompetition(comp);

      const firstMilestone = (data || []).find((m) => m.competition_code === comp);
      if (firstMilestone) setSelectedMilestoneId(String(firstMilestone.id));
    }
  }

  useEffect(() => {
    if (access === "ok") {
      fetchPlayers();
      if (teamType === "U21") fetchMilestonesForU21();
    }
  }, [access, teamType]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMilestones = useMemo(() => {
    return (milestones || []).filter((m) => m.competition_code === selectedCompetition);
  }, [milestones, selectedCompetition]);

  const selectedMilestone = useMemo(() => {
    return (milestones || []).find((m) => String(m.id) === String(selectedMilestoneId)) || null;
  }, [milestones, selectedMilestoneId]);

  // MVP U21 logika: cutoff = milestone_date - (21*112 + 111) dana
  // (ovo prati tvoju trenutnu MVP logiku)
  function isU21OnDate(playerDob, milestoneDate) {
    if (!playerDob || !milestoneDate) return false;
    const dob = new Date(playerDob + "T00:00:00Z");
    const ms = new Date(milestoneDate + "T00:00:00Z");
    const cutoffDays = 21 * 112 + 111;
    const cutoff = new Date(dob.getTime() + cutoffDays * 24 * 60 * 60 * 1000);
    return cutoff >= ms; // ako je cutoff nakon milestonea => još je U21
  }

  const u21Stats = useMemo(() => {
    if (teamType !== "U21" || !selectedMilestone?.milestone_date) {
      return { ok: 0, out: 0, soon: 0, soonRows: [] };
    }

    const msDate = selectedMilestone.milestone_date;

    const okRows = [];
    const outRows = [];
    const soonRows = [];

    for (const p of players) {
      const isOk = isU21OnDate(p.date_of_birth, msDate);
      if (isOk) okRows.push(p);
      else outRows.push(p);

      // "izlazi uskoro" = u iduća ~3 tjedna (21 dan) od danas (MVP)
      // koristimo ht dob danas ako postoji, ali MVP fallback na dob
      // Najjednostavnije: izračunaj cutoff datum i vidi je li unutar 21 dana
      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth + "T00:00:00Z");
        const cutoffDays = 21 * 112 + 111;
        const cutoff = new Date(dob.getTime() + cutoffDays * 24 * 60 * 60 * 1000);

        const now = new Date();
        const diffDays = Math.floor((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 21) {
          soonRows.push(p);
        }
      }
    }

    return { ok: okRows.length, out: outRows.length, soon: soonRows.length, soonRows };
  }, [teamType, players, selectedMilestone]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (access === "loading") {
    return (
      <AppLayout title="Učitavam...">
        <div style={{ padding: 20 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  if (access === "denied") {
    return (
      <AppLayout title="Nemaš pristup">
        <div style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Nemaš pristup.</h2>
          <p>
            Ako si već prijavljen, moguće je da pokušavaš ući u tim koji nije tvoj (U21/NT).
          </p>
          <Link href="/" style={{ fontWeight: 900 }}>
            ← Nazad na naslovnicu
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${teamType} Dashboard`}
      subtitle={`Aktivni tim: ${teamType} Hrvatska`}
      badgeLeft={teamType}
      badgeRight={isAdmin ? "admin" : (role || "user")}
    >
      {/* top bar */}
      <div style={{ display: "flex (wrap)", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <Link href="/" style={btnStyle(false)}>Naslovna</Link>
        <Link href={`/team/${teamType === "U21" ? "u21" : "nt"}/dashboard`} style={btnStyle(true)}>Dashboard</Link>
        <Link href={`/team/${teamType === "U21" ? "u21" : "nt"}/players`} style={btnStyle(false)}>Igrači</Link>
        <Link href={`/team/${teamType === "U21" ? "u21" : "nt"}/alerts`} style={btnStyle(false)}>Upozorenja</Link>
        <Link href="/about" style={btnStyle(false)}>O alatu</Link>
        <Link href="/help" style={btnStyle(false)}>Pomoć</Link>
        <Link href="/donate" style={btnStyle(false)}>Donacije</Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Dobrodošli, <strong>{email}</strong>
          </div>
          <button onClick={logout} style={btnDanger()}>
            Odjava
          </button>
        </div>
      </div>

      {/* glavni content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* U21 ciklus - samo U21 */}
        {teamType === "U21" ? (
          <div style={card()}>
            <h3 style={{ marginTop: 0 }}>U21 ciklus · tko može do odabranog datuma</h3>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
              Odaberi natjecanje i milestone (datum) – dobit ćeš tko je U21 na taj datum (MVP logika).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select
                value={selectedCompetition}
                onChange={(e) => {
                  const comp = e.target.value;
                  setSelectedCompetition(comp);
                  const first = (milestones || []).find((m) => m.competition_code === comp);
                  if (first) setSelectedMilestoneId(String(first.id));
                }}
                style={inputStyle()}
              >
                {competitions.length === 0 ? (
                  <option value="">(nema natjecanja)</option>
                ) : (
                  competitions.map((c) => <option key={c} value={c}>{c}</option>)
                )}
              </select>

              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                style={inputStyle()}
              >
                {filteredMilestones.length === 0 ? (
                  <option value="">(nema milestone-a)</option>
                ) : (
                  filteredMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.milestone_date} · {m.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ ...miniCard(), background: "#dcfce7" }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>U21 na taj datum</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{u21Stats.ok}</div>
              </div>
              <div style={{ ...miniCard(), background: "#ffe4e6" }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Prestar / ispao</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{u21Stats.out}</div>
              </div>
              <div style={{ ...miniCard(), background: "#fef3c7" }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Izlazi uskoro (3 tjedna)</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{u21Stats.soon}</div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
              Cutoff datum: {selectedMilestone?.milestone_date || "-"} · Pravilo MVP: U21 ako je ≤ 21g 111d na taj datum.
            </div>
          </div>
        ) : (
          <div style={card()}>
            <h3 style={{ marginTop: 0 }}>NT Dashboard</h3>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Ovo je NT panel. U21 ciklus se ovdje NE prikazuje (po tvojoj logici).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ ...miniCard(), background: "#e0f2fe" }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Igrači u bazi</div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{players.length}</div>
              </div>
              <div style={{ ...miniCard(), background: "#f3f4f6" }}>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Upozorenja</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Idi na “Upozorenja” →</div>
              </div>
            </div>
          </div>
        )}

        {/* trening alarmi placeholder */}
        <div style={card()}>
          <h3 style={{ marginTop: 0 }}>Trening alarmi (skeleton)</h3>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
            Ovdje ćemo ubaciti “koliko zaostaje za idealnim treningom” + upozorenja osoblju.
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={alertPill("#fff7ed")}>⚠️ Placeholder: “Igrač X stagnira 2 treninga”</div>
            <div style={alertPill("#fff7ed")}>⚠️ Placeholder: “Igrač Y nije na očekivanom treningu”</div>
            <div style={alertPill("#ecfdf5")}>✅ Placeholder: “Sve OK za top core listu”</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * Ovo je skeleton dok ne složimo pravu logiku trening formula + snapshots.
          </div>
        </div>
      </div>

      {/* izlaze uskoro tablica - samo U21 */}
      {teamType === "U21" ? (
        <div style={{ ...card(), marginTop: 14 }}>
          <h3 style={{ marginTop: 0 }}>Izlaze uskoro (3 tjedna) · brzi rez</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                  <th style={th()}>Igrač</th>
                  <th style={th()}>Poz</th>
                  <th style={th()}>DOB</th>
                  <th style={th()}>HT dob danas</th>
                  <th style={th()}>Status</th>
                </tr>
              </thead>
              <tbody>
                {u21Stats.soonRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 12, opacity: 0.75 }}>
                      Nema igrača koji izlaze uskoro.
                    </td>
                  </tr>
                ) : (
                  u21Stats.soonRows.map((p) => (
                    <tr key={p.id}>
                      <td style={tdStrong()}>{p.full_name}</td>
                      <td style={td()}>{p.position || "-"}</td>
                      <td style={td()}>{p.date_of_birth || "-"}</td>
                      <td style={td()}>
                        {p.ht_age_years != null && p.ht_age_days != null
                          ? `${p.ht_age_years}g ${p.ht_age_days}d`
                          : "-"}
                      </td>
                      <td style={td()}>{p.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * MVP logika: date_of_birth + (21*112+111) dana. Kasnije ćemo zamijeniti CHPP/HT točnim.
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Debug info: team={teamType} · userTeam={userTeamType || "-"} · role={role || "-"} · players={loadingPlayers ? "loading" : players.length}
      </div>
    </AppLayout>
  );
}

/* ---- styles ---- */

function card() {
  return {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 14
  };
}

function miniCard() {
  return {
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(0,0,0,0.08)"
  };
}

function inputStyle() {
  return {
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    fontWeight: 800
  };
}

function btnStyle(active) {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.25)",
    background: active ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.12)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900
  };
}

function btnDanger() {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer"
  };
}

function alertPill(bg) {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    background: bg,
    border: "1px solid rgba(0,0,0,0.08)",
    fontWeight: 800
  };
}

function th() {
  return { padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.1)" };
}
function td() {
  return { padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" };
}
function tdStrong() {
  return { ...td(), fontWeight: 900 };
}
