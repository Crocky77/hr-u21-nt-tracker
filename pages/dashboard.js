import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

// --- HT AGE HELPERS (MVP: 112 dana = 1 HT godina) ---
const HT_YEAR_DAYS = 112;
const U21_MAX_YEARS = 21;
const U21_MAX_DAYS = 111;

function daysBetween(dateA, dateB) {
  // dateA/dateB: Date
  const a = new Date(Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate()));
  const b = new Date(Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate()));
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function htAgeFromDob(dobStr, atDateStr) {
  // dobStr: "YYYY-MM-DD", atDateStr: "YYYY-MM-DD"
  if (!dobStr || !atDateStr) return { years: null, days: null };

  const dob = new Date(dobStr + "T00:00:00Z");
  const at = new Date(atDateStr + "T00:00:00Z");
  const d = daysBetween(at, dob);

  if (d < 0) return { years: 0, days: 0 };

  const years = Math.floor(d / HT_YEAR_DAYS);
  const days = d % HT_YEAR_DAYS;
  return { years, days };
}

function isU21EligibleAt(dobStr, cutoffDateStr) {
  const a = htAgeFromDob(dobStr, cutoffDateStr);
  if (a.years === null) return false;
  if (a.years < U21_MAX_YEARS) return true;
  if (a.years > U21_MAX_YEARS) return false;
  return a.days <= U21_MAX_DAYS;
}

function formatHtAge(age) {
  if (!age || age.years === null) return "—";
  return `${age.years}g ${age.days}d`;
}

// --- STAFF (za sada hardcode; kasnije povlačimo preko CHPP) ---
const STAFF = {
  U21: { coach: "matej1603", assistant: "Zvonzi_" },
  NT: { coach: "Zagi_", assistant: "Nosonja" }
};

