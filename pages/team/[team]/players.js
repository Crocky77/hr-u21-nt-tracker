import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

/**
 * Team Players (compact portal-style list)
 *
 * FIXES:
 * - Compact table: smaller font, fixed layout, no horizontal scroll (as much as possible)
 * - Row is clickable: clicking any cell opens player details
 * - Correct back navigation: list links to /team/[team]/players/[id] (NOT /players/[id])
 * - Adds a simple header so page doesn't look empty
 * - Adds an "Advanced filters" block (portal-like minimums) - client-side filtering
 */
export default function TeamPlayersPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const team = typeof router.query.team === 'string' ? router.query.team : '';
  const isReady = router.isReady && !!team;

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Basic filters
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState(''); // '', GK, DEF, WB, IM, W, FW etc (depends on data)
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  // Advanced filters (minimums)
  const [advOpen, setAdvOpen] = useState(false);
  const [minFilters, setMinFilters] = useState({
    gk: '',
    de: '',
    pm: '',
    wg: '',
    ps: '',
    sc: '',
    sp: '',
    exp: '',
    ldr: '',
    tsi: '',
    sal: '',
    fo: '',
    st: '',
  });

  // Columns
  const ALL_COLUMNS = useMemo(
    () => [
      { key: 'full_name', short: 'Ime', title: 'Ime (full_name)', defaultOn: true, width: 220 },
      { key: 'position', short: 'Poz', title: 'Pozicija', defaultOn: true, width: 56 },
      { key: 'age_years', short: 'God', title: 'Dob (godine)', defaultOn: true, width: 56 },
      { key: 'ht_player_id', short: 'HTID', title: 'Hattrick Player ID', defaultOn: true, width: 86 },

      { key: 'salary', short: 'Sal', title: 'Plaća (salary)', defaultOn: false, width: 70 },
      { key: 'tsi', short: 'TSI', title: 'TSI', defaultOn: false, width: 70 },
      { key: 'experience', short: 'Exp', title: 'Experience', defaultOn: false, width: 62 },
      { key: 'leadership', short: 'Ldr', title: 'Leadership', defaultOn: false, width: 62 },
      { key: 'specialty', short: 'Spec', title: 'Specialty', defaultOn: false, width: 70 },

      { key: 'form', short: 'Fo', title: 'Forma (form)', defaultOn: true, width: 50 },
      { key: 'stamina', short: 'St', title: 'Stamina', defaultOn: true, width: 50 },
      { key: 'current_training', short: 'TR', title: 'Trening (current_training)', defaultOn: true, width: 64 },

      { key: 'skill_goalkeeping', short: 'GK', title: 'Goalkeeping', defaultOn: false, width: 52 },
      { key: 'skill_defending', short: 'DE', title: 'Defending', defaultOn: true, width: 52 },
      { key: 'skill_playmaking', short: 'PM', title: 'Playmaking', defaultOn: true, width: 52 },
      { key: 'skill_winger', short: 'WG', title: 'Winger', defaultOn: false, width: 52 },
      { key: 'skill_passing', short: 'PS', title: 'Passing', defaultOn: false, width: 52 },
      { key: 'skill_scoring', short: 'SC', title: 'Scoring', defaultOn: true, width: 52 },
      { key: 'skill_set_pieces', short: 'SP', title: 'Set Pieces', defaultOn: true, width: 52 },
    ],
    []
  );

  const [visibleCols, setVisibleCols] = useState(() => {
    const init = {};
    for (const c of ALL_COLUMNS) init[c.key] = !!c.defaultOn;
    return init;
  });

  const visibleColumnList = useMemo(() => ALL_COLUMNS.filter((c) => visibleCols[c.key]), [ALL_COLUMNS, visibleCols]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Fetch data
  useEffect(() => {
    if (!isReady) return;

    let ignore = false;

    async function run() {
      setLoading(true);
      setErr('');
      try {
        const { data, error } = await supabase.rpc('list_team_players', {
          p_team_slug: team,
          p_age_min: ageMin ? Number(ageMin) : null,
          p_age_max: ageMax ? Number(ageMax) : null,
          p_position: position || null,
          p_search: search?.trim() ? search.trim() : null,
          p_limit: pageSize,
          p_offset: (page - 1) * pageSize,
        });

        if (error) throw error;

        if (!ignore) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!ignore) {
          setRows([]);
          setErr(e?.message || 'Greška kod dohvaćanja igrača');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [isReady, supabase, team, ageMin, ageMax, position, search, page]);

  // Client-side advanced filtering (minimums)
  const filteredRows = useMemo(() => {
    if (!rows?.length) return [];

    const num = (v) => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const mins = {
      gk: num(minFilters.gk),
      de: num(minFilters.de),
      pm: num(minFilters.pm),
      wg: num(minFilters.wg),
      ps: num(minFilters.ps),
      sc: num(minFilters.sc),
      sp: num(minFilters.sp),
      exp: num(minFilters.exp),
      ldr: num(minFilters.ldr),
      tsi: num(minFilters.tsi),
      sal: num(minFilters.sal),
      fo: num(minFilters.fo),
      st: num(minFilters.st),
    };

    const checkMin = (value, min) => {
      if (min === null) return true;
      const n = num(value);
      if (n === null) return false;
      return n >= min;
    };

    return rows.filter((r) => {
      return (
        checkMin(r.skill_goalkeeping, mins.gk) &&
        checkMin(r.skill_defending, mins.de) &&
        checkMin(r.skill_playmaking, mins.pm) &&
        checkMin(r.skill_winger, mins.wg) &&
        checkMin(r.skill_passing, mins.ps) &&
        checkMin(r.skill_scoring, mins.sc) &&
        checkMin(r.skill_set_pieces, mins.sp) &&
        checkMin(r.experience, mins.exp) &&
        checkMin(r.leadership, mins.ldr) &&
        checkMin(r.tsi, mins.tsi) &&
        checkMin(r.salary, mins.sal) &&
        checkMin(r.form, mins.fo) &&
        checkMin(r.stamina, mins.st)
      );
    });
  }, [rows, minFilters]);

  // Helpers
  const fmt = (v, key) => {
    if (v === null || v === undefined) return '';
    if (key === 'salary') return String(v);
    if (key === 'tsi') return String(v);
    return String(v);
  };

  const rowHref = (playerId) => `/team/${team}/players/${playerId}`;

  // UI actions
  const toggleCol = (k) => setVisibleCols((prev) => ({ ...prev, [k]: !prev[k] }));

  const resetDefaultCols = () => {
    const next = {};
    for (const c of ALL_COLUMNS) next[c.key] = !!c.defaultOn;
    setVisibleCols(next);
  };

  const setMin = (k, value) => setMinFilters((p) => ({ ...p, [k]: value }));

  const resetMinFilters = () =>
    setMinFilters({
      gk: '',
      de: '',
      pm: '',
      wg: '',
      ps: '',
      sc: '',
      sp: '',
      exp: '',
      ldr: '',
      tsi: '',
      sal: '',
      fo: '',
      st: '',
    });

  return (
    <Layout>
      <Head>
        <title>Igrači — {team?.toUpperCase()}</title>
      </Head>

      <div className="pageHeader">
        <div className="pageHeaderInner">
          <div>
            <div className="pageTitle">Igrači</div>
            <div className="pageSubtitle">Aktivni tim: <b>{team}</b></div>
          </div>
          <div className="pageMeta">
            Popis igrača ({filteredRows.length})
          </div>
        </div>
      </div>

      <div className="controls">
        <input
          className="inp"
          placeholder="Search: ime, HT ID, pozicija…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="inp small"
          value={position}
          onChange={(e) => {
            setPosition(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Pozicija (sve)</option>
          <option value="GK">GK</option>
          <option value="DEF">DEF</option>
          <option value="WB">WB</option>
          <option value="IM">IM</option>
          <option value="W">W</option>
          <option value="FW">FW</option>
        </select>

        <input
          className="inp small"
          placeholder="Age min"
          value={ageMin}
          onChange={(e) => {
            setAgeMin(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="inp small"
          placeholder="Age max"
          value={ageMax}
          onChange={(e) => {
            setAgeMax(e.target.value);
            setPage(1);
          }}
        />

        <button className="btn" onClick={() => setAdvOpen((s) => !s)}>
          {advOpen ? 'Sakrij filtere' : 'Dodatni filteri'}
        </button>

        <button className="btn" onClick={() => setPage(1)} disabled={loading}>
          Primijeni
        </button>

        <button className="btn" onClick={() => setVisibleCols((p) => ({ ...p, __open: !p.__open }))}>
          Kolone
        </button>

        <div className="spacer" />

        <Link className="link" href="/dashboard">
          Natrag na module
        </Link>
      </div>

      {/* Column chooser panel */}
      {visibleCols.__open ? (
        <div className="panel">
          <div className="panelTitle">Označi kolone (što manje kolona = preglednije, bez horizontalnog skrola)</div>
          <div className="colGrid">
            {ALL_COLUMNS.map((c) => (
              <label key={c.key} className="chk">
                <input
                  type="checkbox"
                  checked={!!visibleCols[c.key]}
                  onChange={() => toggleCol(c.key)}
                />
                <span>
                  <b>{c.short}</b> <span className="muted">({c.key})</span>
                </span>
              </label>
            ))}
          </div>

          <div className="panelActions">
            <button className="btn" onClick={resetDefaultCols}>
              Reset default
            </button>
            <button className="btn" onClick={() => setVisibleCols((p) => ({ ...p, __open: false }))}>
              Zatvori
            </button>
          </div>
        </div>
      ) : null}

      {/* Advanced filters */}
      {advOpen ? (
        <div className="panel">
          <div className="panelTitle">Dodatni filteri (portal-style minimumi)</div>

          <div className="advGrid">
            <div className="advItem"><span className="advLabel">GK ≥</span><input className="inp small" value={minFilters.gk} onChange={(e) => setMin('gk', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">DE ≥</span><input className="inp small" value={minFilters.de} onChange={(e) => setMin('de', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">PM ≥</span><input className="inp small" value={minFilters.pm} onChange={(e) => setMin('pm', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">WG ≥</span><input className="inp small" value={minFilters.wg} onChange={(e) => setMin('wg', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">PS ≥</span><input className="inp small" value={minFilters.ps} onChange={(e) => setMin('ps', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">SC ≥</span><input className="inp small" value={minFilters.sc} onChange={(e) => setMin('sc', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">SP ≥</span><input className="inp small" value={minFilters.sp} onChange={(e) => setMin('sp', e.target.value)} /></div>

            <div className="advItem"><span className="advLabel">Exp ≥</span><input className="inp small" value={minFilters.exp} onChange={(e) => setMin('exp', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">Ldr ≥</span><input className="inp small" value={minFilters.ldr} onChange={(e) => setMin('ldr', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">TSI ≥</span><input className="inp small" value={minFilters.tsi} onChange={(e) => setMin('tsi', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">Sal ≥</span><input className="inp small" value={minFilters.sal} onChange={(e) => setMin('sal', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">Fo ≥</span><input className="inp small" value={minFilters.fo} onChange={(e) => setMin('fo', e.target.value)} /></div>
            <div className="advItem"><span className="advLabel">St ≥</span><input className="inp small" value={minFilters.st} onChange={(e) => setMin('st', e.target.value)} /></div>
          </div>

          <div className="panelActions">
            <button
              className="btn"
              onClick={() => {
                setPage(1);
              }}
            >
              Primijeni
            </button>
            <button className="btn" onClick={resetMinFilters}>
              Reset filtera
            </button>
          </div>
        </div>
      ) : null}

      {err ? <div className="error">Greška: {err}</div> : null}

      <div className="hint">Klik na red otvara detalje igrača</div>

      <div className="tableWrap">
        <table className="tbl">
          <thead>
            <tr>
              {visibleColumnList.map((c) => (
                <th key={c.key} title={c.title}>
                  {c.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumnList.length} className="loadingCell">Učitavam…</td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnList.length} className="emptyCell">Nema rezultata</td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="row">
                  {visibleColumnList.map((c) => (
                    <td key={c.key}>
                      <Link className="cellLink" href={rowHref(r.id)}>
                        {fmt(r[c.key], c.key)}
                      </Link>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ◀
        </button>
        <span className="pagerText">Stranica {page}</span>
        <button className="btn" disabled={loading || rows.length < pageSize} onClick={() => setPage((p) => p + 1)}>
          ▶
        </button>
      </div>

      <style jsx>{`
        .pageHeader {
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02));
          border: 1px solid rgba(0,0,0,0.06);
        }
        .pageHeaderInner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .pageTitle {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.1;
        }
        .pageSubtitle {
          margin-top: 3px;
          font-size: 12px;
          opacity: 0.75;
        }
        .pageMeta {
          font-size: 12px;
          opacity: 0.7;
          white-space: nowrap;
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }
        .spacer {
          flex: 1;
        }
        .inp {
          padding: 7px 10px;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 10px;
          font-size: 12px;
          min-width: 220px;
          background: white;
        }
        .inp.small {
          min-width: 90px;
          width: 90px;
        }
        .btn {
          padding: 7px 10px;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 10px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .link {
          font-size: 12px;
          opacity: 0.75;
          text-decoration: none;
        }
        .panel {
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 14px;
          padding: 12px;
          margin: 10px 0;
          background: rgba(0,0,0,0.015);
        }
        .panelTitle {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 10px;
          opacity: 0.8;
        }
        .colGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
        }
        .chk {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 12px;
        }
        .muted {
          opacity: 0.55;
          font-size: 11px;
        }
        .panelActions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .advGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        .advItem {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .advLabel {
          width: 52px;
          opacity: 0.75;
        }
        .error {
          margin: 10px 0;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,0,0,0.06);
          border: 1px solid rgba(255,0,0,0.15);
          font-size: 12px;
        }
        .hint {
          font-size: 12px;
          opacity: 0.65;
          margin: 8px 0;
        }
        .tableWrap {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          overflow: hidden;
          background: white;
        }
        .tbl {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 12px;
        }
        th, td {
          padding: 6px 8px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
        th {
          background: rgba(0,0,0,0.03);
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.2px;
        }
        tr.row:hover td {
          background: rgba(0,0,0,0.02);
        }
        .cellLink {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .loadingCell, .emptyCell {
          padding: 16px;
          text-align: center;
          opacity: 0.7;
        }
        .pager {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 12px 0 4px;
        }
        .pagerText {
          font-size: 12px;
          opacity: 0.75;
        }
      `}</style>
    </Layout>
  );
}
