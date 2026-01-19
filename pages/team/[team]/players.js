import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

// ---- Columns (UI only, values are placeholders "—" until DB/CHPP wiring in 16.3+) ----
const ALL_COLUMNS = [
  { key: "name", label: "Ime", always: true },
  { key: "pos", label: "Poz", always: true },
  { key: "age", label: "Dob", always: true },

  // core skills (portal-like)
  { key: "gk", label: "GK" },
  { key: "def", label: "DEF" },
  { key: "pm", label: "PM" },
  { key: "wing", label: "WING" },
  { key: "pass", label: "PASS" },
  { key: "score", label: "SC" },
  { key: "sp", label: "SP" },

  // extra info (portal-like)
  { key: "tsi", label: "TSI" },
  { key: "wage", label: "Plaća" },
  { key: "form", label: "Forma" },
  { key: "stamina", label: "Stamina" },
  { key: "stamina_pct", label: "% Sta" },
  { key: "training_last", label: "Zadnji trening" },
  { key: "training_now", label: "Trenutni trening" },

  // ids/actions
  { key: "ht_id", label: "HT ID" },
  { key: "action", label: "Akcija", always: true },
];

const PRESETS = [
  { key: "gk", label: "GK preset", cols: ["gk", "def", "pm"] },
  { key: "def", label: "DEF preset", cols: ["def", "pm", "wing", "pass"] },
  { key: "im", label: "IM preset", cols: ["pm", "pass", "def", "wing"] },
  { key: "wing", label: "WING preset", cols: ["wing", "pass", "pm", "score"] },
  { key: "fwd", label: "FWD preset", cols: ["score", "pass", "wing", "pm"] },
  { key: "all", label: "Sve", cols: ["gk", "def", "pm", "wing", "pass", "score", "sp", "tsi", "wage", "form", "stamina", "stamina_pct", "training_last", "training_now", "ht_id"] },
];

function buildDefaultVisibleCols(team) {
  // Keep it readable: start with "portal-ish minimal"
  // NOTE: name/pos/age/action are always shown.
  if (team === "nt") return new Set(["def", "pm", "pass", "score", "form", "stamina", "ht_id"]);
  if (team === "u21") return new Set(["def", "pm", "pass", "form", "stamina", "ht_id"]);
  return new Set(["def", "pm", "pass", "form", "stamina", "ht_id"]);
}

function fmtPlaceholder() {
  return "—";
}

