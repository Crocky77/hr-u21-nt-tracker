import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import supabase from '../../../utils/supabaseClient';

/**
 * Team Players (compact portal-style list)
 *
 * Fixes requested:
 * - smaller font, narrower columns, no horizontal scroll by default
 * - short column labels (TR, HTID, Fo, St, ...)
 * - row clickable => opens player details
 * - back navigation keeps team context (NT stays NT, U21 stays U21)
 *
 * NOTE:
 * - We do NOT use @supabase/auth-helpers-react (it breaks Vercel build in this repo)
 * - We use our shared utils/supabaseClient.js instead
 */

const DEFAULT_COLUMNS = [
  'full_name',
  'position',
  'age_years',
  'ht_player_id',
  'form',
  'stamina',
  'current_training',
  'skill_defending',
  'skill_playmaking',
  'skill_scoring',
  'skill_set_pieces',
];

const ALL_COLUMNS = [
  { key: 'full_name', label: 'Ime', hint: '(full_name)' },
  { key: 'position', label: 'Poz', hint: '(position)' },
  { key: 'age_years', label: 'God', hint: '(age_years)' },
  { key: 'ht_player_id', label: 'HTID', hint: '(ht_player_id)' },
  { key: 'salary', label: 'Sal', hint: '(salary)' },
  { key: 'form', label: 'Fo', hint: '(form)' },
  { key: 'stamina', label: 'St', hint: '(stamina)' },
  { key: 'current_training', label: 'TR', hint: '(current_training)' },

  { key: 'skill_goalkeeping', label: 'GK', hint: '(skill_goalkeeping)' },
  { key: 'skill_defending', label: 'DE', hint: '(skill_defending)' },
  { key: 'skill_playmaking', label: 'PM', hint: '(skill_playmaking)' },
  { key: 'skill_winger', label: 'WG', hint: '(skill_winger)' },
  { key: 'skill_passing', label: 'PS', hint: '(skill_passing)' },
  { key: 'skill_scoring', label: 'SC', hint: '(skill_scoring)' },
  { key: 'skill_set_pieces', label: 'SP', hint: '(skill_set_pieces)' },
];

