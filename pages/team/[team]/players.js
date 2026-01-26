/* eslint-disable react/no-unescaped-entities */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

/**
 * TEAM PLAYERS (NT / U21)
 * URL: /team/:team/players  (team = "nt" | "u21")
 *
 * MVP:
 * - Left sidebar (Portal-style)
 * - Header (currently placeholder stripes)
 * - Filters + column picker
 * - Table
 *
 * NOTE: We are iterating step-by-step. Do NOT remove working parts.
 */

const TEAM_LABEL = {
  nt: "Hrvatska NT",
  u21: "Hrvatska U21",
};

const DEFAULT_TEAM = "nt";

/** ---------- Column Definitions (logical order) ---------- */
const ALL_COLUMNS = [
  // identity
  { key: "name", label: "Ime", group: "Osnovno", default: true },
  { key: "htid", label: "HTID", group: "Osnovno", default: true },
  { key: "specialty", label: "Specka", group: "Osnovno", default: true },
  { key: "gk", label: "GK", group: "Skillovi", default: true },
  { key: "def", label: "DEF", group: "Skillovi", default: true },
  { key: "wing", label: "WING", group: "Skillovi", default: true },
  { key: "pm", label: "PM", group: "Skillovi", default: true },
  { key: "pass", label: "PASS", group: "Skillovi", default: true },
  { key: "scor", label: "SCOR", group: "Skillovi", default: true },
  { key: "sp", label: "SP", group: "Skillovi", default: true },

  // meta
  { key: "pos", label: "Poz", group: "Osnovno", default: true },
  { key: "age", label: "Age", group: "Osnovno", default: true },

  // extra (MVP subset; more later)
  { key: "htms", label: "HTMS", group: "HTMS", default: false },
  { key: "htms28", label: "HTMS28", group: "HTMS", default: false },
  { key: "form", label: "Forma", group: "Stanje", default: false },
  { key: "stamina", label: "Stamina", group: "Stanje", default: false },
  { key: "stPercent", label: "St %", group: "Stanje", default: false },
  { key: "tsi", label: "TSI", group: "Financije", default: false },
  { key: "salary", label: "Plaća", group: "Financije", default: false },

  { key: "agree", label: "Agree", group: "Osobine", default: false },
  { key: "aggr", label: "Aggr", group: "Osobine", default: false },
  { key: "hon", label: "Hon", group: "Osobine", default: false },
  { key: "lead", label: "Lead", group: "Osobine", default: false },
  { key: "xp", label: "XP", group: "Osobine", default: false },

  { key: "updated", label: "Updated", group: "Ostalo", default: false },
  { key: "lastTraining", label: "Last TR", group: "Trening", default: false },
  { key: "currentTraining", label: "TR", group: "Trening", default: false },
  { key: "club", label: "Klub", group: "Ostalo", default: false },
  { key: "manager", label: "Mgr", group: "Ostalo", default: false },
];

function getDefaultVisibleColumns() {
  const def = {};
  ALL_COLUMNS.forEach((c) => {
    def[c.key] = !!c.default;
  });
  return def;
}

/** ---------- Specialty options (placeholder set; can expand) ---------- */
const SPECIALTY_OPTIONS = [
  { value: "all", label: "Specka (sve)" },
  { value: "none", label: "Bez specke" },
  { value: "T", label: "T (Tehničar)" },
  { value: "Q", label: "Q (Brz)" },
  { value: "U", label: "U (Nepredvidljiv)" },
  { value: "H", label: "H (Glava)" },
  { value: "P", label: "P (Snažan)" },
];

