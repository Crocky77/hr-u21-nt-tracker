import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { supabase } from "../../../lib/supabaseClient";

/* ---------------------------
   Helpers
--------------------------- */
const nrm = (v) => String(v ?? "").toLowerCase().trim();
const nnum = (v) => {
  const x = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(x) ? x : null;
};

function getVal(p, key) {
  if (!p) return null;
  return p[key] ?? null;
}

/* Map known backend column variants (compat layer) */
const ALIASES = {
  id: ["id"],
  ht_id: ["ht_id", "ht_player_id", "player_id"],
  full_name: ["full_name", "name"],
  pos: ["pos", "position"],
  age: ["age"],
  owning_team: ["owning_team", "team_name", "club_name"],
  manager: ["manager", "owner", "manager_name"],
  tsi: ["tsi"],
  wage: ["wage", "salary"],
  nationality: ["nationality", "country"],
  specialty: ["specialty", "speciality", "spec"],
  agreeability: ["agreeability"],
  aggressiveness: ["aggressiveness"],
  honesty: ["honesty"],
  leadership: ["leadership"],
  experience: ["experience"],

  form: ["form"],
  stamina: ["stamina"],
  stamina_pct: ["stamina_pct", "stamina_percent"],

  training_last: ["training_last"],
  training_now: ["training_now"],

  gk: ["gk", "skill_gk"],
  def: ["def", "skill_def"],
  pm: ["pm", "skill_pm"],
  wing: ["wing", "skill_wing"],
  pass: ["pass", "skill_pass"],
  scor: ["scor", "score", "skill_score"],
  sp: ["sp", "skill_sp"],

  htms: ["htms"],
  htms28: ["htms28"],

  updated_at: ["updated_at", "last_update", "updated"],
};

function normalizePlayer(row) {
  const p = {};
  for (const [key, variants] of Object.entries(ALIASES)) {
    for (const v of variants) {
      if (row?.[v] !== undefined && row?.[v] !== null) {
        p[key] = row[v];
        break;
      }
    }
  }

  // ensure consistent strings
  p.full_name = String(p.full_name ?? "").trim();
  p.pos = String(p.pos ?? "").trim();
  p.specialty = String(p.specialty ?? "").trim();

  return { ...row, ...p };
}

/* ---------------------------
   Columns (A1.2: logical order, NO Nation)
--------------------------- */
const COLUMN_DEFS = [
  // core identity (logical order)
  { key: "full_name", label: "Ime", compactLabel: "Ime" },
  { key: "ht_id", label: "HTID", compactLabel: "HTID" },
  { key: "specialty", label: "Specka", compactLabel: "Spec" },

  // core skills (logical order)
  { key: "gk", label: "GK", compactLabel: "GK" },
  { key: "def", label: "DEF", compactLabel: "DE" },
  { key: "wing", label: "WING", compactLabel: "WG" },
  { key: "pm", label: "PM", compactLabel: "PM" },
  { key: "pass", label: "PASS", compactLabel: "PS" },
  { key: "scor", label: "SCOR", compactLabel: "SC" },
  { key: "sp", label: "SP", compactLabel: "SP" },

  // position & age
  { key: "pos", label: "Poz", compactLabel: "Poz" },
  { key: "age", label: "Age", compactLabel: "Age" },

  // potential / points
  { key: "htms", label: "HTMS", compactLabel: "HTMS" },
  { key: "htms28", label: "HTMS28", compactLabel: "H28" },

  // condition
  { key: "form", label: "Forma", compactLabel: "Fo" },
  { key: "stamina", label: "Stamina", compactLabel: "St" },
  { key: "stamina_pct", label: "St %", compactLabel: "St%" },

  // economics
  { key: "tsi", label: "TSI", compactLabel: "TSI" },
  { key: "wage", label: "Plaća", compactLabel: "Sal" },

  // training
  { key: "training_now", label: "TR", compactLabel: "TR" },
  { key: "training_last", label: "Last TR", compactLabel: "LTR" },

  // meta (optional)
  { key: "owning_team", label: "Klub", compactLabel: "Club" },
  { key: "manager", label: "Manager", compactLabel: "Mgr" },
  { key: "agreeability", label: "Agree", compactLabel: "Agr" },
  { key: "aggressiveness", label: "Aggr", compactLabel: "Agg" },
  { key: "honesty", label: "Hon", compactLabel: "Hon" },
  { key: "leadership", label: "Lead", compactLabel: "Ld" },
  { key: "experience", label: "XP", compactLabel: "XP" },

  // updated
  { key: "updated_at", label: "Updated", compactLabel: "Upd" },
];

