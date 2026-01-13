import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

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
  const [milestones, setMilestones] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");

  const isAdmin = role === "admin";

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;
      if (!teamType) {
        setAccess("denied");
        return;
      }

      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;

      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

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

      // admin može sve; ostali samo svoj tim
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
      .select("id, full_name, position, team_type, status, date_of_birth, ht_age_years, ht_age_days")
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setPlayers(data);
    setLoadingPlayers(false);
  }

  async function fetchMilestonesForU21() {
    const { data, error } = await supabase
      .from("milestones")
      .select("id, competition_code, label, milestone_date, sort_order")
      .order("competition_code", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) return;

    const rows = data || [];
    setMilestones(rows);

    const uniqueCompetitions = Array.from(
      new Set(rows.map((x) => x.competition_code).filter(Boolean))
    );

    setCompetitions(uniqueCompetitions);

    if (uniqueCompetitions.length > 0) {
      const comp = uniqueCompetitions[0];
      setSelectedCompetition(comp);
      const first = rows.find((m) => m.competition_code === comp);
      if (first) setSelectedMilestoneId(String(first.id));
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

  // MVP U21 logika: cutoff = dob + (21*112+111)
  function isU21OnDate(playerDob, milestoneDate) {
    if (!playerDob || !milestoneDate) return false;
    const dob = new Date(playerDob + "T00:00:00Z");
    const ms = new Date(milestoneDate + "T00:00:00Z");
    const cutoffDays = 21 * 112 + 111;
    const cutoff = new Date(dob.getTime() + cutoffDays * 24 * 60 * 60 * 1000);
    return cutoff >= ms;
  }

  const u21Stats = useMemo(() => {
    if (teamType !== "U21" || !selectedMilestone?.milestone_date) {
      return { ok: 0, out: 0, soon: 0, soonRows: [] };
    }

    const msDate = selectedMilestone.milestone_date;
    const okRows = [];
    const outRows = [];
    const soonRows = [];

    const now = new Date();

    for (const p of players) {
      const ok = isU21OnDate(p.date_of_birth, msDate);
      if (ok) okRows.push(p);
      else outRows.push(p);

      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth + "T00:00:00Z");
        const cutoffDays = 21 * 112 + 111;
        const cutoff = new Date(dob.getTime() + cutoffDays * 24 * 60 * 60 * 1000);
        const diffDays = Math.floor((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 21) soonRows.push(p);
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
      <AppLayout title="Učitavam..." badgeLeft="" badgeRight="">
        <div className="card">Učitavam...</div>
      </AppLayout>
    );
  }

  if (access === "denied") {
    return (
      <AppLayout title="Nemaš pristup" badgeLeft="" badgeRight="">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Nemaš pristup ovom timu.</h3>
          <div style={{ color: "rgba(0,0,0,0.65)", fontWeight: 700 }}>
            Ako nisi admin: možeš ući samo u svoj tim (U21 ili NT).
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/" className="btnLight">← Nazad na naslovnicu</Link>
          </div>
        </div>

        <style jsx>{baseStyles}</style>
      </AppLayout>
    );
  }

  const teamLabel = teamType === "U21" ? "U21 Hrvatska" : "NT Hrvatska";
  const teamSlug = teamType === "U21" ? "u21" : "nt";

  return (
    <AppLayout
      title={`${teamType} Dashboard`}
      subtitle={`Aktivni tim: ${teamLabel}`}
      badgeLeft={teamLabel}
      badgeRight={isAdmin ? "admin" : (role || "")}
    >
      {/* top actions */}
      <div className="topRow">
        <div className="tabs">
          <Link className="tab" href="/">Naslovna</Link>
          <Link className="tab tabActive" href={`/team/${teamSlug}/dashboard`}>Dashboard</Link>
          <Link className="tab" href={`/team/${teamSlug}/players`}>Igrači</Link>
          <Link className="tab" href={`/team/${teamSlug}/alerts`}>Upozorenja</Link>
        </div>

        <button className="btnDark" onClick={logout}>Odjava</button>
      </div>

      <div className="grid2">
        {/* LEFT: U21 ili NT summary */}
        {teamType === "U21" ? (
          <div className="card">
            <div className="cardTitle">U21 ciklus · tko može do odabranog datuma</div>
            <div className="muted">
              Odaberi natjecanje i milestone (datum) – dobit ćeš tko je U21 na taj datum (MVP logika).
            </div>

            <div className="row2">
              <select
                className="input"
                value={selectedCompetition}
                onChange={(e) => {
                  const comp = e.target.value;
                  setSelectedCompetition(comp);
                  const first = (milestones || []).find((m) => m.competition_code === comp);
                  if (first) setSelectedMilestoneId(String(first.id));
                }}
              >
                {competitions.length === 0 ? (
                  <option value="">(nema natjecanja)</option>
                ) : (
                  competitions.map((c) => <option key={c} value={c}>{c}</option>)
                )}
              </select>

              <select
                className="input"
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
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

            <div className="stats3">
              <div className="stat statOk">
                <div className="statLabel">U21 na taj datum</div>
                <div className="statValue">{u21Stats.ok}</div>
              </div>
              <div className="stat statBad">
                <div className="statLabel">Prestar / ispao</div>
                <div className="statValue">{u21Stats.out}</div>
              </div>
              <div className="stat statWarn">
                <div className="statLabel">Izlazi uskoro (3 tjedna)</div>
                <div className="statValue">{u21Stats.soon}</div>
              </div>
            </div>

            <div className="tiny">
              Cutoff datum: <strong>{selectedMilestone?.milestone_date || "-"}</strong> · Pravilo MVP: U21 ako je ≤ 21g 111d na taj datum.
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="cardTitle">NT pregled</div>
            <div className="muted">
              Ovdje su NT widgeti. U21 ciklus se ovdje ne prikazuje.
            </div>

            <div className="stats2">
              <div className="stat statBlue">
                <div className="statLabel">Igrači u bazi</div>
                <div className="statValue">{loadingPlayers ? "…" : players.length}</div>
              </div>

              <div className="stat statGrey">
                <div className="statLabel">Brzi link</div>
                <Link className="link" href={`/team/${teamSlug}/players`}>→ Otvori igrače</Link>
              </div>
            </div>

            <div className="tiny">
              * Kasnije: forma/stamina/trening tracking kroz CHPP + snapshots.
            </div>
          </div>
        )}

        {/* RIGHT: trening alarmi (skeleton) */}
        <div className="card">
          <div className="cardTitle">Trening alarmi (skeleton)</div>
          <div className="muted">
            Ovdje ćemo ubaciti “koliko zaostaje za idealnim treningom” + automatska upozorenja osoblju.
          </div>

          <div className="alerts">
            <div className="pillWarn">⚠️ Igrač X stagnira 2 treninga (placeholder)</div>
            <div className="pillWarn">⚠️ Igrač Y nije na očekivanom treningu (placeholder)</div>
            <div className="pillOk">✅ Sve OK za top core listu (placeholder)</div>
          </div>

          <div className="tiny">
            * Ovo je skeleton dok ne složimo pravu logiku trening formula + snapshots.
          </div>
        </div>
      </div>

      {/* U21: izlaze uskoro */}
      {teamType === "U21" ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="cardTitle">Izlaze uskoro (3 tjedna) · brzi rez</div>

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Igrač</th>
                  <th>Poz</th>
                  <th>DOB</th>
                  <th>HT dob danas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {u21Stats.soonRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      Nema igrača koji izlaze uskoro.
                    </td>
                  </tr>
                ) : (
                  u21Stats.soonRows.map((p) => (
                    <tr key={p.id}>
                      <td className="strong">{p.full_name}</td>
                      <td>{p.position || "-"}</td>
                      <td>{p.date_of_birth || "-"}</td>
                      <td>
                        {p.ht_age_years != null && p.ht_age_days != null
                          ? `${p.ht_age_years}g ${p.ht_age_days}d`
                          : "-"}
                      </td>
                      <td>{p.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="tiny">
            * MVP logika: date_of_birth + (21*112+111). Kasnije ćemo zamijeniti CHPP/HT točnim.
          </div>
        </div>
      ) : null}

      <style jsx>{baseStyles}</style>
    </AppLayout>
  );
}

const baseStyles = `
  .topRow{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
    margin-bottom:14px;
  }
  .tabs{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
  }
  .tab{
    text-decoration:none;
    color:#111;
    font-weight:1000;
    font-size:13px;
    padding:10px 12px;
    border-radius:14px;
    background:rgba(255,255,255,0.78);
    border:1px solid rgba(0,0,0,0.08);
    box-shadow:0 14px 30px rgba(0,0,0,0.06);
  }
  .tabActive{
    background:rgba(17,17,17,0.92);
    color:#fff;
  }
  .btnDark{
    border:none;
    border-radius:14px;
    padding:10px 14px;
    font-weight:1000;
    cursor:pointer;
    background:#111;
    color:#fff;
    box-shadow:0 14px 30px rgba(0,0,0,0.12);
  }
  .btnLight{
    text-decoration:none;
    border-radius:14px;
    padding:10px 14px;
    font-weight:1000;
    background:rgba(0,0,0,0.06);
    border:1px solid rgba(0,0,0,0.12);
    color:#111;
    display:inline-block;
  }
  .grid2{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
  }
  .card{
    background:rgba(255,255,255,0.88);
    border:1px solid rgba(0,0,0,0.08);
    border-radius:20px;
    padding:16px;
    box-shadow:0 18px 45px rgba(0,0,0,0.08);
  }
  .cardTitle{
    font-weight:1000;
    font-size:16px;
    margin:0 0 8px;
    color:#111;
  }
  .muted{
    font-weight:700;
    font-size:13px;
    color:rgba(0,0,0,0.65);
    line-height:1.4;
    margin-bottom:12px;
  }
  .row2{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-bottom:12px;
  }
  .input{
    padding:10px 12px;
    border-radius:14px;
    border:1px solid rgba(0,0,0,0.12);
    background:#fff;
    font-weight:900;
  }
  .stats3{
    display:grid;
    grid-template-columns:1fr 1fr 1fr;
    gap:10px;
    margin-top:4px;
  }
  .stats2{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-top:12px;
  }
  .stat{
    border-radius:16px;
    border:1px solid rgba(0,0,0,0.08);
    padding:12px;
  }
  .statLabel{
    font-weight:900;
    font-size:12px;
    color:rgba(0,0,0,0.65);
    margin-bottom:6px;
  }
  .statValue{
    font-weight:1000;
    font-size:28px;
    color:#111;
    letter-spacing:-0.2px;
  }
  .statOk{ background:#dcfce7; }
  .statBad{ background:#ffe4e6; }
  .statWarn{ background:#fef3c7; }
  .statBlue{ background:#e0f2fe; }
  .statGrey{ background:#f3f4f6; }
  .tiny{
    margin-top:10px;
    font-weight:700;
    font-size:12px;
    color:rgba(0,0,0,0.6);
  }
  .alerts{
    display:grid;
    gap:10px;
    margin-top:10px;
  }
  .pillWarn{
    padding:12px 12px;
    border-radius:16px;
    border:1px solid rgba(0,0,0,0.08);
    background:#fff7ed;
    font-weight:900;
  }
  .pillOk{
    padding:12px 12px;
    border-radius:16px;
    border:1px solid rgba(0,0,0,0.08);
    background:#ecfdf5;
    font-weight:900;
  }
  .link{
    font-weight:1000;
    color:#111;
    text-decoration:none;
  }
  .tableWrap{
    overflow-x:auto;
    margin-top:10px;
  }
  .table{
    width:100%;
    border-collapse:collapse;
    font-size:13px;
  }
  th{
    text-align:left;
    padding:10px;
    border-bottom:1px solid rgba(0,0,0,0.10);
    color:rgba(0,0,0,0.65);
    font-weight:1000;
    font-size:12px;
  }
  td{
    padding:10px;
    border-bottom:1px solid rgba(0,0,0,0.06);
    color:#111;
    font-weight:700;
  }
  .strong{ font-weight:1000; }
  .empty{
    padding:12px;
    color:rgba(0,0,0,0.65);
    font-weight:800;
  }

  @media (max-width: 900px){
    .grid2{ grid-template-columns:1fr; }
    .stats3{ grid-template-columns:1fr; }
    .row2{ grid-template-columns:1fr; }
  }
`;
