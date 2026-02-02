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

  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  const [ruleType, setRuleType] = useState("age");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillMin, setSkillMin] = useState("");
  const [skillMax, setSkillMax] = useState("");
  const [htmsMin, setHtmsMin] = useState("");
  const [htmsMax, setHtmsMax] = useState("");
  const [htms28Min, setHtms28Min] = useState("");
  const [htms28Max, setHtms28Max] = useState("");
  const [specText, setSpecText] = useState("");
  const [positionText, setPositionText] = useState("");

  const base = useMemo(() => `/team/${team}`, [team]);
  const title = useMemo(() => teamLabel(team), [team]);
  const canManage =
    typeof role === "string" && ["admin", "izbornik"].includes(role.toLowerCase());

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

  async function loadRules(requirementId) {
    setRulesLoading(true);
    setError("");

    try {
      const { data, error: rulesError } = await supabase
        .from("requirement_rules")
        .select(
          "id, requirement_id, rule_order, rule_type, field, op, int_min, int_max, text_value, json_value, created_at"
        )
        .eq("requirement_id", requirementId)
        .order("rule_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (rulesError) throw rulesError;
      setRules(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Greška kod učitavanja pravila.");
      setRules([]);
    } finally {
      setRulesLoading(false);
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
      if (isActive) {
        setNotice("Zahtjev se sprema kao neaktivan dok se ne dodaju pravila.");
      }

      const payload = {
        team_id: teamId,
        created_by: sessionUser.id,
        name: name.trim(),
        is_active: false,
      };

      const { error: insertError } = await supabase
        .from("requirements")
        .insert(payload);

      if (insertError) throw insertError;

      setCreateOpen(false);
      setName("");
      setIsActive(false);
      await refresh();
    } catch (e) {
      setError(e?.message || "Greška kod kreiranja zahtjeva.");
    }
  }

  function resetRuleInputs() {
    setRuleType("age");
    setAgeMin("");
    setAgeMax("");
    setSkillName("");
    setSkillMin("");
    setSkillMax("");
    setHtmsMin("");
    setHtmsMax("");
    setHtms28Min("");
    setHtms28Max("");
    setSpecText("");
    setPositionText("");
  }

  function buildRulePayload(requirementId, order) {
    if (ruleType === "age") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "age",
        field: "age",
        op: "between",
        int_min: ageMin ? Number(ageMin) : null,
        int_max: ageMax ? Number(ageMax) : null,
      };
    }

    if (ruleType === "skill") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "skill",
        field: "skill",
        op: "between",
        int_min: skillMin ? Number(skillMin) : null,
        int_max: skillMax ? Number(skillMax) : null,
        text_value: skillName.trim() || null,
      };
    }

    if (ruleType === "htms") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "htms",
        field: "htms",
        op: "between",
        int_min: htmsMin ? Number(htmsMin) : null,
        int_max: htmsMax ? Number(htmsMax) : null,
      };
    }

    if (ruleType === "htms28") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "htms28",
        field: "htms28",
        op: "between",
        int_min: htms28Min ? Number(htms28Min) : null,
        int_max: htms28Max ? Number(htms28Max) : null,
      };
    }

    if (ruleType === "spec") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "spec",
        field: "spec",
        op: "eq",
        text_value: specText.trim() || null,
      };
    }

    if (ruleType === "position") {
      return {
        requirement_id: requirementId,
        rule_order: order,
        rule_type: "position",
        field: "position",
        op: "eq",
        text_value: positionText.trim() || null,
      };
    }

    return null;
  }

  async function addRule() {
    setError("");
    setNotice("");

    if (!selectedRequirement?.id) {
      setError("Odaberi zahtjev prije dodavanja pravila.");
      return;
    }

    const nextOrder = rules.length + 1;
    const payload = buildRulePayload(selectedRequirement.id, nextOrder);

    if (!payload) {
      setError("Neispravan tip pravila.");
      return;
    }

    if (payload.rule_type === "skill" && !payload.text_value) {
      setError("Skill je obavezan.");
      return;
    }

    if (payload.rule_type === "spec" && !payload.text_value) {
      setError("Specijalnost je obavezna.");
      return;
    }

    if (payload.rule_type === "position" && !payload.text_value) {
      setError("Pozicija je obavezna.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("requirement_rules")
        .insert(payload);

      if (insertError) throw insertError;
      resetRuleInputs();
      await loadRules(selectedRequirement.id);
    } catch (e) {
      setError(e?.message || "Greška kod dodavanja pravila.");
    }
  }

  async function deleteRule(ruleId) {
    setError("");

    try {
      const { error: delError } = await supabase
        .from("requirement_rules")
        .delete()
        .eq("id", ruleId);

      if (delError) throw delError;
      if (selectedRequirement?.id) {
        await loadRules(selectedRequirement.id);
      }
    } catch (e) {
      setError(e?.message || "Greška kod brisanja pravila.");
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
                        onClick={() => {
                          setSelectedRequirement(r);
                          loadRules(r.id);
                        }}
                        style={{ marginBottom: 6 }}
                      >
                        Pravila
                      </button>
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

        {selectedRequirement ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 1000, marginBottom: 8 }}>
              Pravila za: {selectedRequirement.name}
            </div>

            <div
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(255,255,255,0.75)",
              }}
            >
              {rulesLoading ? (
                <div style={{ fontSize: 13, opacity: 0.75 }}>Učitavanje…</div>
              ) : rules.length === 0 ? (
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  Nema pravila. Dodaj prvo pravilo ispod.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <strong>{rule.rule_type}</strong>{" "}
                        {rule.text_value ? `(${rule.text_value})` : ""}
                        {typeof rule.int_min !== "undefined" ||
                        typeof rule.int_max !== "undefined"
                          ? ` · ${rule.int_min ?? "?"} - ${rule.int_max ?? "?"}`
                          : ""}
                      </div>
                      <button
                        className="hr-backBtn"
                        type="button"
                        onClick={() => deleteRule(rule.id)}
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
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(255,255,255,0.75)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 8 }}>
                Dodaj pravilo
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
                  Tip pravila
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    style={{
                      marginLeft: 8,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    <option value="age">Dob</option>
                    <option value="skill">Skill (min/max)</option>
                    <option value="htms">HTMS</option>
                    <option value="htms28">HTMS28</option>
                    <option value="spec">Specijalnost</option>
                    <option value="position">Pozicija</option>
                  </select>
                </label>

                {ruleType === "age" ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="number"
                      placeholder="Age min"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Age max"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                ) : null}

                {ruleType === "skill" ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      placeholder="Skill (npr. gk, def)"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      style={{
                        width: 180,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Min"
                      value={skillMin}
                      onChange={(e) => setSkillMin(e.target.value)}
                      style={{
                        width: 90,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={skillMax}
                      onChange={(e) => setSkillMax(e.target.value)}
                      style={{
                        width: 90,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                ) : null}

                {ruleType === "htms" ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="number"
                      placeholder="HTMS min"
                      value={htmsMin}
                      onChange={(e) => setHtmsMin(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="HTMS max"
                      value={htmsMax}
                      onChange={(e) => setHtmsMax(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                ) : null}

                {ruleType === "htms28" ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="number"
                      placeholder="HTMS28 min"
                      value={htms28Min}
                      onChange={(e) => setHtms28Min(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="HTMS28 max"
                      value={htms28Max}
                      onChange={(e) => setHtms28Max(e.target.value)}
                      style={{
                        width: 120,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                ) : null}

                {ruleType === "spec" ? (
                  <input
                    placeholder="Specijalnost"
                    value={specText}
                    onChange={(e) => setSpecText(e.target.value)}
                    style={{
                      width: 220,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                ) : null}

                {ruleType === "position" ? (
                  <input
                    placeholder="Pozicija"
                    value={positionText}
                    onChange={(e) => setPositionText(e.target.value)}
                    style={{
                      width: 220,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                ) : null}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="hr-backBtn"
                    type="button"
                    onClick={addRule}
                    disabled={!isLoggedIn || !canManage}
                    style={
                      !isLoggedIn || !canManage
                        ? { opacity: 0.6, cursor: "not-allowed" }
                        : undefined
                    }
                  >
                    Dodaj pravilo
                  </button>
                  <button
                    className="hr-backBtn"
                    type="button"
                    onClick={() => setSelectedRequirement(null)}
                    style={{ opacity: 0.8 }}
                  >
                    Zatvori
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