function defaultColumnState() {
  // Default: show only the most important columns (like Portal list)
  const onByDefault = new Set([
    "full_name",
    "ht_id",
    "specialty",
    "gk",
    "def",
    "wing",
    "pm",
    "pass",
    "scor",
    "sp",
    "age",
    "pos",
    "form",
    "stamina",
    "tsi",
  ]);

  const state = {};
  for (const c of COLUMN_DEFS) state[c.key] = onByDefault.has(c.key);
  return state;
}

/* ---------------------------
   Sidebar Menu
--------------------------- */
function SidebarMenu({ team }) {
  const ntActive = team === "nt";
  const u21Active = team === "u21";

  return (
    <aside className="sidebar">
      <div className="sb-card">
        <div className="sb-title">Hrvatska NT</div>

        <div className="sb-group">
          <div className="sb-label">Sponzori</div>
          <div className="sb-sponsor">test</div>
        </div>

        <div className="sb-group">
          <div className="sb-label">NT</div>
          <ul className="sb-list">
            <li>
              <Link legacyBehavior href="/team/nt/requests">
                <a>Zahtjevi</a>
              </Link>
            </li>
            <li className="disabled">
              <span>Popisi</span>
            </li>
            <li className={ntActive ? "active" : ""}>
              <Link legacyBehavior href="/team/nt/players">
                <a>Igrači</a>
              </Link>
            </li>
            <li className="disabled">
              <span>Upozorenja</span>
            </li>
            <li className="disabled">
              <span>Kalendar natjecanja</span>
            </li>
            <li className="disabled">
              <span>Postavke treninga</span>
            </li>
          </ul>
        </div>

        <div className="sb-divider" />

        <div className="sb-group">
          <div className="sb-label">Hrvatska U21</div>
          <ul className="sb-list">
            <li>
              <Link legacyBehavior href="/team/u21/requests">
                <a>Zahtjevi</a>
              </Link>
            </li>
            <li className="disabled">
              <span>Popisi</span>
            </li>
            <li className={u21Active ? "active" : ""}>
              <Link legacyBehavior href="/team/u21/players">
                <a>Igrači</a>
              </Link>
            </li>
            <li className="disabled">
              <span>Upozorenja</span>
            </li>
            <li className="disabled">
              <span>Kalendar natjecanja</span>
            </li>
            <li className="disabled">
              <span>Postavke treninga</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------
   Page
--------------------------- */
export default function PlayersPage() {
  const router = useRouter();
  const { team: teamSlug } = router.query;

  const pageTitle = teamSlug === "nt" ? "Igrači — NT" : "Igrači — U21";
  const pregledText = teamSlug === "nt" ? "NT Pregled" : "U21 Pregled";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [players, setPlayers] = useState([]);

  // filters (input state)
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // extra filters row (Portal-like)
  const [reqFilter, setReqFilter] = useState("all");
  const [personalFilter, setPersonalFilter] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [agreeability, setAgreeability] = useState("all");
  const [aggressiveness, setAggressiveness] = useState("all");
  const [honesty, setHonesty] = useState("all");

  // min skills
  const [minGk, setMinGk] = useState("");
  const [minDef, setMinDef] = useState("");
  const [minPm, setMinPm] = useState("");
  const [minWing, setMinWing] = useState("");
  const [minPass, setMinPass] = useState("");
  const [minScor, setMinScor] = useState("");
  const [minSp, setMinSp] = useState("");

  // applied filters (only update on Apply)
  const [applied, setApplied] = useState({
    search: "",
    position: "all",
    ageMin: null,
    ageMax: null,
    reqFilter: "all",
    personalFilter: "all",
    specialty: "all",
    agreeability: "all",
    aggressiveness: "all",
    honesty: "all",
    mins: {
      gk: null,
      def: null,
      pm: null,
      wing: null,
      pass: null,
      scor: null,
      sp: null,
    },
  });

  // UI
  const [compact, setCompact] = useState(false);
  const [columns, setColumns] = useState(defaultColumnState());

  useEffect(() => {
    if (!teamSlug) return;

    setLoading(true);
    setError("");

    supabase
      .rpc("list_team_players", {
        p_team_slug: teamSlug,
      })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || "Unknown error");
          setPlayers([]);
        } else {
          setPlayers((data || []).map(normalizePlayer));
        }
        setLoading(false);
      });
  }, [teamSlug]);

  const positionOptions = useMemo(() => {
    // Always offer the common positions, plus whatever exists in data
    const base = ["GK", "WB", "CD", "IM", "W", "FW"];
    const s = new Set(base);

    for (const p of players) {
      const v = (getVal(p, "pos") ?? "").toString().trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [players]);

  // specialty options
  const specialtyOptions = useMemo(() => {
    // Always offer all specialties + whatever exists in data
    const base = ["Quick", "Head", "Powerful", "Technical", "Unpredictable", "Supportive"];
    const s = new Set(base);

    for (const p of players) {
      const v = (getVal(p, "specialty") ?? "").toString().trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [players]);

  function applyFilters() {
    setApplied({
      search,
      position,
      ageMin: nnum(ageMin),
      ageMax: nnum(ageMax),
      reqFilter,
      personalFilter,
      specialty,
      agreeability,
      aggressiveness,
      honesty,
      mins: {
        gk: nnum(minGk),
        def: nnum(minDef),
        pm: nnum(minPm),
        wing: nnum(minWing),
        pass: nnum(minPass),
        scor: nnum(minScor),
        sp: nnum(minSp),
      },
    });
  }

  const filteredPlayers = useMemo(() => {
    const q = nrm(applied.search);
    const pos = applied.position;
    const aMin = applied.ageMin;
    const aMax = applied.ageMax;

    const sp = applied.specialty;
    const agr = applied.agreeability;
    const agg = applied.aggressiveness;
    const hon = applied.honesty;

    const mins = applied.mins;

    return players.filter((p) => {
      const name = nrm(getVal(p, "full_name"));
      const ht = nrm(getVal(p, "ht_id"));
      const pp = (getVal(p, "pos") ?? "").toString();

      // search
      if (q) {
        const hit =
          name.includes(q) ||
          ht.includes(q) ||
          nrm(pp).includes(q);
        if (!hit) return false;
      }

      // position
      if (pos !== "all" && pp !== pos) return false;

      // age
      const age = nnum(getVal(p, "age"));
      if (aMin !== null && age !== null && age < aMin) return false;
      if (aMax !== null && age !== null && age > aMax) return false;

      // specialty (A1.2: add none + all)
      const specVal = (getVal(p, "specialty") ?? "").toString();
      if (sp === "none" && specVal) return false;
      if (sp !== "all" && sp !== "none" && specVal !== sp) return false;

      // personality dropdowns (still UI-driven)
      const agrVal = (getVal(p, "agreeability") ?? "").toString();
      if (agr !== "all" && agrVal && agrVal !== agr) return false;

      const aggVal = (getVal(p, "aggressiveness") ?? "").toString();
      if (agg !== "all" && aggVal && aggVal !== agg) return false;

      const honVal = (getVal(p, "honesty") ?? "").toString();
      if (hon !== "all" && honVal && honVal !== hon) return false;

      // mins
      const gk = nnum(getVal(p, "gk"));
      const def = nnum(getVal(p, "def"));
      const pm = nnum(getVal(p, "pm"));
      const wing = nnum(getVal(p, "wing"));
      const pass = nnum(getVal(p, "pass"));
      const scor = nnum(getVal(p, "scor"));
      const spk = nnum(getVal(p, "sp"));

      if (mins.gk !== null && gk !== null && gk < mins.gk) return false;
      if (mins.def !== null && def !== null && def < mins.def) return false;
      if (mins.pm !== null && pm !== null && pm < mins.pm) return false;
      if (mins.wing !== null && wing !== null && wing < mins.wing) return false;
      if (mins.pass !== null && pass !== null && pass < mins.pass) return false;
      if (mins.scor !== null && scor !== null && scor < mins.scor) return false;
      if (mins.sp !== null && spk !== null && spk < mins.sp) return false;

      return true;
    });
  }, [players, applied]);

  const visibleCols = useMemo(() => {
    return COLUMN_DEFS.filter((c) => !!columns[c.key]);
  }, [columns]);

  return (
    <Layout>
      {/* ===== HEADER (3D + šahovnica) ===== */}
      <div className="moduleHeader">
        <div className="mh-inner">
          <div className="mh-left">
            <div className="mh-kicker">{teamSlug === "nt" ? "Hrvatska NT" : "Hrvatska U21"}</div>
            <div className="mh-title">{pregledText}</div>
          </div>

          <div className="mh-right">
            <Link legacyBehavior href="/"><a className="btnHome">Naslovnica</a></Link>
          </div>
        </div>
      </div>

      <div className="pageWrap">
        {/* ===== LEFT MENU ===== */}
        <SidebarMenu team={teamSlug} />

        {/* ===== MAIN ===== */}
        <div className="main">
          {/* ===== TOP CONTROLS ===== */}
          <div className="topRow">
            <div className="leftControls">
              <button className="btn" onClick={() => router.back()}>
                ← Natrag
              </button>

              <label className="chk">
                <input
                  type="checkbox"
                  checked={compact}
                  onChange={(e) => setCompact(e.target.checked)}
                />
                Kompaktno
              </label>
            </div>

            <button className="btn primary" onClick={applyFilters}>
              Apply
            </button>
          </div>

          {/* ===== FILTERS (Portal-like) ===== */}
          <div className="filters">
            <input
              className="inp wide"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: ime / HTID / pozicija…"
            />

            <select className="inp" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="all">Pozicija (sve)</option>
              {positionOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <input className="inp num" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Age min" />
            <input className="inp num" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Age max" />
          </div>

          {/* ===== EXTRA FILTERS ROW ===== */}
          <div className="filters2">
            <select className="inp" value={reqFilter} onChange={(e) => setReqFilter(e.target.value)}>
              <option value="all">Requirement to players</option>
              <option value="ui">UI placeholder</option>
            </select>

            <select className="inp" value={personalFilter} onChange={(e) => setPersonalFilter(e.target.value)}>
              <option value="all">Personal filter</option>
              <option value="ui">UI placeholder</option>
            </select>

            <select className="inp" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="all">Specka (sve)</option>
              <option value="none">Bez specke</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select className="inp" value={agreeability} onChange={(e) => setAgreeability(e.target.value)}>
              <option value="all">Agreeability</option>
              <option value="pleasant">pleasant</option>
              <option value="sympathetic">sympathetic</option>
              <option value="neutral">neutral</option>
              <option value="irritable">irritable</option>
              <option value="nasty">nasty</option>
            </select>

            <select className="inp" value={aggressiveness} onChange={(e) => setAggressiveness(e.target.value)}>
              <option value="all">Aggressiveness</option>
              <option value="calm">calm</option>
              <option value="balanced">balanced</option>
              <option value="temperamental">temperamental</option>
              <option value="fiery">fiery</option>
            </select>

            <select className="inp" value={honesty} onChange={(e) => setHonesty(e.target.value)}>
              <option value="all">Honesty</option>
              <option value="honest">honest</option>
              <option value="upright">upright</option>
              <option value="neutral">neutral</option>
              <option value="dishonest">dishonest</option>
            </select>
          </div>

          {/* ===== MIN SKILLS ===== */}
          <div className="mins">
            <div className="minsTitle">Min skilovi</div>
            <div className="minsGrid">
              <input className="inp num" value={minGk} onChange={(e) => setMinGk(e.target.value)} placeholder="GK" />
              <input className="inp num" value={minDef} onChange={(e) => setMinDef(e.target.value)} placeholder="DEF" />
              <input className="inp num" value={minWing} onChange={(e) => setMinWing(e.target.value)} placeholder="WING" />
              <input className="inp num" value={minPm} onChange={(e) => setMinPm(e.target.value)} placeholder="PM" />
              <input className="inp num" value={minPass} onChange={(e) => setMinPass(e.target.value)} placeholder="PASS" />
              <input className="inp num" value={minScor} onChange={(e) => setMinScor(e.target.value)} placeholder="SCOR" />
              <input className="inp num" value={minSp} onChange={(e) => setMinSp(e.target.value)} placeholder="SP" />
            </div>
          </div>

          {/* ===== COLUMN PICKER ===== */}
          <div className="colsBar">
            <div className="colsTitle">Kolone</div>
            <div className="colsWrap">
              {COLUMN_DEFS.map((c) => (
                <label key={c.key} className="colChk">
                  <input
                    type="checkbox"
                    checked={!!columns[c.key]}
                    onChange={(e) =>
                      setColumns((prev) => ({
                        ...prev,
                        [c.key]: e.target.checked,
                      }))
                    }
                  />
                  <span>{compact ? c.compactLabel : c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className={"tableWrap " + (compact ? "compact" : "")}>
            {loading ? (
              <div className="info">Loading…</div>
            ) : error ? (
              <div className="err">{error}</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    {visibleCols.map((c) => (
                      <th key={c.key}>{compact ? c.compactLabel : c.label}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredPlayers.map((p, idx) => {
                    const pid = getVal(p, "id") ?? `${getVal(p, "ht_id")}-${idx}`;
                    const htId = getVal(p, "ht_id");
                    const detailHref = htId
                      ? `/team/${teamSlug}/players/${htId}`
                      : "#";

                    return (
                      <tr key={pid}>
                        {visibleCols.map((c) => {
                          const v = getVal(p, c.key);
                          const cell = v === null || v === undefined || v === "" ? "—" : String(v);

                          // Make player name clickable
                          if (c.key === "full_name" && htId) {
                            return (
                              <td key={c.key} className="nameCell">
                                <Link legacyBehavior href={detailHref}>
                                  <a className="nameLink">{cell}</a>
                                </Link>
                              </td>
                            );
                          }

                          return <td key={c.key}>{cell}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== HEADER ===== */
        .moduleHeader {
          position: relative;
          color: #fff;
          padding: 14px 12px;
          overflow: hidden;
          border-bottom: 2px solid rgba(0,0,0,0.25);
          box-shadow: inset 0 -8px 0 rgba(0,0,0,0.15);
          /* Base (clean) gradient on the left */
          background:
            /* soft shine */
            linear-gradient(135deg,
              rgba(255,255,255,0.22) 0%,
              rgba(255,255,255,0.06) 38%,
              rgba(0,0,0,0.12) 100%),
            /* hide pattern on the left, reveal to the right */
            linear-gradient(to right,
              rgba(160,0,0,1) 0%,
              rgba(160,0,0,1) 34%,
              rgba(160,0,0,0.00) 72%),
            /* BIG squares (mid-right) */
            linear-gradient(45deg,
              rgba(215,25,32,0.45) 25%, rgba(255,255,255,0.45) 25%,
              rgba(255,255,255,0.45) 50%, rgba(215,25,32,0.45) 50%,
              rgba(215,25,32,0.45) 75%, rgba(255,255,255,0.45) 75%,
              rgba(255,255,255,0.45) 100%),
            /* SMALL squares (far-right stronger) */
            linear-gradient(45deg,
              rgba(215,25,32,0.70) 25%, rgba(255,255,255,0.70) 25%,
              rgba(255,255,255,0.70) 50%, rgba(215,25,32,0.70) 50%,
              rgba(215,25,32,0.70) 75%, rgba(255,255,255,0.70) 75%,
              rgba(255,255,255,0.70) 100%),
            /* deep red base */
            linear-gradient(90deg, #7a0000 0%, #b30000 65%, #d71920 100%);
          background-size: auto, auto, 84px 84px, 44px 44px, auto;
          background-position: 0 0, 0 0, 72% 0, 88% 0, 0 0;
        }

        /* shine layer */
        .moduleHeader:before {
          content: "";
          position: absolute;
          top: -60%;
          left: -20%;
          width: 70%;
          height: 200%;
          transform: rotate(18deg);
          background: linear-gradient(
            to right,
            rgba(255,255,255,0.18),
            rgba(255,255,255,0.02)
          );
          pointer-events: none;
        }

        .mh-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .mh-kicker {
          font-size: 12px;
          opacity: 0.95;
          letter-spacing: 0.04em;
          font-weight: 800;
        }
        .mh-title {
          font-size: 22px;
          font-weight: 900;
          text-shadow: 0 2px 0 rgba(0,0,0,0.35);
        }

        .btnHome {
          display: inline-block;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.35);
          background: rgba(0,0,0,0.20);
          color: #fff;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 2px 0 rgba(0,0,0,0.35);
        }
        .btnHome:hover { background: rgba(0,0,0,0.28); }

        /* ===== LAYOUT ===== */
        .pageWrap {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 0 10px 16px 0;
          width: 100%;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          flex: 0 0 265px;
          width: 265px;
        }
        .sb-card {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 12px;
        }
        .sb-title {
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 6px;
        }
        .sb-label {
          font-size: 12px;
          font-weight: 900;
          text-transform: none;
          letter-spacing: 0.02em;
          color: #333;
          margin: 14px 0 8px;
        }
        .sb-sponsor {
          font-weight: 700;
          color: #444;
          padding: 8px 10px;
          border-radius: 10px;
          background: #f6f6f6;
          border: 1px dashed #ddd;
        }
        .sb-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sb-list li {
          margin: 4px 0;
        }
        .sb-list a {
          display: block;
          padding: 8px 10px;
          border-radius: 10px;
          text-decoration: none;
          color: #222;
          font-weight: 800;
          background: #fafafa;
          border: 1px solid #eee;
        }
        .sb-list a:hover {
          background: #f0f0f0;
        }
        .sb-list li.active a {
          background: #1f7a3a;
          color: #fff;
          border-color: #1f7a3a;
        }
        .sb-list li.disabled span {
          display: block;
          padding: 8px 10px;
          border-radius: 10px;
          color: #aaa;
          background: #fbfbfb;
          border: 1px solid #f0f0f0;
          font-weight: 700;
        }
        .sb-divider {
          height: 1px;
          background: #e9e9e9;
          margin: 18px 0;
        }

        /* ===== CONTENT ===== */
        .main {
          flex: 1 1 auto;
          min-width: 0;
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 10px 0 10px;
        }
        .leftControls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-weight: 800;
        }
        .btn:hover { background: #f4f4f4; }
        .btn.primary {
          background: #0b5;
          border-color: #0b5;
          color: #fff;
        }
        .btn.primary:hover { background: #0a4; }

        .chk {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          font-weight: 800;
          color: #333;
        }

        .filters, .filters2 {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .inp {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 8px 10px;
          background: #fff;
          font-weight: 700;
        }
        .inp.wide { min-width: 260px; flex: 1 1 260px; }
        .inp.num { width: 90px; }

        .mins {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .minsTitle {
          font-weight: 900;
          margin-bottom: 8px;
        }
        .minsGrid {
          display: grid;
          grid-template-columns: repeat(7, minmax(70px, 1fr));
          gap: 8px;
        }

        .colsBar {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .colsTitle {
          font-weight: 900;
          margin-bottom: 8px;
        }
        .colsWrap {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
        }
        .colChk {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          color: #333;
        }

        .tableWrap {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow-x: auto;
        }
        .tbl {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .tbl th, .tbl td {
          border-bottom: 1px solid #f0f0f0;
          padding: 6px 8px;
          text-align: center;
          white-space: nowrap;
        }
        .tableWrap.compact .tbl th,
        .tableWrap.compact .tbl td {
          padding: 4px 6px;
          font-size: 12px;
        }

        .nameCell { text-align: left; }
        .nameLink {
          color: #0b5;
          font-weight: 900;
          text-decoration: none;
        }
        .nameLink:hover { text-decoration: underline; }

        .info { padding: 14px; font-weight: 800; }
        .err { padding: 14px; color: #b00; font-weight: 900; }

        @media (max-width: 1100px) {
          .sidebar { display: none; }
          .pageWrap { padding: 0 10px 16px; }
        }
      `}</style>
    </Layout>
  );
}