export default function TeamPlayers() {
  const router = useRouter();
  const { team } = router.query;

  // UI state
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [search, setSearch] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [showSkillCols, setShowSkillCols] = useState(true);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const [visibleCols, setVisibleCols] = useState(() => buildDefaultVisibleCols(team));

  // when team appears (router hydration), ensure defaults apply once
  // (avoid resetting user selection if team already set)
  const teamKey = typeof team === "string" ? team : "";
  const defaultCols = useMemo(() => buildDefaultVisibleCols(teamKey), [teamKey]);
  const computedVisibleCols = useMemo(() => {
    // If user hasn't interacted yet (empty set on first render), use defaults
    // If user did interact, keep state. But we also re-init when team changes.
    return visibleCols && visibleCols.size ? visibleCols : defaultCols;
  }, [visibleCols, defaultCols]);

  // Keep visibleCols in sync when team changes
  // (only if user never customized; safest approach)
  // For simplicity: if team changes, reset to defaults.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    if (!teamKey) return;
    setVisibleCols(buildDefaultVisibleCols(teamKey));
    // also reset filters
    setSelectedRequestId("");
    setSearch("");
    setAgeMin("");
    setAgeMax("");
    setPosFilter("all");
    setShowSkillCols(true);
    setShowColumnPicker(false);
  }, [teamKey]);

  const columnsToRender = useMemo(() => {
    const base = ALL_COLUMNS.filter((c) => c.always);
    const optional = ALL_COLUMNS.filter((c) => !c.always);

    // If user hides skill columns entirely, we remove skill columns (gk..sp)
    const SKILL_KEYS = new Set(["gk", "def", "pm", "wing", "pass", "score", "sp"]);
    const filteredOptional = optional.filter((c) => {
      if (!showSkillCols && SKILL_KEYS.has(c.key)) return false;
      return true;
    });

    // Now apply column picker visibility
    const picked = filteredOptional.filter((c) => computedVisibleCols.has(c.key));

    // Always include always columns in a fixed order
    // Final order: always columns in ALL_COLUMNS order, then picked in ALL_COLUMNS order
    const alwaysOrdered = ALL_COLUMNS.filter((c) => c.always);
    const pickedOrdered = ALL_COLUMNS.filter((c) => !c.always).filter((c) => picked.some((p) => p.key === c.key));

    return [...alwaysOrdered, ...pickedOrdered];
  }, [computedVisibleCols, showSkillCols]);

  // Fake preview data (until 16.3 connects requests + players)
  const requestsPreview = useMemo(() => {
    // If user already has requests in DB, in 16.3 we’ll fetch them.
    // For now keep minimal “skeleton” options so UI behaves.
    return [
      { id: "req-1", title: "NT GK (test)", status: "open", criteria: { q: "spec", positions: ["GK"], skills: { goalkeeping: 8 }, age_min: 17, age_max: 21 } },
      { id: "req-2", title: "Test zahtjev (NT) - spec", status: "open", criteria: { q: "spec", training: { min_percent: 50, allow_no_training: false }, nt_only: true } },
    ];
  }, []);

  const playersPreview = useMemo(() => {
    // One row like in your screenshot; real data later.
    return [
      {
        id: "p-1",
        name: "Igrač A",
        pos: "GK",
        age: 19,
        ht_id: "—",
        // skills/info placeholders
        gk: fmtPlaceholder(),
        def: fmtPlaceholder(),
        pm: fmtPlaceholder(),
        wing: fmtPlaceholder(),
        pass: fmtPlaceholder(),
        score: fmtPlaceholder(),
        sp: fmtPlaceholder(),
        tsi: fmtPlaceholder(),
        wage: fmtPlaceholder(),
        form: fmtPlaceholder(),
        stamina: fmtPlaceholder(),
        stamina_pct: fmtPlaceholder(),
        training_last: fmtPlaceholder(),
        training_now: fmtPlaceholder(),
      },
    ];
  }, []);

  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return requestsPreview.find((r) => r.id === selectedRequestId) || null;
  }, [requestsPreview, selectedRequestId]);

  const resultCount = playersPreview.length;

  function applyPreset(presetKey) {
    const preset = PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;

    setVisibleCols((prev) => {
      const next = new Set(prev);
      // clear all optional keys first (but keep always columns separate anyway)
      next.clear();
      preset.cols.forEach((k) => next.add(k));
      return next;
    });
  }

  function toggleColumn(key) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function resetColumns() {
    setVisibleCols(buildDefaultVisibleCols(teamKey));
  }

  if (!teamKey) return null;

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Igrači</h1>
            <div className="hr-pageSub">
              Aktivni tim: {teamLabel(teamKey)} (prema zahtjevima) — <span style={{ opacity: 0.8 }}>preview</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={`/team/${teamKey}`}>
              ← Natrag na module
            </Link>
            <Link className="hr-backBtn" href="/">
              Naslovnica
            </Link>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 1.4fr 0.8fr 0.8fr 1fr", gap: 10 }}>
          {/* Request */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Zahtjev</div>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.9)",
                outline: "none",
                fontWeight: 700,
              }}
            >
              <option value="">(odaberi)</option>
              {requestsPreview.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.status})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Pretraga</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ime, HT ID, pozicija..."
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                background: "rgba(255,255,255,0.9)",
              }}
            />
          </div>

          {/* Age min */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Dob</div>
            <input
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              placeholder="min"
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                background: "rgba(255,255,255,0.9)",
              }}
            />
          </div>

          {/* Age max */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>&nbsp;</div>
            <input
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              placeholder="max"
              inputMode="numeric"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                background: "rgba(255,255,255,0.9)",
              }}
            />
          </div>

          {/* Position */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontWeight: 900 }}>Pozicija</div>
            <select
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.9)",
                outline: "none",
                fontWeight: 800,
              }}
            >
              <option value="all">Sve</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="IM">IM</option>
              <option value="WING">WING</option>
              <option value="FWD">FWD</option>
            </select>
          </div>
        </div>

        {/* ACTION BAR */}
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
            <input checked={showSkillCols} onChange={(e) => setShowSkillCols(e.target.checked)} type="checkbox" />
            Prikaži “skill” stupce (preview)
          </label>

          <button
            type="button"
            className="hr-backBtn"
            onClick={() => setShowColumnPicker((v) => !v)}
            style={{ fontWeight: 1000 }}
          >
            {showColumnPicker ? "Sakrij kolone" : "Odaberi kolone"}
          </button>

          <button
            type="button"
            className="hr-backBtn"
            onClick={() => alert("Primjena zahtjeva + DB spajanje dolazi u Task 16.3.")}
            style={{ fontWeight: 1000 }}
          >
            Primijeni zahtjev → (skeleton)
          </button>

          <button
            type="button"
            className="hr-backBtn"
            onClick={() => {
              setSelectedRequestId("");
              setSearch("");
              setAgeMin("");
              setAgeMax("");
              setPosFilter("all");
              resetColumns();
            }}
            style={{ fontWeight: 1000 }}
          >
            Reset filtera
          </button>
        </div>

        {/* COLUMN PICKER */}
        {showColumnPicker && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 1000 }}>Kolone (odabir)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className="hr-backBtn"
                    style={{ fontWeight: 900 }}
                    onClick={() => applyPreset(p.key)}
                  >
                    {p.label}
                  </button>
                ))}
                <button type="button" className="hr-backBtn" style={{ fontWeight: 900 }} onClick={resetColumns}>
                  Default
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              {ALL_COLUMNS.filter((c) => !c.always).map((c) => {
                const isSkill = ["gk", "def", "pm", "wing", "pass", "score", "sp"].includes(c.key);
                const disabled = !showSkillCols && isSkill;
                const checked = computedVisibleCols.has(c.key) && !disabled;

                return (
                  <label
                    key={c.key}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: disabled ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.95)",
                      opacity: disabled ? 0.55 : 1,
                      fontWeight: 900,
                    }}
                    title={disabled ? "Uključi 'Prikaži skill stupce' da bi birao skillove." : ""}
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={checked}
                      onChange={() => toggleColumn(c.key)}
                    />
                    {c.label}
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
              Napomena: vrijednosti su trenutno “—”. U Task 16.3 spajamo DB (team_requests + players + snapshots).
            </div>
          </div>
        )}

        {/* SELECTED REQUEST PREVIEW */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Odabrani zahtjev (criteria preview)</div>
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div style={{ padding: "12px 12px", fontWeight: 1000, background: "rgba(0,0,0,0.04)" }}>
              {selectedRequest ? selectedRequest.title : "(nije odabran)"}
            </div>
            <div style={{ padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 13 }}>
              {selectedRequest ? JSON.stringify(selectedRequest.criteria, null, 2) : "Odaberi zahtjev iz dropdowna da vidiš kriterije."}
            </div>
          </div>
        </div>

        {/* RESULTS TABLE */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Rezultati ({resultCount})</div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `${columnsToRender
                  .map((c) => {
                    if (c.key === "name") return "1.4fr";
                    if (c.key === "action") return "1.1fr";
                    return "0.7fr";
                  })
                  .join(" ")}`,
                gap: 0,
                padding: "10px 12px",
                fontWeight: 900,
                background: "rgba(0,0,0,0.04)",
                alignItems: "center",
              }}
            >
              {columnsToRender.map((c) => (
                <div key={c.key}>{c.label}</div>
              ))}
            </div>

            {playersPreview.length === 0 ? (
              <div style={{ padding: "12px", opacity: 0.7 }}>Nema rezultata.</div>
            ) : (
              playersPreview.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `${columnsToRender
                      .map((c) => {
                        if (c.key === "name") return "1.4fr";
                        if (c.key === "action") return "1.1fr";
                        return "0.7fr";
                      })
                      .join(" ")}`,
                    padding: "12px",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    alignItems: "center",
                  }}
                >
                  {columnsToRender.map((c) => {
                    if (c.key === "action") {
                      return (
                        <div key={c.key} style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="hr-backBtn"
                            style={{ fontWeight: 1000 }}
                            onClick={() => alert("Liste dolaze kasnije (Task 17+).")}
                          >
                            + U listu
                          </button>
                          <button
                            type="button"
                            className="hr-backBtn"
                            style={{ fontWeight: 1000 }}
                            onClick={() => alert("Detalji dolaze kad spojimo stvarne podatke (Task 16.3+).")}
                          >
                            Detalji →
                          </button>
                        </div>
                      );
                    }

                    if (c.key === "name") {
                      return (
                        <div key={c.key} style={{ fontWeight: 1000 }}>
                          {p.name}
                        </div>
                      );
                    }

                    // safe field output
                    return <div key={c.key}>{p[c.key] ?? fmtPlaceholder()}</div>;
                  })}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
            * U Task 16.3 spajamo “Zahtjev” na DB (team_requests) i stvarne igrače (bez CHPP još).
          </div>
        </div>
      </div>
    </div>
  );
}