export default function Dashboard() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [userTeam, setUserTeam] = useState(null); // U21 | NT

  const [activeTeam, setActiveTeam] = useState(null); // U21 | NT
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(true);

  const [competition, setCompetition] = useState("U21WC40");
  const [milestoneId, setMilestoneId] = useState(null);

  // 1) Auth + user role/team
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

      setRole(urows[0].role);
      setUserTeam(urows[0].team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  // 2) Active team (admin može override preko ?team=U21/NT, ostali ne)
  useEffect(() => {
    if (access !== "ok" || !userTeam) return;

    const params = new URLSearchParams(window.location.search);
    const qpTeam = params.get("team");
    if (role === "admin" && (qpTeam === "U21" || qpTeam === "NT")) {
      setActiveTeam(qpTeam);
    } else {
      setActiveTeam(userTeam);
    }
  }, [access, userTeam, role]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function fetchPlayers(teamType) {
    setLoadingPlayers(true);
    const { data, error } = await supabase
      .from("players")
      .select("id, full_name, position, team_type, date_of_birth, status, notes, ht_player_id")
      .eq("team_type", teamType)
      .order("id", { ascending: false });

    if (!error && data) setPlayers(data);
    setLoadingPlayers(false);
  }

  async function fetchMilestones(teamType) {
    setLoadingMilestones(true);
    const { data, error } = await supabase
      .from("milestones")
      .select("id, team_type, competition, title, match_date, match_code")
      .eq("team_type", teamType)
      .order("match_date", { ascending: true });

    if (!error && data) setMilestones(data);
    setLoadingMilestones(false);
  }

  // učitaj sve kad znamo activeTeam
  useEffect(() => {
    if (!activeTeam) return;
    fetchPlayers(activeTeam);
    fetchMilestones(activeTeam);
  }, [activeTeam]);

  // dostupne competition vrijednosti iz milestones
  const competitions = useMemo(() => {
    const set = new Set(milestones.map((m) => m.competition));
    return Array.from(set);
  }, [milestones]);

  // milestones za aktivni competition
  const milestoneOptions = useMemo(() => {
    return milestones.filter((m) => m.competition === competition);
  }, [milestones, competition]);

  // default milestone (zadnji datum = “final” logika) kad se promijeni competition
  useEffect(() => {
    if (milestoneOptions.length === 0) {
      setMilestoneId(null);
      return;
    }
    // default: zadnji milestone po datumu
    const last = milestoneOptions[milestoneOptions.length - 1];
    setMilestoneId(last.id);
  }, [competition, milestoneOptions.length]);

  const selectedMilestone = useMemo(() => {
    return milestoneOptions.find((m) => m.id === milestoneId) || null;
  }, [milestoneOptions, milestoneId]);

  const todayIso = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // --- U21 dashboard izračuni ---
  const u21Stats = useMemo(() => {
    if (activeTeam !== "U21") return null;

    const cutoff = selectedMilestone?.match_date || null;
    if (!cutoff) {
      return {
        cutoff: null,
        eligible: [],
        over: [],
        soonOut: []
      };
    }

    const eligible = [];
    const over = [];
    const soonOut = [];

    // “uskoro ispada”: postaje NE-eligible u idućih 21 dana (3 tjedna)
    const soonWindowDays = 21;
    const soonDate = (() => {
      const d = new Date(todayIso + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + soonWindowDays);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    })();

    for (const p of players) {
      const dob = p.date_of_birth;
      if (!dob) continue;

      const eligAtCutoff = isU21EligibleAt(dob, cutoff);
      if (eligAtCutoff) eligible.push(p);
      else over.push(p);

      const eligToday = isU21EligibleAt(dob, todayIso);
      const eligSoon = isU21EligibleAt(dob, soonDate);

      // bio je U21 danas, ali neće biti kroz 21 dan -> “izlazi uskoro”
      if (eligToday && !eligSoon) {
        soonOut.push(p);
      }
    }

    return { cutoff, eligible, over, soonOut };
  }, [activeTeam, players, selectedMilestone, todayIso]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Dashboard</h1>
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

  const staff = STAFF[activeTeam] || { coach: "—", assistant: "—" };

  return (
    <AppLayout
      title={`${activeTeam} Dashboard`}
      subtitle={`Aktivni tim: ${activeTeam} Hrvatska · Izbornik: ${staff.coach} · Pomoćnik: ${staff.assistant}`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}${role === "admin" ? " (admin)" : ""}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/players" style={btnGhost}>Igrači</Link>
          <button onClick={() => fetchPlayers(activeTeam)} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      {/* U21 SPECIFIČNO */}
      {activeTeam === "U21" ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginTop: 14 }}>
            {/* U21 ciklus widget */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>U21 ciklus · tko može do odabranog datuma</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                    Odaberi natjecanje i “milestone” (datum) – i dobit ćeš tko je U21 na taj datum (MVP logika).
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select value={competition} onChange={(e) => setCompetition(e.target.value)} style={selectStyle}>
                    {competitions.length === 0 ? <option value="U21WC40">U21WC40</option> : null}
                    {competitions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={milestoneId || ""}
                    onChange={(e) => setMilestoneId(Number(e.target.value))}
                    style={selectStyle}
                    disabled={milestoneOptions.length === 0}
                  >
                    {milestoneOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.match_date} · {m.match_code || ""} {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
                <div style={{ ...miniCard, background: "#dcfce7" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>U21 na taj datum</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>
                    {u21Stats ? u21Stats.eligible.length : "—"}
                  </div>
                </div>

                <div style={{ ...miniCard, background: "#fee2e2" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Prestar / ispao</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>
                    {u21Stats ? u21Stats.over.length : "—"}
                  </div>
                </div>

                <div style={{ ...miniCard, background: "#ffedd5" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Izlazi uskoro (3 tjedna)</div>
                  <div style={{ fontSize: 34, fontWeight: 900 }}>
                    {u21Stats ? u21Stats.soonOut.length : "—"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                Cutoff datum: <strong>{u21Stats?.cutoff || "—"}</strong> · Pravilo MVP: U21 ako je ≤ <strong>21g 111d</strong> na taj datum.
              </div>
            </div>

            {/* Kritična upozorenja (placeholder skeleton) */}
            <div style={card}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Trening alarmi (skeleton)</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Ovdje ćemo kasnije ubaciti “koliko zaostaje za idealnim treningom” + upozorenja osoblju.
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <div style={alertBox}>⚠️ Placeholder: “Igrač X stagnira 2 treninga”</div>
                <div style={alertBox}>⚠️ Placeholder: “Igrač Y nije na očekivanom treningu”</div>
                <div style={alertBox}>✅ Placeholder: “Sve OK za top core listu”</div>
              </div>
            </div>
          </div>

          {/* Brzi popis “izlaze uskoro” */}
          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Izlaze uskoro (3 tjedna) · brzi rez</div>
            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                    <th style={th}>Igrač</th>
                    <th style={th}>Poz</th>
                    <th style={th}>DOB</th>
                    <th style={th}>HT dob danas</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!u21Stats || u21Stats.soonOut.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>Nema igrača koji izlaze uskoro.</td></tr>
                  ) : (
                    u21Stats.soonOut.slice(0, 12).map((p) => {
                      const ageNow = htAgeFromDob(p.date_of_birth, todayIso);
                      return (
                        <tr key={p.id}>
                          <td style={tdStrong}>{p.full_name}</td>
                          <td style={td}>{p.position || "—"}</td>
                          <td style={td}>{p.date_of_birth}</td>
                          <td style={td}>{formatHtAge(ageNow)}</td>
                          <td style={td}>{p.status || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              * Ovo je MVP logika na osnovi date_of_birth + “112 dana = 1 HT godina”.
            </div>
          </div>
        </>
      ) : (
        /* NT SPECIFIČNO */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div style={card}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>NT Dashboard (skeleton)</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Ovdje idu NT widgeti: forma, stamina, upozorenja, trening status, ključni igrači, itd.
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <div style={alertBox}>✅ Placeholder: “Top forma (NT)”</div>
                <div style={alertBox}>⚠️ Placeholder: “Upozorenja (NT)”</div>
              </div>
            </div>

            <div style={card}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Trening alarmi (skeleton)</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Isti engine kao U21, ali druga pravila / pragovi.
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <div style={alertBox}>⚠️ Placeholder: “Igrač X van treninga”</div>
              </div>
            </div>
          </div>

          <div style={{ ...card, marginTop: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Brzi rez (NT igrači)</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
              Učitano: {loadingPlayers ? "…" : players.length} igrača.
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href="/players" style={{ ...btnGhost, display: "inline-flex" }}>Idi na listu igrača →</Link>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

// --- styles ---
const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
};

const miniCard = {
  borderRadius: 14,
  padding: 12,
  border: "1px solid rgba(0,0,0,0.06)"
};

const alertBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 10,
  background: "#f9fafb",
  fontSize: 13
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  textDecoration: "none",
  fontWeight: 900,
  color: "#111"
};

const btnBlack = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer"
};

const selectStyle = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  fontWeight: 700,
  minWidth: 220
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };
