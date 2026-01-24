import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../../utils/supabaseClient';

/**
 * TEAM PLAYERS PAGE
 * Route: /team/[team]/players
 *
 * Notes:
 * - `team` is slug: "u21" or "nt"
 * - Data is fetched via Supabase RPC list_team_players
 * - UI supports basic filtering and dynamic columns
 */

const DEFAULT_COLUMNS = [
  { key: 'name', label: 'Ime', always: true },
  { key: 'pos', label: 'Poz', always: true },
  { key: 'age', label: 'God', always: true },
  { key: 'htid', label: 'HTID', always: true },
  // typical tracker cols
  { key: 'fo', label: 'Fo' },
  { key: 'st', label: 'St' },
  { key: 'tr', label: 'TR' },
  { key: 'de', label: 'DE' },
  { key: 'pm', label: 'PM' },
  { key: 'wg', label: 'WG' },
  { key: 'ps', label: 'PS' },
  { key: 'sc', label: 'SC' },
  { key: 'sp', label: 'SP' },
];

function normalizeTeamSlug(team) {
  const t = String(team || '').toLowerCase().trim();
  if (t === 'nt') return 'nt';
  return 'u21';
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const teamSlug = useMemo(() => normalizeTeamSlug(router.query?.team), [router.query?.team]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [total, setTotal] = useState(0);

  // filters
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState('all');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  // columns
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedCols, setSelectedCols] = useState(() => {
    // default show: name, pos, age, htid, fo, st
    const base = new Set(['name', 'pos', 'age', 'htid', 'fo', 'st']);
    return base;
  });

  const visibleColumns = useMemo(() => {
    return DEFAULT_COLUMNS.filter((c) => c.always || selectedCols.has(c.key));
  }, [selectedCols]);

  const applyFilters = () => fetchPlayers();

  const backToModules = () => {
    // /dashboard uvijek redirecta na /team/u21, zato ovdje moramo koristiti team slug
    const t = String(teamSlug || 'u21');
    router.push(`/team/${t}`);
  };

  useEffect(() => {
    // Only fetch when the dynamic route param is ready
    if (!router.isReady) return;

    // zapamti zadnji tim (u21/nt) - koristi se kao fallback na stranici detalja igrača
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('last_team', String(teamSlug));
      } catch (e) {
        // ignore
      }
    }

    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, teamSlug]);

  const fetchPlayers = async () => {
    try {
      setError('');
      setLoading(true);

      const args = {
        p_team_slug: teamSlug,
        p_search: search?.trim() || null,
        p_position: pos === 'all' ? null : pos,
        p_age_min: ageMin?.trim() ? toInt(ageMin) : null,
        p_age_max: ageMax?.trim() ? toInt(ageMax) : null,
      };

      const { data, error: rpcErr } = await supabase.rpc('list_team_players', args);

      if (rpcErr) throw rpcErr;

      const listRaw = Array.isArray(data) ? data : [];

      // Supabase RPC ponekad vrati duple redove (npr. zbog join-a ili pogrešne veze).
      // Dedupiramo na klijentu da UI ne pokazuje duple igrače.
      const seen = new Set();
      const list = [];
      for (const p of listRaw) {
        const key =
          p?.id ??
          p?.player_id ??
          p?.ht_player_id ??
          p?.htid ??
          `${p?.name || ''}|${p?.age || ''}|${p?.pos || ''}`;
        if (seen.has(String(key))) continue;
        seen.add(String(key));
        list.push(p);
      }

      setPlayers(list);
      setTotal(list.length);
    } catch (e) {
      setError(e?.message || 'Greška pri dohvaćanju igrača.');
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = (playerId) => {
    router.push({
      pathname: `/players/${playerId}`,
      query: { team: teamSlug },
    });
  };

  const toggleCol = (key) => {
    setSelectedCols((prev) => {
      const next = new Set([...prev]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 16px' }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
          Igrači ({teamSlug.toUpperCase()})
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
          Aktivni tim: <b>{teamSlug}</b>
        </div>
      </div>

      {error ? (
        <div
          style={{
            border: '1px solid rgba(255,0,0,0.25)',
            background: 'rgba(255,0,0,0.06)',
            padding: 10,
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{
            flex: '1 1 220px',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            outline: 'none',
          }}
        />

        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            minWidth: 150,
          }}
        >
          <option value="all">Pozicija (sve)</option>
          <option value="GK">GK</option>
          <option value="CD">CD</option>
          <option value="WB">WB</option>
          <option value="IM">IM</option>
          <option value="W">W</option>
          <option value="FW">FW</option>
        </select>

        <input
          value={ageMin}
          onChange={(e) => setAgeMin(e.target.value)}
          placeholder="Age min"
          style={{
            width: 92,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        />
        <input
          value={ageMax}
          onChange={(e) => setAgeMax(e.target.value)}
          placeholder="Age max"
          style={{
            width: 92,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        />

        <button
          onClick={applyFilters}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Primijeni
        </button>

        <button
          onClick={() => setColumnsOpen((v) => !v)}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Kolone
        </button>

        <div style={{ marginLeft: 'auto', fontSize: 12 }}>
          <button
            type="button"
            onClick={backToModules}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.75,
              fontSize: 12,
            }}
          >
            Natrag na module
          </button>
        </div>
      </div>

      {columnsOpen ? (
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            Odaberi kolone:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {DEFAULT_COLUMNS.filter((c) => !c.always).map((c) => (
              <label key={c.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedCols.has(c.key)}
                  onChange={() => toggleCol(c.key)}
                />
                <span style={{ fontSize: 13 }}>{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'white',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(60px, 1fr))`,
            gap: 0,
            padding: '10px 12px',
            background: 'rgba(0,0,0,0.04)',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {visibleColumns.map((c) => (
            <div key={c.key} style={{ paddingRight: 10 }}>
              {c.label}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 16, fontSize: 13, opacity: 0.7 }}>Učitavam...</div>
        ) : players.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, opacity: 0.7 }}>
            Nema igrača za prikaz.
          </div>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              onClick={() => openPlayer(p.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(60px, 1fr))`,
                padding: '10px 12px',
                cursor: 'pointer',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                fontSize: 13,
              }}
            >
              {visibleColumns.map((c) => {
                let val = '';
                switch (c.key) {
                  case 'name':
                    val = p.name || '';
                    break;
                  case 'pos':
                    val = p.pos || '';
                    break;
                  case 'age':
                    val = p.age || '';
                    break;
                  case 'htid':
                    val = p.htid || p.ht_player_id || '';
                    break;
                  case 'fo':
                    val = p.fo ?? '';
                    break;
                  case 'st':
                    val = p.st ?? '';
                    break;
                  case 'tr':
                    val = p.tr ?? '';
                    break;
                  case 'de':
                    val = p.de ?? '';
                    break;
                  case 'pm':
                    val = p.pm ?? '';
                    break;
                  case 'wg':
                    val = p.wg ?? '';
                    break;
                  case 'ps':
                    val = p.ps ?? '';
                    break;
                  case 'sc':
                    val = p.sc ?? '';
                    break;
                  case 'sp':
                    val = p.sp ?? '';
                    break;
                  default:
                    val = p[c.key] ?? '';
                }
                return (
                  <div key={c.key} style={{ paddingRight: 10, opacity: val ? 1 : 0.55 }}>
                    {val || '—'}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
        Klik na red otvara detalje igrača.
      </div>
    </div>
  );
}