function safeStr(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function numOrEmpty(v) {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
}

function positionLabel(pos) {
  if (!pos) return '';
  const p = String(pos).toUpperCase().trim();
  return p;
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  // Columns UI
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  const selectedColumnSet = useMemo(() => new Set(selectedColumns), [selectedColumns]);

  const teamSlug = useMemo(() => {
    if (!team) return '';
    return String(team).toLowerCase();
  }, [team]);

  const title = useMemo(() => {
    const t = teamSlug === 'u21' ? 'Igrači (U21)' : teamSlug === 'nt' ? 'Igrači (NT)' : 'Igrači';
    return t;
  }, [teamSlug]);

  // IMPORTANT: When navigating back from player details, keep team context.
  // We'll include `team` in the player details URL as a query (so details page can return correctly),
  // AND we keep the current list route as /team/[team]/players.
  const openPlayer = (playerId) => {
    if (!playerId) return;
    router.push(`/players/${playerId}?team=${encodeURIComponent(teamSlug || '')}`);
  };

  const resetColumns = () => setSelectedColumns(DEFAULT_COLUMNS);

  const toggleColumn = (key) => {
    setSelectedColumns((prev) => {
      const set = new Set(prev);
      if (set.has(key)) set.delete(key);
      else set.add(key);

      // Keep at least one column
      const next = Array.from(set);
      return next.length ? next : prev;
    });
  };

  const buildRpcParams = () => {
    // list_team_players(p_team_slug, p_age_min, p_age_max, p_position, p_search, p_limit, p_offset)
    return {
      p_team_slug: teamSlug || null,
      p_age_min: ageMin === '' ? null : Number(ageMin),
      p_age_max: ageMax === '' ? null : Number(ageMax),
      p_position: position === '' ? null : position,
      p_search: search === '' ? null : search,
      p_limit: 100,
      p_offset: 0,
    };
  };

  const fetchPlayers = async () => {
    if (!teamSlug) return;

    setLoading(true);
    setError('');

    try {
      // 1) Main list
      const params = buildRpcParams();
      const { data, error: rpcError } = await supabase.rpc('list_team_players', params);

      if (rpcError) {
        throw rpcError;
      }

      const list = Array.isArray(data) ? data : [];
      setPlayers(list);

      // 2) Total count (optional RPC - safe fallback)
      // If you have a dedicated count RPC later, we can plug it here.
      setTotal(list.length);
    } catch (e) {
      setPlayers([]);
      setTotal(0);
      setError(`Greška kod dohvaćanja igrača: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when the dynamic route param is ready
    if (!router.isReady) return;
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, teamSlug]);

  const applyFilters = () => fetchPlayers();

  const availablePositions = useMemo(() => {
    // Build from current list so the dropdown is always valid.
    const set = new Set();
    for (const p of players) {
      if (p?.position) set.add(positionLabel(p.position));
    }
    return Array.from(set).sort();
  }, [players]);

  const columnsToRender = useMemo(() => {
    // Keep the rendering order stable according to ALL_COLUMNS, but only those selected.
    const ordered = [];
    for (const c of ALL_COLUMNS) {
      if (selectedColumnSet.has(c.key)) ordered.push(c);
    }
    return ordered;
  }, [selectedColumnSet]);

  return (
    <Layout>
      <Head>
        <title>{title} - Hrvatski U21/NT Tracker</title>
      </Head>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>{title}</h1>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Aktivni tim: <b>{teamSlug || '-'}</b>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.75 }}>
            Popis igrača ({total})
          </div>
        </div>

        {/* Filters bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search: ime, HT ID, pozicija..."
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              minWidth: 230,
            }}
          />

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              minWidth: 130,
            }}
          >
            <option value="">Pozicija (sve)</option>
            {availablePositions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            placeholder="Age min"
            inputMode="numeric"
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              width: 90,
            }}
          />
          <input
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            placeholder="Age max"
            inputMode="numeric"
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 10px',
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.15)',
              width: 90,
            }}
          />

          <button
            onClick={applyFilters}
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'rgba(0,0,0,0.03)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Primijeni
          </button>

          <button
            onClick={() => setColumnsOpen((v) => !v)}
            style={{
              height: 30,
              fontSize: 12,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              background: 'rgba(0,0,0,0.03)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Kolone
          </button>

          <div style={{ marginLeft: 'auto', fontSize: 12 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', opacity: 0.75 }}>
              Natrag na module
            </Link>
          </div>
        </div>

        {columnsOpen && (
          <div
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: 'rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                Označi kolone (što manje kolona = preglednije, bez horizontalnog skrola)
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={resetColumns}
                  style={{
                    height: 28,
                    fontSize: 12,
                    padding: '0 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.15)',
                    background: 'rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Reset default
                </button>
                <button
                  onClick={() => setColumnsOpen(false)}
                  style={{
                    height: 28,
                    fontSize: 12,
                    padding: '0 10px',
                    borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.15)',
                    background: 'rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Zatvori
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {ALL_COLUMNS.map((c) => (
                <label key={c.key} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={selectedColumnSet.has(c.key)}
                    onChange={() => toggleColumn(c.key)}
                  />
                  <span>
                    <b>{c.label}</b> <span style={{ opacity: 0.6 }}>{c.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Klik na red otvara detalje igrača</div>

        {/* Table */}
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
                  {columnsToRender.map((c) => (
                    <th
                      key={c.key}
                      style={{
                        textAlign: c.key === 'full_name' ? 'left' : 'center',
                        padding: '8px 8px',
                        borderBottom: '1px solid rgba(0,0,0,0.10)',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                      }}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={columnsToRender.length} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>
                      Učitavam...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={columnsToRender.length} style={{ padding: 12, color: '#b00020' }}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && players.length === 0 && (
                  <tr>
                    <td colSpan={columnsToRender.length} style={{ padding: 12, textAlign: 'center', opacity: 0.8 }}>
                      Nema igrača za prikaz.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  players.map((p) => {
                    const pid = p?.id ?? p?.player_id ?? null;

                    return (
                      <tr
                        key={safeStr(pid) || safeStr(p?.ht_player_id) || Math.random()}
                        onClick={() => openPlayer(pid)}
                        style={{
                          cursor: pid ? 'pointer' : 'default',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {columnsToRender.map((c) => {
                          const v = p?.[c.key];

                          let rendered = '';
                          if (c.key === 'full_name') rendered = safeStr(v);
                          else if (c.key === 'position') rendered = positionLabel(v);
                          else if (c.key === 'age_years') rendered = numOrEmpty(v);
                          else if (c.key === 'ht_player_id') rendered = safeStr(v);
                          else if (c.key === 'salary') rendered = numOrEmpty(v);
                          else if (c.key === 'form') rendered = numOrEmpty(v);
                          else if (c.key === 'stamina') rendered = numOrEmpty(v);
                          else if (c.key === 'current_training') rendered = safeStr(v);
                          else rendered = numOrEmpty(v);

                          return (
                            <td
                              key={c.key}
                              style={{
                                padding: '8px 8px',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                textAlign: c.key === 'full_name' ? 'left' : 'center',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {rendered}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
          Tip: drži default set kolona (bez skrola), a za analize otvori “Kolone” i privremeno upali što ti treba.
        </div>
      </div>
    </Layout>
  );
}
