import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { supabase } from "../../../lib/supabaseClient";

/**
 * A1.1 – Players page (NT/U21)
 * - Sidebar menu (Portal-style)
 * - Filters (Search, Position, Age min/max, Apply)
 * - Column selector (show/hide columns)
 * - IMPORTANT: fetch once from RPC, filters are applied client-side
 * - RPC fallback: try p_team_slug then team_slug
 */

const DEFAULT_COLUMNS = {
  full_name: true,
  pos: true,
  age: true,
  ht_id: true,
  form: true,
  stamina: true,
  gk: true,
  def: true,
  pm: true,
  wing: true,
  pass: true,
  scor: true,
  sp: true,
};

function safeNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeText(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim();
}

async function rpcListTeamPlayers(teamSlug) {
  // 1) Prefer newer param name
  let res = await supabase.rpc("list_team_players", { p_team_slug: teamSlug });
  if (!res.error) return res;

  // 2) Fallback to older param name
  const res2 = await supabase.rpc("list_team_players", { team_slug: teamSlug });
  if (!res2.error) return res2;

  // If both failed, return the first error (more likely correct)
  return res;
}

function SidebarMenu({ team }) {
  const isNT = team === "nt";
  const isU21 = team === "u21";

  const base = `/team/${team}`;

  // Only link routes that exist in repo:
  // dashboard.js, players.js, requests.js, alerts.js, transfers.js
  const ntBase = `/team/nt`;
  const u21Base = `/team/u21`;

  return (
    <div className="sidebar">
      <div className="sidebarBox">
        <div className="sidebarTitle">Hrvatska</div>

        <div className="sidebarGroup">
          <div className="sidebarLabel">Sponzori</div>
          <div className="sidebarSponsor">Zvonzi_</div>
        </div>

        <div className="sidebarGroup">
          <div className="sidebarLabel">NT</div>
          <ul className="sidebarList">
            <li className={isNT ? "active" : ""}>
              <Link href={`${ntBase}/requests`}>Zahtjevi</Link>
            </li>
            <li className="disabled">
              <span>Popisi</span>
            </li>
            <li className={isNT ? "active" : ""}>
              <Link href={`${ntBase}/players`}>Igrači</Link>
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

        <div className="sidebarGroup">
          <div className="sidebarLabel">U21</div>
          <ul className="sidebarList">
            <li className={isU21 ? "active" : ""}>
              <Link href={`${u21Base}/requests`}>Zahtjevi</Link>
            </li>
            <li className="disabled">
              <span>Popisi</span>
            </li>
            <li className={isU21 ? "active" : ""}>
              <Link href={`${u21Base}/players`}>Igrači</Link>
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

        <div className="sidebarHint">
          * Stavke označene sivo su “rezervirane za kasnije”.
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          flex: 0 0 250px;
        }
        .sidebarBox {
          border: 1px solid #e7e7e7;
          border-radius: 10px;
          padding: 12px;
          background: #fff;
        }
        .sidebarTitle {
          font-weight: 800;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .sidebarGroup {
          margin-top: 12px;
        }
        .sidebarLabel {
          font-weight: 700;
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .sidebarSponsor {
          font-family: monospace;
          padding: 8px 10px;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #fafafa;
        }
        .sidebarList {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebarList li {
          padding: 6px 8px;
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .sidebarList li a {
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .sidebarList li.active {
          background: #f2f6ff;
          border: 1px solid #dfe9ff;
          font-weight: 700;
        }
        .sidebarList li.disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .sidebarList li.disabled span {
          display: block;
        }
        .sidebarHint {
          margin-top: 12px;
          font-size: 11px;
          opacity: 0.6;
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [players, setPlayers] = useState([]);

  // UI filters
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // Applied filters (only change when clicking Apply)
  const [applied, setApplied] = useState({
    search: "",
    pos: "all",
    ageMin: null,
    ageMax: null,
  });

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Load column preferences per team
  useEffect(() => {
    if (!team) return;
    try {
      const key = `players_columns_${team}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setColumns((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_) {
      // ignore
    }
  }, [team]);

  // Save column preferences per team
  useEffect(() => {
    if (!team) return;
    try {
      const key = `players_columns_${team}`;
      localStorage.setItem(key, JSON.stringify(columns));
    } catch (_) {
      // ignore
    }
  }, [columns, team]);

  useEffect(() => {
    if (!team) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");

      const { data, error: rpcErr } = await rpcListTeamPlayers(team);

      if (cancelled) return;

      if (rpcErr) {
        setPlayers([]);
        setError(
          `Greška: ${rpcErr.message || "Ne mogu dohvatiti igrače."}`
        );
        setLoading(false);
        return;
      }

      setPlayers(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [team]);

  const positionOptions = useMemo(() => {
    const set = new Set();
    for (const p of players) {
      const v = (p.pos ?? p.position ?? "").toString().trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const q = normalizeText(applied.search);
    const aMin = applied.ageMin;
    const aMax = applied.ageMax;
    const wantPos = applied.pos;

    return players.filter((p) => {
      const name = normalizeText(p.full_name ?? p.name ?? "");
      const htid = normalizeText(p.ht_id ?? p.htid ?? "");
      const ppos = (p.pos ?? p.position ?? "").toString().trim();
      const age = safeNumber(p.age);

      // search
      if (q) {
        const hay = `${name} ${htid} ${normalizeText(ppos)}`;
        if (!hay.includes(q)) return false;
      }

      // position
      if (wantPos !== "all" && ppos !== wantPos) return false;

      // age
      if (aMin !== null && age !== null && age < aMin) return false;
      if (aMax !== null && age !== null && age > aMax) return false;

      return true;
    });
  }, [players, applied]);

  function onApply() {
    setApplied({
      search,
      pos,
      ageMin: safeNumber(ageMin),
      ageMax: safeNumber(ageMax),
    });
  }

  function toggleCol(key) {
    setColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const teamTitle = team === "nt" ? "Igrači (NT)" : team === "u21" ? "Igrači (U21)" : "Igrači";

  return (
    <Layout>
      <div className="pageWrap">
        <SidebarMenu team={team} />

        <div className="main">
          <div className="header">
            <div>
              <h1>{teamTitle}</h1>
              <div className="sub">Aktivni tim: {team}</div>
            </div>

            <div className="headerLinks">
              <Link href={`/team/${team}/dashboard`}>Natrag na module</Link>
              <span className="dot">•</span>
              <span>Popis igrača ({filteredPlayers.length})</span>
            </div>
          </div>

          {/* Filters row */}
          <div className="filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="inp"
              placeholder="Search: ime, HT ID, pozicija..."
            />

            <select
              className="inp"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
            >
              <option value="all">Pozicija (sve)</option>
              {positionOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <input
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              className="inp small"
              placeholder="Age min"
              inputMode="numeric"
            />
            <input
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              className="inp small"
              placeholder="Age max"
              inputMode="numeric"
            />

            <button className="btn" onClick={onApply}>
              Primijeni
            </button>

            <button
              className="btn ghost"
              onClick={() => setShowColumnPicker((v) => !v)}
            >
              Kolone
            </button>
          </div>

          {showColumnPicker && (
            <div className="colPicker">
              <div className="colPickerTitle">Odaberi kolone (privremeno – kao na Portal konceptu)</div>
              <div className="colGrid">
                {Object.entries({
                  full_name: "Ime",
                  pos: "Poz",
                  age: "God",
                  ht_id: "HTID",
                  form: "Fo",
                  stamina: "St",
                  gk: "GK",
                  def: "DE",
                  pm: "PM",
                  wing: "WG",
                  pass: "PS",
                  scor: "SC",
                  sp: "SP",
                }).map(([k, label]) => (
                  <label key={k} className="chk">
                    <input
                      type="checkbox"
                      checked={!!columns[k]}
                      onChange={() => toggleCol(k)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Errors / loading */}
          {error && <div className="error">{error}</div>}
          {loading && <div className="muted">Učitavanje...</div>}

          {/* Table */}
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  {columns.full_name && <th>Ime</th>}
                  {columns.pos && <th>Poz</th>}
                  {columns.age && <th>God</th>}
                  {columns.ht_id && <th>HTID</th>}
                  {columns.form && <th>Fo</th>}
                  {columns.stamina && <th>St</th>}
                  {columns.gk && <th>GK</th>}
                  {columns.def && <th>DE</th>}
                  {columns.pm && <th>PM</th>}
                  {columns.wing && <th>WG</th>}
                  {columns.pass && <th>PS</th>}
                  {columns.scor && <th>SC</th>}
                  {columns.sp && <th>SP</th>}
                </tr>
              </thead>

              <tbody>
                {!loading && filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="muted">
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => {
                    const id = p.id ?? p.player_id ?? p.ht_id ?? p.htid;
                    const playerId = p.id ?? p.player_id;

                    // Link to real player details page in this project:
                    // /players/[id].js exists and expects ?team=nt|u21
                    const href =
                      playerId !== undefined && playerId !== null
                        ? `/players/${playerId}?team=${team}`
                        : "#";

                    return (
                      <tr key={`${p.id ?? "x"}_${p.ht_id ?? "y"}`}>
                        {columns.full_name && (
                          <td>
                            {playerId ? (
                              <Link href={href}>{p.full_name ?? p.name ?? "-"}</Link>
                            ) : (
                              p.full_name ?? p.name ?? "-"
                            )}
                          </td>
                        )}
                        {columns.pos && <td>{p.pos ?? p.position ?? "-"}</td>}
                        {columns.age && <td>{p.age ?? "-"}</td>}
                        {columns.ht_id && <td>{p.ht_id ?? p.htid ?? "-"}</td>}
                        {columns.form && <td>{p.form ?? p.fo ?? "-"}</td>}
                        {columns.stamina && <td>{p.stamina ?? p.st ?? "-"}</td>}
                        {columns.gk && <td>{p.gk ?? "-"}</td>}
                        {columns.def && <td>{p.def ?? p.de ?? "-"}</td>}
                        {columns.pm && <td>{p.pm ?? "-"}</td>}
                        {columns.wing && <td>{p.wing ?? p.wg ?? "-"}</td>}
                        {columns.pass && <td>{p.pass ?? p.ps ?? "-"}</td>}
                        {columns.scor && <td>{p.scor ?? p.sc ?? "-"}</td>}
                        {columns.sp && <td>{p.sp ?? "-"}</td>}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* right spacer (future) */}
        <div className="rightSpacer" />
      </div>

      <style jsx>{`
        .pageWrap {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 16px 8px;
        }

        /* main area */
        .main {
          flex: 1 1 auto;
          min-width: 0;
          max-width: 1100px; /* margins left/right like you requested */
        }

        /* future right column */
        .rightSpacer {
          width: 250px;
          flex: 0 0 250px;
          opacity: 0.45;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }
        h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }
        .sub {
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.65;
        }
        .headerLinks {
          font-size: 12px;
          opacity: 0.75;
          display: flex;
          gap: 8px;
          align-items: center;
          white-space: nowrap;
        }
        .headerLinks a {
          text-decoration: none;
        }
        .dot {
          opacity: 0.5;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px;
          border: 1px solid #e7e7e7;
          border-radius: 10px;
          background: #fff;
          margin-bottom: 10px;
        }
        .inp {
          border: 1px solid #e3e3e3;
          border-radius: 8px;
          padding: 9px 10px;
          font-size: 13px;
          background: #fff;
          min-width: 220px;
        }
        .inp.small {
          min-width: 110px;
        }
        .btn {
          border: 1px solid #d8d8d8;
          border-radius: 8px;
          padding: 9px 12px;
          background: #111;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }
        .btn.ghost {
          background: #fff;
          color: #111;
        }

        .colPicker {
          border: 1px solid #e7e7e7;
          border-radius: 10px;
          background: #fff;
          padding: 10px;
          margin-bottom: 10px;
        }
        .colPickerTitle {
          font-weight: 800;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .colGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .chk {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          padding: 6px 8px;
          border: 1px solid #efefef;
          border-radius: 8px;
          background: #fafafa;
        }

        .error {
          border: 1px solid #ffd0d0;
          background: #fff5f5;
          color: #7a1a1a;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 10px;
          font-size: 13px;
        }
        .muted {
          font-size: 13px;
          opacity: 0.7;
          padding: 10px 0;
        }

        .tableWrap {
          border: 1px solid #e7e7e7;
          border-radius: 10px;
          overflow: auto;
          background: #fff;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        .table th,
        .table td {
          border-bottom: 1px solid #f0f0f0;
          padding: 10px 10px;
          font-size: 13px;
          text-align: left;
          white-space: nowrap;
        }
        .table th {
          background: #fafafa;
          font-weight: 800;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .table tr:hover td {
          background: #fcfcff;
        }
        .table a {
          text-decoration: none;
          font-weight: 700;
        }

        /* responsive: hide right spacer on small screens */
        @media (max-width: 1200px) {
          .rightSpacer {
            display: none;
          }
          .main {
            max-width: none;
          }
        }
        @media (max-width: 900px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
}
