import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../../components/AppLayout";
import { supabase } from "../../../../utils/supabaseClient";

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isoToDate(iso) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return null;
  return d;
}

// MVP U21 cutoff: 21*112 + 111 = 2463 "HT dana" kao aproksimacija u realnim danima
const U21_CUTOFF_DAYS = 21 * 112 + 111; // 2463

function u21Eligibility(dobIso, targetIso) {
  const dob = isoToDate(dobIso);
  const target = isoToDate(targetIso);
  if (!dob || !target) return null;

  const cutoff = addDays(dob, U21_CUTOFF_DAYS);
  const eligible = cutoff.getTime() >= target.getTime();
  const diffDays = Math.ceil((cutoff.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  return { eligible, diffDays, cutoff };
}

function severityBadge(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "high" || s === "critical") return { bg: "#fee2e2", fg: "#991b1b", label: sev };
  if (s === "medium") return { bg: "#fff7ed", fg: "#9a3412", label: sev };
  if (s === "low") return { bg: "#e0f2fe", fg: "#075985", label: sev };
  return { bg: "#f3f4f6", fg: "#111827", label: sev || "info" };
}

export default function PlayerDetails() {
  const router = useRouter();
  const teamSlug = router.query.team; // u21 | nt
  const playerId = router.query.id;

  const teamType = teamSlug === "nt" ? "NT" : "U21";

  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [userTeam, setUserTeam] = useState(null);

  const [player, setPlayer] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  // admin quick edit
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editHtId, setEditHtId] = useState("");

  // Milestones (samo U21)
  const [competitions, setCompetitions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedComp, setSelectedComp] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const selectedMilestone = useMemo(
    () => milestones.find((m) => String(m.id) === String(selectedMilestoneId)) || null,
    [milestones, selectedMilestoneId]
  );

  // Alerts (za tog igrača)
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

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

      if (urows[0].role !== "admin" && urows[0].team_type && urows[0].team_type !== teamType) {
        router.replace("/team");
        return;
      }

      setAccess("ok");
    })();
  }, [router.isReady, teamType]);

  async function fetchPlayer() {
    if (!playerId) return;
    setLoadingPlayer(true);

    const { data, error } = await supabase
      .from("players")
      .select(
        "id, ht_player_id, full_name, position, team_type, status, notes, last_seen_at, dob, date_of_birth, ht_age_years, ht_age_days"
      )
      .eq("id", playerId)
      .limit(1);

    if (error) {
      alert("Greška: " + error.message);
      setPlayer(null);
      setLoadingPlayer(false);
      return;
    }

    const row = data && data.length ? data[0] : null;

    if (row && role !== "admin" && row.team_type && row.team_type !== teamType) {
      router.replace("/team");
      return;
    }

    setPlayer(row);

    setEditStatus(row?.status || "watch");
    setEditNotes(row?.notes || "");
    setEditDob(row?.date_of_birth || row?.dob || "");
    setEditHtId(row?.ht_player_id ? String(row.ht_player_id) : "");

    setLoadingPlayer(false);
  }

  async function fetchAlerts() {
    if (!playerId) return;
    setLoadingAlerts(true);

    const { data, error } = await supabase
      .from("training_alerts")
      .select("id, team_type, player_id, alert_type, severity, message, due_date, resolved, created_by_email, created_at")
      .eq("player_id", Number(playerId))
      .eq("team_type", teamType)
      .order("resolved", { ascending: true })
      .order("due_date", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) setAlerts(data);
    setLoadingAlerts(false);
  }

  async function fetchCompetitionsAndMilestones() {
    if (teamType !== "U21") return;

    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("team_type", "U21")
      .order("milestone_date", { ascending: true });

    if (error) {
      setCompetitions([]);
      setMilestones([]);
      return;
    }

    const rows = data || [];

    const compMap = new Map();
    rows.forEach((r) => {
      const code = r.competition_code || r.competition || r.code || "U21";
      const name = r.competition_name || r.competition_title || code;
      if (!compMap.has(code)) compMap.set(code, { code, name });
    });

    const comps = Array.from(compMap.values());
    setCompetitions(comps);

    const defaultComp = comps.length ? comps[0].code : "";
    const useComp = selectedComp || defaultComp;

    if (!selectedComp && defaultComp) setSelectedComp(defaultComp);

    const ms = rows.filter((r) => {
      const code = r.competition_code || r.competition || r.code || "U21";
      return String(code) === String(useComp);
    });

    setMilestones(ms);

    if (!selectedMilestoneId && ms.length) setSelectedMilestoneId(String(ms[0].id));
  }

  useEffect(() => {
    if (access === "ok") {
      fetchPlayer();
      fetchAlerts();
      if (teamType === "U21") fetchCompetitionsAndMilestones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, playerId, teamType]);

  useEffect(() => {
    if (teamType !== "U21") return;
    if (!competitions.length) return;
    fetchCompetitionsAndMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComp]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function saveAdminEdits() {
    if (role !== "admin" || !player) return;

    const payload = {
      status: editStatus,
      notes: editNotes || "",
      ht_player_id: editHtId ? Number(editHtId) : null,
      date_of_birth: editDob || null,
    };

    const { error } = await supabase.from("players").update(payload).eq("id", player.id);
    if (error) {
      alert("Greška kod spremanja: " + error.message);
      return;
    }
    await fetchPlayer();
    await fetchAlerts();
    alert("Spremljeno ✅");
  }

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const dobIso = player?.date_of_birth || player?.dob || "";
  const eligToday = useMemo(() => u21Eligibility(dobIso, todayIso), [dobIso, todayIso]);

  const milestoneDateIso = useMemo(() => {
    if (!selectedMilestone) return "";
    return selectedMilestone.milestone_date || selectedMilestone.date || "";
  }, [selectedMilestone]);

  const eligMilestone = useMemo(() => {
    if (teamType !== "U21") return null;
    if (!milestoneDateIso) return null;
    return u21Eligibility(dobIso, milestoneDateIso);
  }, [teamType, dobIso, milestoneDateIso]);

  if (access === "denied") {
    return (
      <AppLayout title="Detalji igrača">
        <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
          <h1>Detalji igrača</h1>
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
      <AppLayout title="Detalji igrača">
        <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>Učitavam...</main>
      </AppLayout>
    );
  }

  const htAge =
    player && typeof player.ht_age_years === "number" && typeof player.ht_age_days === "number"
      ? `${player.ht_age_years}g (${player.ht_age_days}d)`
      : "—";

  return (
    <AppLayout title="Detalji igrača">
      <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Aktivni tim: <strong>{teamType} Hrvatska</strong>
            </div>
            <h1 style={{ margin: "6px 0 0" }}>Detalji igrača</h1>
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
            <Link
              href={`/team/${teamSlug}/players`}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}
            >
              ← Povratak na popis
            </Link>
            <button
              onClick={fetchPlayer}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Osvježi
            </button>
            <button
              onClick={logout}
              style={{ padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Odjava
            </button>
          </div>
        </div>

        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff", padding: 16 }}>
          {loadingPlayer ? (
            <div>Učitavam igrača...</div>
          ) : !player ? (
            <div>Nema igrača s tim ID-om.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{player.full_name}</div>
                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    Team: <strong>{player.team_type || teamType}</strong> · Pozicija: <strong>{player.position || "—"}</strong> · Status:{" "}
                    <strong>{player.status || "—"}</strong>
                  </div>
                </div>

                <div style={{ minWidth: 280 }}>
                  <div style={{ opacity: 0.85 }}>
                    HT ID: <strong>{player.ht_player_id || "—"}</strong>
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    DOB: <strong>{dobIso || "—"}</strong>
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    HT dob danas: <strong>{htAge}</strong>
                  </div>
                </div>
              </div>

              {teamType === "U21" ? (
                <div style={{ marginTop: 14, borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>U21 status</div>

                  {!dobIso ? (
                    <div style={{ opacity: 0.75 }}>Nema DOB → ne mogu izračunati U21 status.</div>
                  ) : (
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 260, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#f8fafc" }}>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>Danas ({todayIso})</div>
                        <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900 }}>
                          {eligToday?.eligible ? "✅ U21 (može danas)" : "❌ Prestar (danas)"}
                        </div>
                        <div style={{ marginTop: 6, opacity: 0.85 }}>
                          {eligToday?.eligible
                            ? `Izlazi za ~${eligToday.diffDays} dana (MVP aproks.)`
                            : `Izašao je prije ~${Math.abs(eligToday?.diffDays || 0)} dana (MVP aproks.)`}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 320, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>U21 milestone (MVP)</div>

                        {competitions.length === 0 ? (
                          <div style={{ opacity: 0.75 }}>Nema milestone podataka (ili milestones tablica nije popunjena).</div>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <select
                                value={selectedComp}
                                onChange={(e) => {
                                  setSelectedComp(e.target.value);
                                  setSelectedMilestoneId("");
                                }}
                                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 220 }}
                              >
                                {competitions.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.code} — {c.name}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={selectedMilestoneId}
                                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                                style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", minWidth: 240 }}
                              >
                                {milestones.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {(m.milestone_date || m.date || "????-??-??") +
                                      " — " +
                                      (m.milestone_label || m.label || m.milestone_key || "milestone")}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "#f8fafc", border: "1px solid #e5e7eb" }}>
                              {!selectedMilestone || !milestoneDateIso ? (
                                <div style={{ opacity: 0.75 }}>Odaberi milestone.</div>
                              ) : !eligMilestone ? (
                                <div style={{ opacity: 0.75 }}>Ne mogu izračunati (fali DOB ili datum milestone-a).</div>
                              ) : (
                                <>
                                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                                    Milestone datum: <strong>{milestoneDateIso}</strong>
                                  </div>
                                  <div style={{ marginTop: 6, fontWeight: 900, fontSize: 16 }}>
                                    {eligMilestone.eligible ? "✅ U21 na taj datum" : "❌ Prestar na taj datum"}
                                  </div>
                                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                                    {eligMilestone.eligible
                                      ? `Rezerva do cutoff-a: ~${eligMilestone.diffDays} dana`
                                      : `Prešao cutoff prije ~${Math.abs(eligMilestone.diffDays)} dana`}
                                  </div>
                                </>
                              )}
                            </div>

                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                              * Ovo je MVP aproksimacija (112 dana = 1 HT godina). CHPP/HT točno kasnije.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div style={{ marginTop: 14, borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontWeight: 900 }}>Upozorenja za ovog igrača</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Link href={`/team/${teamSlug}/alerts`} style={{ textDecoration: "none", fontWeight: 900 }}>
                      → Otvori sva upozorenja
                    </Link>
                    <button
                      onClick={fetchAlerts}
                      style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
                    >
                      Osvježi
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  {loadingAlerts ? (
                    <div>Učitavam upozorenja...</div>
                  ) : alerts.length === 0 ? (
                    <div style={{ opacity: 0.75 }}>Nema upozorenja za ovog igrača.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {alerts.slice(0, 12).map((a) => {
                        const b = severityBadge(a.severity);
                        return (
                          <div
                            key={a.id}
                            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: a.resolved ? "#f8fafc" : "#fff" }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 900 }}>
                                {a.alert_type || "alert"} {a.resolved ? "(riješeno)" : ""}
                              </div>
                              <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 10, background: b.bg, color: b.fg, fontWeight: 900 }}>
                                {b.label}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, opacity: 0.9 }}>{a.message}</div>
                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                              Due: <strong>{a.due_date || "—"}</strong> · Kreirao: <strong>{a.created_by_email || "—"}</strong>
                            </div>
                          </div>
                        );
                      })}
                      {alerts.length > 12 ? (
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          Prikazano prvih 12. Za sve → <Link href={`/team/${teamSlug}/alerts`}>Upozorenja</Link>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {role === "admin" ? (
                <div style={{ marginTop: 14, borderTop: "1px solid #f3f4f6", paddingTop: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 10 }}>Admin: brzo uređivanje</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>Status</div>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                      >
                        <option value="core">core</option>
                        <option value="rotation">rotation</option>
                        <option value="watch">watch</option>
                        <option value="risk">risk</option>
                      </select>
                    </div>

                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>HT ID</div>
                      <input
                        value={editHtId}
                        onChange={(e) => setEditHtId(e.target.value)}
                        placeholder="npr 123456"
                        style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                      />
                    </div>

                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>DOB</div>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                      />
                    </div>

                    <div style={{ gridColumn: "span 3", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>Bilješke</div>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Bilješke..."
                        style={{
                          width: "100%",
                          marginTop: 8,
                          minHeight: 90,
                          padding: 10,
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                          fontFamily: "Arial, sans-serif",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <button
                          onClick={saveAdminEdits}
                          style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
                        >
                          Spremi
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    (V1) Admin uređuje osnovne podatke + bilješke. Kasnije: bilješke po skautu + CHPP snapshotovi.
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
                  (V1) U ovoj fazi uređivanje radi samo admin. Kasnije dodajemo bilješke po skautu.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
