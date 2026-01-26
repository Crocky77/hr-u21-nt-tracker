import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout"; // zadrži kao i do sada
import { supabase } from "../../../lib/supabaseClient"; // zadrži kao i do sada
import TrackerSidebar from "../../../components/TrackerSidebar";

/* ---------------------------
   Helpers
---------------------------- */
const nrm = (v) => String(v ?? "").toLowerCase().trim();
const nnum = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const getVal = (p, key) => {
  const map = {
    full_name: ["full_name", "name"],
    pos: ["pos", "position"],
    age: ["age", "age_years"],
    ht_id: ["ht_id", "htid", "ht_player_id"],
    form: ["form", "fo"],
    stamina: ["stamina", "st"],
    tsi: ["tsi"],
    wage: ["wage", "salary"],
    nationality: ["nationality", "country"],
    specialty: ["specialty", "spec", "specka"],
    agreeability: ["agreeability"],
    aggressiveness: ["aggressiveness"],
    honesty: ["honesty"],
    leadership: ["leadership"],
    experience: ["experience", "xp"],
    gk: ["gk", "skill_gk"],
    def: ["def", "de", "skill_def"],
    pm: ["pm", "skill_pm"],
    wing: ["wing", "wg", "skill_wing"],
    pass: ["pass", "ps", "skill_pass"],
    scor: ["scor", "sc", "skill_score"],
    sp: ["sp", "skill_sp"],
    training_now: ["training_now"],
    training_last: ["training_last"],
    stamina_pct: ["stamina_pct"],
    htms: ["htms", "ability_htms"],
    htms28: ["htms28", "potential_htms", "htms_28"],
    updated_at: ["updated_at", "last_update", "scouted_at"],
    owning_team: ["owning_team", "team_name", "club_name"],
    manager: ["manager", "owner", "user_name"],
  };

  const keys = map[key] || [key];
  for (const k of keys) {
    if (p && Object.prototype.hasOwnProperty.call(p, k) && p[k] != null) return p[k];
  }
  return null;
};

/* ---------------------------
   Dropdown options (UI)
---------------------------- */
const ALL_POSITIONS = ["GK","WB","CD","OCD","WING","IM","IMTW","WTM","OFFIM","PDIM","FORW","FTW","PNF","TDF"];
const ALL_SPECIALTIES = [
  { value: "all", label: "Speciality (all)" },
  { value: "none", label: "Bez specke" },
  { value: "Q", label: "Q (brz)" },
  { value: "U", label: "U (nepredvidljiv)" },
  { value: "T", label: "T (tehničar)" },
  { value: "P", label: "P (snažan)" },
  { value: "H", label: "H (glavonja)" },
];

async function rpcListTeamPlayers(teamSlug) {
  let r = await supabase.rpc("list_team_players", { p_team_slug: teamSlug });
  if (!r.error) return r;
  return supabase.rpc("list_team_players", { team_slug: teamSlug });
}

/* ---------------------------
   Columns (ostavljam široko kao prije)
---------------------------- */
const COLUMN_DEFS = [
  { key: "full_name", label: "Ime", compactLabel: "Ime" },
  { key: "pos", label: "Poz", compactLabel: "Poz" },
  { key: "age", label: "Age", compactLabel: "Age" },
  { key: "ht_id", label: "HTID", compactLabel: "HTID" },
  { key: "owning_team", label: "Owning team", compactLabel: "Club" },
  { key: "manager", label: "Manager", compactLabel: "Mgr" },
  { key: "tsi", label: "TSI", compactLabel: "TSI" },
  { key: "wage", label: "Salary", compactLabel: "Sal" },
  { key: "specialty", label: "Speciality", compactLabel: "Spec" },
  { key: "agreeability", label: "Agreeability", compactLabel: "Agr" },
  { key: "aggressiveness", label: "Aggressiveness", compactLabel: "Agg" },
  { key: "honesty", label: "Honesty", compactLabel: "Hon" },
  { key: "leadership", label: "Leadership", compactLabel: "Lead" },
  { key: "experience", label: "Experience", compactLabel: "XP" },
  { key: "form", label: "Form", compactLabel: "Fo" },
  { key: "stamina", label: "Stamina", compactLabel: "St" },
  { key: "stamina_pct", label: "St %", compactLabel: "St%" },
  { key: "training_now", label: "Current training", compactLabel: "TR" },
  { key: "training_last", label: "Last training", compactLabel: "Last TR" },
  { key: "htms", label: "Ability HTMS", compactLabel: "HTMS" },
  { key: "htms28", label: "Potential HTMS", compactLabel: "HTMS28" },
  { key: "gk", label: "GK", compactLabel: "GK" },
  { key: "def", label: "DEF", compactLabel: "DE" },
  { key: "pm", label: "PM", compactLabel: "PM" },
  { key: "wing", label: "WING", compactLabel: "WG" },
  { key: "pass", label: "PASS", compactLabel: "PS" },
  { key: "scor", label: "SCOR", compactLabel: "SC" },
  { key: "sp", label: "SP", compactLabel: "SP" },
  { key: "updated_at", label: "Updated", compactLabel: "Upd" },
];

