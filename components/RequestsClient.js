import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * Supabase import – kompatibilno s više varijanti exporta:
 * - export default supabase
 * - export const supabase
 * - export const supabaseClient
 */
import * as supabaseModule from "../utils/supabaseClient";
const supabase =
  supabaseModule?.default ||
  supabaseModule?.supabase ||
  supabaseModule?.supabaseClient;

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function teamTypeFromSlug(team) {
  if (team === "u21") return "U21";
  if (team === "nt") return "NT";
  return null;
}

export default function RequestsClient({ team }) {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [role, setRole] = useState(null);

  const [teamId, setTeamId] = useState(null);
  const [teamIdLoading, setTeamIdLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [ageMinYears, setAgeMinYears] = useState("21");
  const [ageMaxYears, setAgeMaxYears] = useState("21");
  const [ageMinDays, setAgeMinDays] = useState("0");
  const [ageMaxDays, setAgeMaxDays] = useState("111");

  const [skillKeeper, setSkillKeeper] = useState("");
  const [skillDefending, setSkillDefending] = useState("");
  const [skillPlaymaking, setSkillPlaymaking] = useState("");
  const [skillWinger, setSkillWinger] = useState("");
  const [skillPassing, setSkillPassing] = useState("");
  const [skillScoring, setSkillScoring] = useState("");
  const [skillSetPieces, setSkillSetPieces] = useState("");
  const [skillStamina, setSkillStamina] = useState("");

  const [htmsMin, setHtmsMin] = useState("");
  const [htms28Min, setHtms28Min] = useState("");

  const [specialty, setSpecialty] = useState("any");

  const base = useMemo(() => `/team/${team}`, [team]);
  const title = useMemo(() => teamLabel(team), [team]);
  const canManage =
    typeof role === "string" && ["admin", "izbornik"].includes(role.toLowerCase());

  const SKILL_LEVELS = Array.from({ length: 21 }, (_, i) => i);
  const SKILL_LEVEL_LABELS = [
    "non-existent",
    "katastrofalan",
    "očajan",
    "loš",
    "slab",
    "nedovoljan",
    "prolazan",
    "dobar",
    "odličan",
    "impresivan",
    "izvanredan",
    "sjajan",
    "veličanstven",
    "svjetski",
    "natprirodan",
    "titanski",
    "izvanzemaljski",
    "mitski",
    "čaroban",
    "utopijski",
    "božanski",
  ];

  // 1) get session user
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        if (!supabase?.auth?.getSession) {
          // Ako supabaseClient nije dobro postavljen, pokaži jasnu grešku
          if (mounted) {
            setSessionUser(null);
            setError(
              "Supabase client nije dostupan. Provjeri utils/supabaseClient.js export."
            );
          }
          return;
        }

        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user || null;
        if (mounted) setSessionUser(user);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod čitanja sessiona.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      setRole(null);
      setNotice("");
      try {
        if (!sessionUser?.email) return;
        if (!supabase?.from) return;

        const teamType = teamTypeFromSlug(team);
        if (!teamType) return;

        const { data: srows, error: serror } = await supabase
          .from("staff_roles")
          .select("role")
          .eq("email", sessionUser.email)
          .eq("team_type", teamType)
          .limit(1);

        if (serror) throw serror;

        if (Array.isArray(srows) && srows.length > 0) {
          if (mounted) setRole(srows[0]?.role ?? null);
          return;
        }

        const { data: urows, error: uerror } = await supabase
          .from("users")
          .select("role")
          .eq("email", sessionUser.email)
          .limit(1);

        if (uerror) throw uerror;
        if (mounted) setRole(urows?.[0]?.role ?? null);
      } catch (e) {
        if (mounted) {
          setNotice("Ne mogu dohvatiti ulogu korisnika.");
        }
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [sessionUser?.email, team]);

  // 2) resolve teamId from teams.slug
  useEffect(() => {
    let mounted = true;

    async function loadTeamId() {
      setTeamIdLoading(true);
      setError("");

      try {
        if (!team) return;
        if (!supabase?.from) return;

        const { data, error: e } = await supabase
          .from("teams")
          .select("id, slug")
          .eq("slug", team)
          .maybeSingle();

        if (e) throw e;

        if (!data?.id) {
          throw new Error(
            `Ne mogu naći tim u tablici teams za slug="${team}".`
          );
        }

        if (mounted) setTeamId(data.id);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod dohvaćanja teamId.");
      } finally {
        if (mounted) setTeamIdLoading(false);
      }
    }

    loadTeamId();

    return () => {
      mounted = false;
    };
  }, [team]);

  async function refresh() {
    setError("");
    setRowsLoading(true);
    try {
      if (!supabase?.rpc) {
        setRowsLoading(false);
        return;
      }
      if (!teamId) {
        setRowsLoading(false);
        return;
      }

      const tries = [
        { p_team_id: teamId },
        { team_id: teamId },
        { p_team_slug: team },
        { team_slug: team },
      ];

      let data = null;
      let lastError = null;

      for (const args of tries) {
        if (Object.values(args).every((v) => v === null || typeof v === "undefined")) {
          continue;
        }

        const res = await supabase.rpc("list_team_requirements", args);
        if (res?.error) {
          lastError = res.error;
          continue;
        }

        if (Array.isArray(res?.data)) {
          data = res.data;
          break;
        }
      }

      if (!data && lastError) {
        throw lastError;
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Greška kod učitavanja zahtjeva.");
      setRows([]);
    } finally {
      setRowsLoading(false);
    }
  }

  // 3) load requests
  useEffect(() => {
    if (!teamIdLoading && teamId) {
      refresh();
      return;
    }

    if (!teamIdLoading && !teamId) {
      setRows([]);
      setRowsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdLoading, teamId]);

  async function createRequirement() {
    setError("");
    setNotice("");

    if (!sessionUser?.id) {
      setError("Moraš biti prijavljen da bi dodao zahtjev.");
      return;
    }

    if (!canManage) {
      setError("Nemaš ovlasti (samo admin ili izbornik).");
      return;
    }

    if (!teamId) {
      setError("teamId nije spreman (teams.slug lookup nije uspio).");
      return;
    }

    if (!name.trim()) {
      setError("Naziv zahtjeva je obavezan.");
      return;
    }

    try {
      const payload = {
        team_id: teamId,
        created_by: sessionUser.id,
        name: name.trim(),
        is_active: false,
      };

      const { data: reqData, error: insertError } = await supabase
        .from("requirements")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      const rulesPayload = [];
      let order = 1;

      const ageMinNumber = Number(ageMinYears);
      const ageMaxNumber = Number(ageMaxYears);

      if (Number.isFinite(ageMinNumber) || Number.isFinite(ageMaxNumber)) {
        rulesPayload.push({
          requirement_id: reqData.id,
          rule_order: order++,
          rule_type: "age",
          field: "age",
          op: "between",
          int_min: Number.isFinite(ageMinNumber) ? ageMinNumber : null,
          int_max: Number.isFinite(ageMaxNumber) ? ageMaxNumber : null,
          json_value: JSON.stringify({
            min_days: Number(ageMinDays) || 0,
            max_days: Number(ageMaxDays) || 0,
          }),
        });
      }

      const skillRows = [
        ["keeper", skillKeeper],
        ["defending", skillDefending],
        ["playmaking", skillPlaymaking],
        ["winger", skillWinger],
        ["passing", skillPassing],
        ["scoring", skillScoring],
        ["set_pieces", skillSetPieces],
        ["stamina", skillStamina],
      ];

      skillRows.forEach(([skillKey, value]) => {
        if (value === "" || value === null) return;
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return;
        rulesPayload.push({
          requirement_id: reqData.id,
          rule_order: order++,
          rule_type: "skill",
          field: "skill",
          op: "gte",
          int_min: numeric,
          text_value: skillKey,
        });
      });

      const htmsMinNumber = Number(htmsMin);
      if (Number.isFinite(htmsMinNumber) && htmsMinNumber > 0) {
        rulesPayload.push({
          requirement_id: reqData.id,
          rule_order: order++,
          rule_type: "htms",
          field: "htms",
          op: "gte",
          int_min: htmsMinNumber,
        });
      }

      const htms28MinNumber = Number(htms28Min);
      if (Number.isFinite(htms28MinNumber) && htms28MinNumber > 0) {
        rulesPayload.push({
          requirement_id: reqData.id,
          rule_order: order++,
          rule_type: "htms28",
          field: "htms28",
          op: "gte",
          int_min: htms28MinNumber,
        });
      }

      if (specialty && specialty !== "any") {
        rulesPayload.push({
          requirement_id: reqData.id,
          rule_order: order++,
          rule_type: "spec",
          field: "spec",
          op: "eq",
          text_value: specialty,
        });
      }

      if (rulesPayload.length > 0) {
        const { error: rulesError } = await supabase
          .from("requirement_rules")
          .insert(rulesPayload);

        if (rulesError) throw rulesError;
      }

      if (isActive && rulesPayload.length > 0) {
        const { error: updateError } = await supabase
          .from("requirements")
          .update({ is_active: true })
          .eq("id", reqData.id);

        if (updateError) throw updateError;
      } else if (isActive && rulesPayload.length === 0) {
        setNotice("Zahtjev je spremljen, ali mora imati pravila da bi bio aktivan.");
      }

      setCreateOpen(false);
      setName("");
      setIsActive(false);
      await refresh();
    } catch (e) {
      setError(e?.message || "Greška kod kreiranja zahtjeva.");
    }
  }

  async function deleteRequirement(requirementId) {
    setError("");

    if (!sessionUser?.id) {
      setError("Moraš biti prijavljen da bi obrisao zahtjev.");
      return;
    }

    if (!canManage) {
      setError("Nemaš ovlasti (samo admin ili izbornik).");
      return;
    }

    if (!requirementId) return;

    try {
      const { error: delError } = await supabase
        .from("requirements")
        .delete()
        .eq("id", requirementId);

      if (delError) throw delError;
      await refresh();
    } catch (e) {
      setError(e?.message || "Greška kod brisanja zahtjeva.");
    }
  }

  if (loading) {
    return (
      <div className="hr-pageWrap">
        <div className="hr-pageCard">
          <div style={{ fontWeight: 900 }}>Učitavam…</div>
        </div>
      </div>
    );
  }

  // Guest / not logged in: show preview only
  const isLoggedIn = !!sessionUser?.id;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Zahtjevi — {title}</h1>
            <div className="hr-pageSub">
              Zahtjevi su “srce” trackera: kasnije će filtrirati stranicu Igrači i
              puniti liste.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={base}>
              ← Natrag
            </Link>

            <button
              className="hr-backBtn"
              type="button"
              onClick={() => setCreateOpen((prev) => !prev)}
              disabled={!isLoggedIn || !canManage}
              style={
                !isLoggedIn || !canManage
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : undefined
              }
            >
              + Novi zahtjev
            </button>

          </div>
        </div>

        {error ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(220,38,38,0.06)",
              color: "rgba(220,38,38,0.95)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {!isLoggedIn ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(0,0,0,0.03)",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            Samo admin/izbornik može dodavati i brisati zahtjeve. Prijavi se za punu
            funkcionalnost.
          </div>
        ) : null}

        {createOpen ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div style={{ fontWeight: 1000, marginBottom: 8 }}>
              Novi zahtjev
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Naziv
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='npr. "U21 GK (spec) 18+"'
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    outline: "none",
                  }}
                />
              </label>

              <div style={{ fontWeight: 900, marginTop: 4 }}>Godine</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Najmanje (god)
                  <input
                    type="number"
                    value={ageMinYears}
                    onChange={(e) => setAgeMinYears(e.target.value)}
                    style={{
                      width: 110,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Najmanje (dana)
                  <input
                    type="number"
                    value={ageMinDays}
                    onChange={(e) => setAgeMinDays(e.target.value)}
                    style={{
                      width: 110,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Najviše (god)
                  <input
                    type="number"
                    value={ageMaxYears}
                    onChange={(e) => setAgeMaxYears(e.target.value)}
                    style={{
                      width: 110,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Najviše (dana)
                  <input
                    type="number"
                    value={ageMaxDays}
                    onChange={(e) => setAgeMaxDays(e.target.value)}
                    style={{
                      width: 110,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
              </div>

              <div style={{ fontWeight: 900, marginTop: 4 }}>Vještine (min)</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  ["Na golu", skillKeeper, setSkillKeeper],
                  ["Obrana", skillDefending, setSkillDefending],
                  ["Kreiranje", skillPlaymaking, setSkillPlaymaking],
                  ["Krilo", skillWinger, setSkillWinger],
                  ["Dodavanje", skillPassing, setSkillPassing],
                  ["Napad", skillScoring, setSkillScoring],
                  ["Prekidi", skillSetPieces, setSkillSetPieces],
                  ["Izdržljivost", skillStamina, setSkillStamina],
                ].map(([label, value, setter]) => (
                  <label key={label} style={{ fontSize: 12, fontWeight: 800 }}>
                    {label}
                    <select
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      style={{
                        marginLeft: 8,
                        padding: "6px 8px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    >
                      <option value="">—</option>
                      {SKILL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {SKILL_LEVEL_LABELS[lvl] ?? lvl}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div style={{ fontWeight: 900, marginTop: 4 }}>HTMS</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Trenutni HTMS ≥
                  <input
                    type="number"
                    value={htmsMin}
                    onChange={(e) => setHtmsMin(e.target.value)}
                    style={{
                      width: 120,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
                <label style={{ fontSize: 12, fontWeight: 800 }}>
                  Potencijalni HTMS ≥
                  <input
                    type="number"
                    value={htms28Min}
                    onChange={(e) => setHtms28Min(e.target.value)}
                    style={{
                      width: 120,
                      marginLeft: 8,
                      padding: "6px 8px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                </label>
              </div>

              <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Specijalnost
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{
                    marginLeft: 8,
                    padding: "6px 8px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  <option value="any">Any Specialty</option>
                  <option value="Technical">Technical</option>
                  <option value="Quick">Quick</option>
                  <option value="Powerful">Powerful</option>
                  <option value="Unpredictable">Unpredictable</option>
                  <option value="Head">Head</option>
                  <option value="Resilient">Resilient</option>
                </select>
              </label>

              <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                Aktivno
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ marginLeft: 10 }}
                />
              </label>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="hr-backBtn"
                  type="button"
                  onClick={createRequirement}
                  disabled={!isLoggedIn || !canManage}
                  style={
                    !isLoggedIn || !canManage
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : undefined
                  }
                >
                  Spremi
                </button>
                <button
                  className="hr-backBtn"
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  style={{ opacity: 0.8 }}
                >
                  Odustani
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {notice ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(59,130,246,0.25)",
              background: "rgba(59,130,246,0.06)",
              color: "rgba(37,99,235,0.95)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {notice}
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>
            Postojeći zahtjevi
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.75)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.4fr 0.4fr 0.7fr 0.4fr",
                gap: 10,
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 1000,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Naziv</div>
              <div>Pravila</div>
              <div>Aktivno</div>
              <div>Datum</div>
              <div>Akcija</div>
            </div>

            {rowsLoading ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.75 }}>
                Učitavanje…
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, opacity: 0.75 }}>
                Trenutno nema zahtjeva. {isLoggedIn ? "Klikni “Novi zahtjev”." : ""}
              </div>
            ) : (
              rows.map((r) => {
                const rulesCount =
                  r?.rules_count ??
                  r?.rule_count ??
                  r?.rulesCount ??
                  r?.rules?.length ??
                  0;
                const isActive =
                  typeof r?.is_active !== "undefined"
                    ? r.is_active
                    : r?.active ?? false;
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 0.4fr 0.4fr 0.7fr 0.4fr",
                      gap: 10,
                      padding: "10px 12px",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      fontSize: 13,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{r.name}</div>
                    <div style={{ opacity: 0.8 }}>{rulesCount}</div>
                    <div style={{ opacity: 0.8 }}>{isActive ? "Da" : "Ne"}</div>
                    <div style={{ opacity: 0.7 }}>
                      {r.created_at ? String(r.created_at).slice(0, 10) : "-"}
                    </div>
                    <div>
                      <button
                        className="hr-backBtn"
                        type="button"
                        onClick={() => deleteRequirement(r.id)}
                        disabled={!isLoggedIn || !canManage}
                        style={
                          !isLoggedIn || !canManage
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : undefined
                        }
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: sljedeći korak je povezati odabrani zahtjev s filtriranjem
            igrača.
          </div>
        </div>

      </div>
    </div>
  );
}
