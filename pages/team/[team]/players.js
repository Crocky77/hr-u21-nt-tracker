import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppLayout from '../../../components/AppLayout';
import supabase from '../../../utils/supabaseClient';

/**
 * Team Players (portal-style list)
 * Layout: handled globally via AppLayout (sidebar + topbar)
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
  { key: 'full_name', label: 'Ime' },
  { key: 'position', label: 'Poz' },
  { key: 'age_years', label: 'God' },
  { key: 'ht_player_id', label: 'HTID' },
  { key: 'salary', label: 'Sal' },
  { key: 'form', label: 'Fo' },
  { key: 'stamina', label: 'St' },
  { key: 'current_training', label: 'TR' },
  { key: 'skill_goalkeeping', label: 'GK' },
  { key: 'skill_defending', label: 'DE' },
  { key: 'skill_playmaking', label: 'PM' },
  { key: 'skill_winger', label: 'WG' },
  { key: 'skill_passing', label: 'PS' },
  { key: 'skill_scoring', label: 'SC' },
  { key: 'skill_set_pieces', label: 'SP' },
];

function safe(v) {
  return v === null || v === undefined ? '' : String(v);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);

  const teamSlug = useMemo(
    () => (team ? String(team).toLowerCase() : ''),
    [team]
  );

  const title =
    teamSlug === 'u21'
      ? 'Igrači (U21)'
      : teamSlug === 'nt'
      ? 'Igrači (NT)'
      : 'Igrači';

  const selectedColumnSet = useMemo(
    () => new Set(selectedColumns),
    [selectedColumns]
  );

  const columnsToRender = useMemo(
    () => ALL_COLUMNS.filter(c => selectedColumnSet.has(c.key)),
    [selectedColumnSet]
  );

  const fetchPlayers = async () => {
    if (!teamSlug) return;
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('list_team_players', {
        p_team_slug: teamSlug,
        p_search: search || null,
        p_position: position || null,
        p_age_min: ageMin || null,
        p_age_max: ageMax || null,
        p_limit: 200,
        p_offset: 0,
      });

      if (error) throw error;

      // dedupe by internal id
      const map = new Map();
      (data || []).forEach(p => {
        const id = p.id ?? p.player_id;
        if (!map.has(id)) map.set(id, p);
      });

      const list = Array.from(map.values());
      setPlayers(list);
      setTotal(list.length);
    } catch (e) {
      setPlayers([]);
      setTotal(0);
      setError(e.message || 'Greška kod dohvaćanja igrača');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchPlayers();
  }, [router.isReady, teamSlug]);

  return (
    <AppLayout>
      <Head>
        <title>{title} – HR U21/NT Tracker</title>
      </Head>

      {/* CONTENT AREA – DESNO OD MENIJA */}
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>{title}</h1>

        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
          Aktivni tim: <b>{teamSlug}</b> · Popis igrača ({total})
        </div>

        {/* FILTER BAR */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            placeholder="Search: ime, HT ID, pozicija…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            placeholder="Pozicija"
            value={position}
            onChange={e => setPosition(e.target.value)}
          />
          <input
            placeholder="Age min"
            value={ageMin}
            onChange={e => setAgeMin(e.target.value)}
          />
          <input
            placeholder="Age max"
            value={ageMax}
            onChange={e => setAgeMax(e.target.value)}
          />
          <button onClick={fetchPlayers}>Primijeni</button>
          <button onClick={() => setColumnsOpen(v => !v)}>Kolone</button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div>Učitavanje…</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                {columnsToRender.map(c => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id}>
                  {columnsToRender.map(c => (
                    <td key={c.key}>
                      {c.key === 'full_name'
                        ? safe(p[c.key])
                        : num(p[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