/** ---------- Position options ---------- */
const POSITION_OPTIONS = [
  { value: "all", label: "Pozicija (sve)" },
  { value: "GK", label: "GK" },
  { value: "CD", label: "CD" },
  { value: "WB", label: "WB" },
  { value: "IM", label: "IM" },
  { value: "W", label: "W" },
  { value: "FW", label: "FW" },
];

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const safeTeam = team === "u21" ? "u21" : "nt";

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [players, setPlayers] = useState([]);

  const [search, setSearch] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const [requirementsFilter, setRequirementsFilter] = useState("all");
  const [personalFilter, setPersonalFilter] = useState("all");
  const [agreeFilter, setAgreeFilter] = useState("all");
  const [aggrFilter, setAggrFilter] = useState("all");
  const [honestyFilter, setHonestyFilter] = useState("all");

  // Min skill filters (simple MVP)
  const [minGK, setMinGK] = useState("");
  const [minDEF, setMinDEF] = useState("");
  const [minPM, setMinPM] = useState("");
  const [minWING, setMinWING] = useState("");
  const [minPASS, setMinPASS] = useState("");
  const [minSCOR, setMinSCOR] = useState("");
  const [minSP, setMinSP] = useState("");
  const [minHTMS, setMinHTMS] = useState("");
  const [minHTMS28, setMinHTMS28] = useState("");

  const [compact, setCompact] = useState(true);
  const [wrap, setWrap] = useState(false);

  // Column Picker: should be hidden until button click
  const [showColumns, setShowColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(getDefaultVisibleColumns());

  const didLoadRef = useRef(false);

  /** --------- Load players (Supabase RPC or view) --------- */
  useEffect(() => {
    if (!router.isReady) return;
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  async function loadPlayers() {
    setLoading(true);
    setError("");

    try {
      /**
       * IMPORTANT:
       * This project previously used RPC: list_team_players(team_slug)
       * If you later change DB function names, keep this page in sync.
       */
      const { data, error: rpcError } = await supabase.rpc("list_team_players", {
        team_slug: safeTeam,
      });

      if (rpcError) throw rpcError;

      // Normalize and ensure no duplicate rows (basic dedupe by internal id/htid)
      const normalized = (data || []).map((p) => ({
        id: p.id ?? p.player_id ?? p.internal_id ?? null,
        name: p.name ?? p.player_name ?? "",
        htid: p.htid ?? p.ht_player_id ?? "",
        pos: p.pos ?? p.position ?? "",
        age: p.age ?? p.years ?? "",
        specialty: p.specialty ?? p.spec ?? p.speciality ?? "",
        gk: p.gk ?? p.skill_gk ?? p.keeper ?? "",
        def: p.def ?? p.skill_def ?? p.defending ?? "",
        wing: p.wing ?? p.skill_wing ?? p.winger ?? "",
        pm: p.pm ?? p.skill_pm ?? p.playmaking ?? "",
        pass: p.pass ?? p.skill_pass ?? p.passing ?? "",
        scor: p.scor ?? p.skill_scor ?? p.scoring ?? "",
        sp: p.sp ?? p.skill_sp ?? p.set_pieces ?? "",
        htms: p.htms ?? p.ability_htms ?? "",
        htms28: p.htms28 ?? p.potential_htms ?? "",
        form: p.form ?? "",
        stamina: p.stamina ?? "",
        stPercent: p.st_percent ?? p.stPercent ?? "",
        tsi: p.tsi ?? "",
        salary: p.salary ?? "",
        agree: p.agreeability ?? p.agree ?? "",
        aggr: p.aggressiveness ?? p.aggr ?? "",
        hon: p.honesty ?? p.hon ?? "",
        lead: p.leadership ?? p.lead ?? "",
        xp: p.experience ?? p.xp ?? "",
        updated: p.updated ?? p.updated_at ?? "",
        lastTraining: p.last_training ?? "",
        currentTraining: p.current_training ?? "",
        club: p.club ?? "",
        manager: p.manager ?? "",
      }));

      const seen = new Set();
      const deduped = [];
      for (const p of normalized) {
        const key = `${p.id ?? ""}::${p.htid ?? ""}::${p.name ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(p);
      }

      setPlayers(deduped);
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  /** --------- Filtering (client-side MVP) --------- */
  const filteredPlayers = useMemo(() => {
    let rows = [...players];

    const s = search.trim().toLowerCase();
    if (s) {
      rows = rows.filter((p) => {
        const n = (p.name || "").toLowerCase();
        const h = String(p.htid || "").toLowerCase();
        const po = String(p.pos || "").toLowerCase();
        return n.includes(s) || h.includes(s) || po.includes(s);
      });
    }

    if (posFilter !== "all") {
      rows = rows.filter((p) => String(p.pos || "").toUpperCase() === posFilter.toUpperCase());
    }

    if (specialtyFilter !== "all") {
      if (specialtyFilter === "none") {
        rows = rows.filter((p) => !p.specialty || String(p.specialty).trim() === "");
      } else {
        rows = rows.filter((p) => String(p.specialty || "").toUpperCase() === specialtyFilter);
      }
    }

    const amin = ageMin !== "" ? Number(ageMin) : null;
    const amax = ageMax !== "" ? Number(ageMax) : null;
    if (amin !== null && !Number.isNaN(amin)) rows = rows.filter((p) => Number(p.age || 0) >= amin);
    if (amax !== null && !Number.isNaN(amax)) rows = rows.filter((p) => Number(p.age || 0) <= amax);

    // Min skill filters
    const minFilters = [
      ["gk", minGK],
      ["def", minDEF],
      ["pm", minPM],
      ["wing", minWING],
      ["pass", minPASS],
      ["scor", minSCOR],
      ["sp", minSP],
      ["htms", minHTMS],
      ["htms28", minHTMS28],
    ];
    minFilters.forEach(([key, val]) => {
      if (val === "") return;
      const n = Number(val);
      if (Number.isNaN(n)) return;
      rows = rows.filter((p) => Number(p[key] || 0) >= n);
    });

    return rows;
  }, [
    players,
    search,
    ageMin,
    ageMax,
    posFilter,
    specialtyFilter,
    minGK,
    minDEF,
    minPM,
    minWING,
    minPASS,
    minSCOR,
    minSP,
    minHTMS,
    minHTMS28,
  ]);

  const visibleColumnList = useMemo(() => {
    return ALL_COLUMNS.filter((c) => visibleColumns[c.key]);
  }, [visibleColumns]);

  function toggleColumn(key) {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetColumns() {
    setVisibleColumns(getDefaultVisibleColumns());
  }

  return (
    <div className="pageRoot">
      {/* HEADER */}
      <div className="header">
        <div className="headerLeft">
          <div className="headerSmall">Hrvatska NT</div>
          <div className="headerTitle">NT Pregled</div>
        </div>

        <div className="headerRight">
          <Link className="headerBtn" href="/team/nt">
            NT Pregled
          </Link>
          <Link className="headerBtn" href="/">
            Naslovnica
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pageWrap">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sbBlock">
            <div className="sbMiniTitle">{TEAM_LABEL[safeTeam]}</div>

            <div className="sbMiniTitle2">SPONZORI</div>
            <div className="sbSponsor">test</div>

            <div className="sbSectionHeader">NT</div>
            <ul className="sbList">
              <li>
                <Link href="/team/nt/requests">Zahtjevi</Link>
              </li>
              <li>
                <Link href="/team/nt/lists">Popisi</Link>
              </li>
              <li className="active">
                <Link href="/team/nt/players">Igrači</Link>
              </li>
              <li>
                <Link href="/team/nt/alerts">Upozorenja</Link>
              </li>
              <li>
                <Link href="/team/nt/events">Kalendar natjecanja</Link>
              </li>
              <li>
                <Link href="/team/nt/training-settings">Postavke treninga</Link>
              </li>
            </ul>

            <div className="sbGap" />

            <div className="sbSectionHeader">HRVATSKA U21</div>
            <ul className="sbList">
              <li>
                <Link href="/team/u21/requests">Zahtjevi</Link>
              </li>
              <li>
                <Link href="/team/u21/lists">Popisi</Link>
              </li>
              <li>
                <Link href="/team/u21/players">Igrači</Link>
              </li>
              <li>
                <Link href="/team/u21/alerts">Upozorenja</Link>
              </li>
              <li>
                <Link href="/team/u21/events">Kalendar natjecanja</Link>
              </li>
              <li>
                <Link href="/team/u21/training-settings">Postavke treninga</Link>
              </li>
            </ul>

            <div className="sbNote">* Sve stavke su rezervirane za kasnije.</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topRow">
            <Link className="pillBtn" href="/team/nt">
              Moduli
            </Link>

            <div className="centerInfo">Ukupno: {filteredPlayers.length}</div>

            <div className="toggles">
              <label className="toggle">
                <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
                <span>Kompaktno</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
                <span>Wrap</span>
              </label>
            </div>
          </div>

          {/* Filters Row 1 */}
          <div className="filters">
            <select value={requirementsFilter} onChange={(e) => setRequirementsFilter(e.target.value)}>
              <option value="all">Requirement to players</option>
            </select>

            <select value={personalFilter} onChange={(e) => setPersonalFilter(e.target.value)}>
              <option value="all">Personal filter</option>
            </select>

            <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
              {SPECIALTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select value={agreeFilter} onChange={(e) => setAgreeFilter(e.target.value)}>
              <option value="all">Agreeability</option>
            </select>

            <select value={aggrFilter} onChange={(e) => setAggrFilter(e.target.value)}>
              <option value="all">Aggressiveness</option>
            </select>

            <select value={honestyFilter} onChange={(e) => setHonestyFilter(e.target.value)}>
              <option value="all">Honesty</option>
            </select>
          </div>

          {/* Filters Row 2 */}
          <div className="filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: ime / HTID / pozicija..."
            />

            <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
              {POSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <input value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Age min" />
            <input value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Age max" />
          </div>

          {/* Min Skills */}
          <div className="minSkills">
            <div className="minLabel">Min skillovi</div>
            <input value={minGK} onChange={(e) => setMinGK(e.target.value)} placeholder="GK" />
            <input value={minDEF} onChange={(e) => setMinDEF(e.target.value)} placeholder="DEF" />
            <input value={minWING} onChange={(e) => setMinWING(e.target.value)} placeholder="WING" />
            <input value={minPM} onChange={(e) => setMinPM(e.target.value)} placeholder="PM" />
            <input value={minPASS} onChange={(e) => setMinPASS(e.target.value)} placeholder="PASS" />
            <input value={minSCOR} onChange={(e) => setMinSCOR(e.target.value)} placeholder="SCOR" />
            <input value={minSP} onChange={(e) => setMinSP(e.target.value)} placeholder="SP" />
            <input value={minHTMS} onChange={(e) => setMinHTMS(e.target.value)} placeholder="HTMS ≥" />
            <input value={minHTMS28} onChange={(e) => setMinHTMS28(e.target.value)} placeholder="HTMS28 ≥" />
          </div>

          {/* Action Row */}
          <div className="actions">
            <button className="btnPrimary" onClick={() => loadPlayers()}>
              Primijeni
            </button>
            <button className="btn" onClick={() => setShowColumns((v) => !v)}>
              Kolone
            </button>
          </div>

          {/* Columns Picker (hidden until clicked) */}
          {showColumns && (
            <div className="columnsBox">
              <div className="columnsTitle">
                Odaberi kolone (Portal-style, gdje nema podatka prikazuje "—")
              </div>

              <div className="columnsGrid">
                {ALL_COLUMNS.map((c) => (
                  <label key={c.key} className="colItem">
                    <input type="checkbox" checked={!!visibleColumns[c.key]} onChange={() => toggleColumn(c.key)} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>

              <div className="columnsFooter">
                <button className="btn" onClick={resetColumns}>
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Error / Loading */}
          {error && <div className="errorBox">Greška: {error}</div>}
          {loading && <div className="loadingBox">Učitavanje...</div>}

          {/* Table */}
          {!loading && (
            <div className={`tableWrap ${compact ? "compact" : ""} ${wrap ? "wrap" : ""}`}>
              <table className="table">
                <thead>
                  <tr>
                    {visibleColumnList.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((p) => (
                    <tr key={`${p.id ?? ""}-${p.htid ?? ""}-${p.name ?? ""}`}>
                      {visibleColumnList.map((c) => {
                        const val = p[c.key];
                        const out = val === null || val === undefined || val === "" ? "—" : val;
                        return <td key={c.key}>{out}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .pageRoot {
          width: 100%;
        }

        /* HEADER */
        .header {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: repeating-linear-gradient(
            -45deg,
            #b23a2e 0px,
            #b23a2e 10px,
            #ffffff 10px,
            #ffffff 20px
          );
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .headerLeft {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .headerSmall {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.9;
        }

        .headerTitle {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }

        .headerRight {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .headerBtn {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* LAYOUT */
        .pageWrap {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 10px 10px 16px 0; /* no left padding */
        }

        /* SIDEBAR */
        .sidebar {
          width: 210px;
          flex: 0 0 210px;
          position: sticky;
          top: 82px;
          align-self: flex-start;
          margin-left: 0;
        }

        .sbBlock {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 0 12px 12px 0;
          padding: 12px;
        }

        .sbMiniTitle {
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .sbMiniTitle2 {
          font-weight: 800;
          font-size: 11px;
          margin-top: 10px;
          margin-bottom: 6px;
          letter-spacing: 0.4px;
          opacity: 0.85;
        }

        
        
        .sbSectionHeader{
          margin: 10px 0 6px;
          padding: 6px 8px;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          color: #111827;
          background: linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02));
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 8px;
        }
.sbSponsor {
          font-size: 13px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          margin-bottom: 4px;
        }

        .sbList {
          list-style: disc;
          padding-left: 18px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sbList a {
          color: #1a1a1a;
          text-decoration: none;
          font-size: 13px;
          opacity: 0.9;
        }

        .sbList .active a {
          font-weight: 800;
          text-decoration: underline;
        }

        .sbGap {
          height: 8px;
        }

        .sbNote {
          margin-top: 10px;
          font-size: 11px;
          opacity: 0.65;
        }

        /* MAIN */
        .main {
          flex: 1;
          min-width: 0;
        }

        .topRow {
          display: grid;
          grid-template-columns: 120px 1fr 260px;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .pillBtn {
          display: inline-block;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 0 12px 12px 0;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          font-size: 13px;
        }

        .centerInfo {
          text-align: center;
          font-weight: 700;
          opacity: 0.75;
        }

        .toggles {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          opacity: 0.85;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }

        .filters input,
        .filters select {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.65);
          font-size: 13px;
        }

        .minSkills {
          display: grid;
          grid-template-columns: 90px repeat(9, 1fr);
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        .minLabel {
          font-weight: 800;
          opacity: 0.85;
          font-size: 12px;
        }

        .minSkills input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.65);
          font-size: 13px;
        }

        .actions {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .btnPrimary {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .btn {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: rgba(255, 255, 255, 0.65);
          font-weight: 800;
          cursor: pointer;
        }

        .columnsBox {
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 0 12px 12px 0;
          background: rgba(0, 0, 0, 0.02);
          padding: 12px;
          margin-bottom: 10px;
        }

        .columnsTitle {
          font-weight: 800;
          margin-bottom: 10px;
        }

        .columnsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .colItem {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          opacity: 0.9;
        }

        .columnsFooter {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
        }

        .errorBox {
          margin: 10px 0;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.18);
          font-weight: 700;
        }

        .loadingBox {
          margin: 10px 0;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-weight: 700;
          opacity: 0.8;
        }

        .tableWrap {
          overflow: auto;
          border-radius: 0 12px 12px 0;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: rgba(255, 255, 255, 0.65);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .table th,
        .table td {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          font-size: 13px;
          white-space: nowrap;
          color: #111; /* names & values must be black (not green) */
        }

        .table th {
          font-weight: 800;
          background: rgba(0, 0, 0, 0.03);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .tableWrap.compact .table th,
        .tableWrap.compact .table td {
          padding: 7px 10px;
          font-size: 12px;
        }

        .tableWrap.wrap .table td {
          white-space: normal;
        }

        @media (max-width: 1100px) {
          .filters {
            grid-template-columns: repeat(3, 1fr);
          }
          .minSkills {
            grid-template-columns: 90px repeat(3, 1fr);
          }
          .sidebar {
            display: none;
          }
          .pageWrap {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