function defaultColumnState() {
  const state = {};
  for (const c of COLUMN_DEFS) state[c.key] = true; // (Task 3 ćemo promijeniti default set)
  return state;
}

/* ---------------------------
   Page
---------------------------- */
export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const teamSlug = useMemo(() => {
    const t = (team || "").toString().toLowerCase();
    return t === "nt" ? "nt" : "u21";
  }, [team]);

  const pageTitle = teamSlug === "nt" ? "Igrači — NT" : "Igrači — U21";
  const pregledText = teamSlug === "nt" ? "NT Pregled" : "U21 Pregled";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [players, setPlayers] = useState([]);

  // local filters (inputs)
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // extra portal-like filters (inputs)
  const [reqFilter, setReqFilter] = useState("all"); // UI placeholder
  const [personalFilter, setPersonalFilter] = useState("all"); // UI placeholder

  const [specialty, setSpecialty] = useState("all");
  const [agreeability, setAgreeability] = useState("all");
  const [aggressiveness, setAggressiveness] = useState("all");
  const [honesty, setHonesty] = useState("all");

  const [minGk, setMinGk] = useState("");
  const [minDef, setMinDef] = useState("");
  const [minPm, setMinPm] = useState("");
  const [minWing, setMinWing] = useState("");
  const [minPass, setMinPass] = useState("");
  const [minScor, setMinScor] = useState("");
  const [minSp, setMinSp] = useState("");
  const [minHTMS, setMinHTMS] = useState("");
  const [minHTMS28, setMinHTMS28] = useState("");

  // applied filters (only change on Apply)
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
      gk: null, def: null, pm: null, wing: null, pass: null, scor: null, sp: null,
      htms: null, htms28: null
    }
  });

  // columns
  const [columns, setColumns] = useState(() => defaultColumnState());
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // table compaction controls
  const [compact, setCompact] = useState(true);
  const [wrapCells, setWrapCells] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");

      const { data, error } = await rpcListTeamPlayers(teamSlug);
      if (!mounted) return;

      if (error) {
        setPlayers([]);
        setError(error.message || "Greška kod dohvaćanja igrača.");
        setLoading(false);
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      const seen = new Set();
      const deduped = [];
      for (const r of rows) {
        const key = (getVal(r, "ht_id") ?? r?.id ?? "").toString();
        if (!key) { deduped.push(r); continue; }
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(r);
      }
      setPlayers(deduped);
      setLoading(false);
    }
    run();
    return () => { mounted = false; };
  }, [teamSlug]);

  const positionOptions = useMemo(() => {
    const s = new Set(ALL_POSITIONS);
    for (const p of players) {
      const v = (getVal(p, "pos") ?? "").toString().trim();
      if (v) s.add(v);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [players]);

  const specialtyOptions = useMemo(() => ALL_SPECIALTIES, []);

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
        htms: nnum(minHTMS),
        htms28: nnum(minHTMS28),
      }
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

      if (q) {
        const hay = `${name} ${ht} ${nrm(pp)}`;
        if (!hay.includes(q)) return false;
      }

      if (pos !== "all" && pp !== pos) return false;

      const age = nnum(getVal(p, "age"));
      if (aMin != null && age != null && age < aMin) return false;
      if (aMax != null && age != null && age > aMax) return false;

      const specVal = (getVal(p, "specialty") ?? "").toString().trim();
      if (sp !== "all") {
        if (sp === "none") {
          if (specVal !== "") return false;
        } else {
          if (specVal !== sp) return false;
        }
      }

      const agrVal = (getVal(p, "agreeability") ?? "").toString();
      if (agr !== "all" && agrVal && agrVal !== agr) return false;

      const aggVal = (getVal(p, "aggressiveness") ?? "").toString();
      if (agg !== "all" && aggVal && aggVal !== agg) return false;

      const honVal = (getVal(p, "honesty") ?? "").toString();
      if (hon !== "all" && honVal && honVal !== hon) return false;

      const checkMin = (key, min) => {
        if (min == null) return true;
        const v = nnum(getVal(p, key));
        if (v == null) return true;
        return v >= min;
      };

      if (!checkMin("gk", mins.gk)) return false;
      if (!checkMin("def", mins.def)) return false;
      if (!checkMin("pm", mins.pm)) return false;
      if (!checkMin("wing", mins.wing)) return false;
      if (!checkMin("pass", mins.pass)) return false;
      if (!checkMin("scor", mins.scor)) return false;
      if (!checkMin("sp", mins.sp)) return false;
      if (!checkMin("htms", mins.htms)) return false;
      if (!checkMin("htms28", mins.htms28)) return false;

      return true;
    });
  }, [players, applied]);

  function toggleCol(key) {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const visibleCols = useMemo(() => {
    return COLUMN_DEFS.filter((c) => !!columns[c.key]);
  }, [columns]);

  return (
    <Layout>
      {/* HEADER – ostaje kakav je sada (header standard je sljedeći task) */}
      <div className="moduleHeader">
        <div className="mh-inner">
          <div className="mh-left">
            <div className="mh-kicker">Hrvatski Tracker</div>
            <div className="mh-title">{pageTitle}</div>
          </div>

          <div className="mh-right">
            <Link legacyBehavior href={`/team/${teamSlug}/dashboard`}>
              <a className="mh-btn">{pregledText}</a>
            </Link>
            <Link legacyBehavior href="/">
              <a className="mh-btn ghost">Naslovnica</a>
            </Link>
          </div>
        </div>
      </div>

      {/* LAYOUT: sidebar skroz lijevo + široki main */}
      <div className="pageWrap">
        <TrackerSidebar />

        <div className="main">
          <div className="topRow">
            <Link legacyBehavior href={`/team/${teamSlug}/dashboard`}>
              <a className="bigLink">Moduli</a>
            </Link>

            <div className="topInfo">
              Ukupno: <b>{filteredPlayers.length}</b>
            </div>

            <div className="toggles">
              <label className="toggle">
                <input type="checkbox" checked={compact} onChange={() => setCompact(v => !v)} />
                <span>Kompaktno</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={wrapCells} onChange={() => setWrapCells(v => !v)} />
                <span>Wrap</span>
              </label>
            </div>
          </div>

          {/* Portal-like dodatni filteri (placeholderi) */}
          <div className="filters portalLine">
            <select className="inp" value={reqFilter} onChange={(e) => setReqFilter(e.target.value)}>
              <option value="all">Requirement to players</option>
              <option value="ui">UI placeholder</option>
            </select>

            <select className="inp" value={personalFilter} onChange={(e) => setPersonalFilter(e.target.value)}>
              <option value="all">Personal filter</option>
              <option value="ui">UI placeholder</option>
            </select>

            <select className="inp" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {ALL_SPECIALTIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select className="inp" value={agreeability} onChange={(e) => setAgreeability(e.target.value)}>
              <option value="all">Agreeability</option>
              <option value="pleasant">pleasant</option>
              <option value="sympathetic">sympathetic</option>
              <option value="neutral">neutral</option>
              <option value="nasty">nasty</option>
            </select>

            <select className="inp" value={aggressiveness} onChange={(e) => setAggressiveness(e.target.value)}>
              <option value="all">Aggressiveness</option>
              <option value="calm">calm</option>
              <option value="balanced">balanced</option>
              <option value="aggressive">aggressive</option>
            </select>

            <select className="inp" value={honesty} onChange={(e) => setHonesty(e.target.value)}>
              <option value="all">Honesty</option>
              <option value="honest">honest</option>
              <option value="neutral">neutral</option>
              <option value="dishonest">dishonest</option>
            </select>
          </div>

          {/* Glavni filteri */}
          <div className="filters">
            <input
              className="inp wide"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: ime / HTID / pozicija…"
            />

            <select className="inp" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="all">Pozicija (sve)</option>
              {useMemo(() => {
                const s = new Set(ALL_POSITIONS);
                for (const p of players) {
                  const v = (getVal(p, "pos") ?? "").toString().trim();
                  if (v) s.add(v);
                }
                return Array.from(s).sort((a, b) => a.localeCompare(b));
              }, [players]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <input className="inp small" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Age min" inputMode="numeric" />
            <input className="inp small" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Age max" inputMode="numeric" />

            <div className="mins">
              <span className="minsLabel">Min:</span>
              <input className="inp xsmall" value={minGk} onChange={(e) => setMinGk(e.target.value)} placeholder="GK" inputMode="numeric" />
              <input className="inp xsmall" value={minDef} onChange={(e) => setMinDef(e.target.value)} placeholder="DE" inputMode="numeric" />
              <input className="inp xsmall" value={minPm} onChange={(e) => setMinPm(e.target.value)} placeholder="PM" inputMode="numeric" />
              <input className="inp xsmall" value={minWing} onChange={(e) => setMinWing(e.target.value)} placeholder="WG" inputMode="numeric" />
              <input className="inp xsmall" value={minPass} onChange={(e) => setMinPass(e.target.value)} placeholder="PS" inputMode="numeric" />
              <input className="inp xsmall" value={minScor} onChange={(e) => setMinScor(e.target.value)} placeholder="SC" inputMode="numeric" />
              <input className="inp xsmall" value={minSp} onChange={(e) => setMinSp(e.target.value)} placeholder="SP" inputMode="numeric" />
              <input className="inp small" value={minHTMS} onChange={(e) => setMinHTMS(e.target.value)} placeholder="HTMS ≥" inputMode="numeric" />
              <input className="inp small" value={minHTMS28} onChange={(e) => setMinHTMS28(e.target.value)} placeholder="HTMS28 ≥" inputMode="numeric" />
            </div>

            <button className="btn" onClick={applyFilters}>Primijeni</button>
            <button className="btn ghost" onClick={() => setShowColumnPicker((v) => !v)}>Kolone</button>
          </div>

          {/* Odabir kolona */}
          {showColumnPicker && (
            <div className="colPicker">
              <div className="colPickerTitle">Odaberi kolone (gdje nema podatka prikazuje “—”)</div>
              <div className="colGrid">
                {COLUMN_DEFS.map((c) => (
                  <label key={c.key} className="chk">
                    <input type="checkbox" checked={!!columns[c.key]} onChange={() => toggleCol(c.key)} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="errorBox">
              <b>Greška:</b> {error}
            </div>
          )}

          {loading && <div className="muted">Učitavanje…</div>}

          {/* Tablica */}
          <div className={`tableWrap ${compact ? "compact" : ""} ${wrapCells ? "wrap" : ""}`}>
            <table className="table">
              <thead>
                <tr>
                  {visibleCols.map((c) => (
                    <th key={c.key}>{compact ? (c.compactLabel ?? c.label) : c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && filteredPlayers.length === 0 ? (
                  <tr>
                    <td className="muted" colSpan={visibleCols.length || 1}>
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => {
                    const pid = p?.id ?? p?.player_id ?? null;
                    const href = pid ? `/players/${pid}?team=${teamSlug}` : "#";

                    return (
                      <tr key={`${pid ?? "x"}_${getVal(p, "ht_id") ?? "y"}`}>
                        {visibleCols.map((c) => {
                          const v = getVal(p, c.key);
                          const display = (v === null || v === undefined || v === "") ? "—" : String(v);

                          if (c.key === "full_name") {
                            return (
                              <td key={c.key} className="nameCell">
                                {pid ? (
                                  <Link legacyBehavior href={href}>
                                    <a className="nameLink">{display}</a>
                                  </Link>
                                ) : (
                                  display
                                )}
                              </td>
                            );
                          }
                          return <td key={c.key}>{display}</td>;
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Styles – zadržavam postojeće + layout za sidebar */}
      <style jsx>{`
        .moduleHeader {
          position: relative;
          color: #fff;
          padding: 14px 12px;
          overflow: hidden;
          border-bottom: 2px solid rgba(0,0,0,0.25);
          box-shadow: inset 0 -8px 0 rgba(0,0,0,0.15);
          background:
            linear-gradient(135deg,
              rgba(255,255,255,0.22) 0%,
              rgba(255,255,255,0.06) 35%,
              rgba(0,0,0,0.10) 100%);
        }
        .mh-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .mh-kicker {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.92;
          text-shadow: 0 2px 0 rgba(0,0,0,0.25);
        }
        .mh-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.2px;
          margin-top: 2px;
          text-shadow: 0 3px 0 rgba(0,0,0,0.28);
        }
        .mh-right {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .mh-btn {
          display: inline-block;
          background: rgba(0,0,0,0.80);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 3px 0 rgba(0,0,0,0.25);
          color: #fff;
        }
        .mh-btn.ghost {
          background: rgba(255,255,255,0.92);
          color: #111;
          border: 1px solid rgba(0,0,0,0.20);
        }

        .pageWrap {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 0 10px 16px 0;
          width: 100%;
        }

        .main {
          flex: 1 1 auto;
          min-width: 0;
          padding-left: 10px;
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 8px 0 10px;
        }
        .bigLink {
          display: inline-block;
          background: #111;
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 3px 0 rgba(0,0,0,0.18);
        }
        .topInfo { font-size: 13px; opacity: 0.8; }
        .toggles { display: flex; gap: 10px; align-items: center; }
        .toggle { display:flex; gap:6px; align-items:center; font-size: 12px; opacity: 0.85; }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .filters.portalLine {
          border-style: dashed;
        }
        .inp {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 13px;
          background: #fff;
        }
        .inp.wide { min-width: 280px; }
        .inp.small { width: 110px; }
        .inp.xsmall { width: 72px; }
        .mins { display:flex; flex-wrap: wrap; align-items: center; gap: 6px; }
        .minsLabel { font-weight: 900; font-size: 12px; opacity: 0.7; }

        .btn {
          border: 1px solid #111;
          background: #111;
          color: #fff;
          border-radius: 10px;
          padding: 9px 12px;
          font-weight: 900;
          cursor: pointer;
        }
        .btn.ghost {
          border: 1px solid #ddd;
          background: #fff;
          color: #111;
        }

        .colPicker {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .colPickerTitle { font-weight: 900; margin-bottom: 8px; font-size: 13px; }
        .colGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .chk {
          display: flex;
          gap: 8px;
          align-items: center;
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 7px 8px;
          font-size: 13px;
        }

        .errorBox {
          background: #fff2f2;
          border: 1px solid #ffd0d0;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 10px;
          color: #7a1a1a;
        }
        .muted { opacity: 0.7; padding: 8px 0; }

        .tableWrap {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          overflow: hidden;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          border-bottom: 1px solid #f0f0f0;
          text-align: left;
          padding: 10px 10px;
          white-space: nowrap;
          font-size: 13px;
        }
        .table thead th {
          position: sticky;
          top: 0;
          background: #fafafa;
          font-weight: 900;
          z-index: 1;
        }
        .nameLink {
          text-decoration: none;
          font-weight: 900;
          color: #111;
        }
        .nameLink:hover { text-decoration: underline; }

        .tableWrap.compact .table th,
        .tableWrap.compact .table td {
          padding: 7px 8px;
          font-size: 12px;
        }
        .tableWrap.wrap .table th,
        .tableWrap.wrap .table td {
          white-space: normal;
        }

        @media (max-width: 1100px) {
          .sidebar { display:none; }
        }
      `}</style>
    </Layout>
  );
}
