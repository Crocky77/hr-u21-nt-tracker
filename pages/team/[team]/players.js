import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabaseClient';

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const teamSlug = useMemo(() => {
    const t = (team || 'u21').toString().toLowerCase();
    return t === 'nt' ? 'nt' : 'u21';
  }, [team]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playersRaw, setPlayersRaw] = useState([]);

  // filteri (UI)
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState(''); // '' = sve
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');

  // klik na "Primijeni"
  const [applyTick, setApplyTick] = useState(0);

  // Dedupe: po HT ID (najstabilnije, rješava duple unose u prikazu)
  const players = useMemo(() => {
    const seen = new Set();
    const out = [];

    for (const p of playersRaw || []) {
      const ht = p?.ht_id ?? p?.ht_player_id ?? p?.htid ?? null;
      const key = ht ? `ht:${ht}` : `id:${p?.id ?? 'x'}:${p?.full_name ?? p?.name ?? 'unknown'}`;

      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
    return out;
  }, [playersRaw]);

  useEffect(() => {
    if (!teamSlug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      // pretvori u brojeve ili null
      const p_age_min = ageMin === '' ? null : Number(ageMin);
      const p_age_max = ageMax === '' ? null : Number(ageMax);

      const payload = {
        // VAŽNO: imena parametara moraju odgovarati imenima argumenata funkcije u Supabaseu
        p_team_slug: teamSlug,
        p_age_min: Number.isFinite(p_age_min) ? p_age_min : null,
        p_age_max: Number.isFinite(p_age_max) ? p_age_max : null,
        p_pos: pos ? pos : null,
        p_search: search ? search : null,
      };

      try {
        const res = await supabase.rpc('list_team_players', payload);

        if (res.error) {
          throw new Error(res.error.message || 'RPC list_team_players greška.');
        }

        if (!cancelled) {
          setPlayersRaw(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Greška.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug, applyTick]);

  function openPlayer(p) {
    const id = p?.id;
    if (!id) return;
    router.push(`/players/${id}?team=${teamSlug}`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          Igrači ({teamSlug.toUpperCase()})
        </div>

        <div style={{ marginLeft: 12, opacity: 0.75, fontSize: 12 }}>
          Aktivni tim: <b>{teamSlug}</b>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ opacity: 0.75 }}>Popis igrača ({players.length})</div>
            <Link href={`/team/${teamSlug}`} style={{ textDecoration: 'none', opacity: 0.85 }}>
              Natrag na module
            </Link>
          </div>
        </div>
      </div>

      {/* Filteri */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          marginBottom: 12,
          padding: 10,
          borderRadius: 12,
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.60)',
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={inputStyle(260)}
        />

        <select value={pos} onChange={(e) => setPos(e.target.value)} style={inputStyle(150)}>
          <option value="">Pozicija (sve)</option>
          <option value="GK">GK</option>
          <option value="WB">WB</option>
          <option value="CD">CD</option>
          <option value="IM">IM</option>
          <option value="W">W</option>
          <option value="FW">FW</option>
          <option value="SP">SP</option>
        </select>

        <input
          value={ageMin}
          onChange={(e) => setAgeMin(e.target.value)}
          placeholder="Age min"
          style={inputStyle(110)}
          inputMode="numeric"
        />
        <input
          value={ageMax}
          onChange={(e) => setAgeMax(e.target.value)}
          placeholder="Age max"
          style={inputStyle(110)}
          inputMode="numeric"
        />

        <button
          onClick={() => setApplyTick((x) => x + 1)}
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Primijeni
        </button>
      </div>

      {loading && <div style={{ opacity: 0.7 }}>Učitavam...</div>}

      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.18)',
            marginBottom: 12,
          }}
        >
          Greška: {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 14,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.65)',
          }}
        >
          <div style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>
            Klik na red otvara detalje igrača
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                <Th>Ime</Th>
                <Th>Poz</Th>
                <Th>God</Th>
                <Th>HTID</Th>
                <Th>Fo</Th>
                <Th>St</Th>
                <Th>TR</Th>
                <Th>DE</Th>
                <Th>PM</Th>
                <Th>SC</Th>
                <Th>SP</Th>
              </tr>
            </thead>

            <tbody>
              {players.map((p, idx) => {
                const name = p.full_name ?? p.name ?? '—';
                const pos2 = p.position ?? p.pos ?? '—';
                const age = p.age_years ?? p.age ?? '—';
                const ht = p.ht_id ?? p.ht_player_id ?? p.htid ?? '—';

                const fo = p.form ?? p.fo ?? '—';
                const st = p.stamina ?? p.st ?? '—';

                const tr = p.tr ?? '—';
                const de = p.def ?? p.de ?? '—';
                const pm = p.pm ?? '—';
                const sc = p.sc ?? '—';
                const sp = p.sp ?? '—';

                return (
                  <tr
                    key={`${ht}-${idx}`}
                    onClick={() => openPlayer(p)}
                    style={{
                      cursor: 'pointer',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Td>{name}</Td>
                    <Td>{pos2}</Td>
                    <Td>{age}</Td>
                    <Td>{ht}</Td>
                    <Td>{fo}</Td>
                    <Td>{st}</Td>
                    <Td>{tr}</Td>
                    <Td>{de}</Td>
                    <Td>{pm}</Td>
                    <Td>{sc}</Td>
                    <Td>{sp}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function inputStyle(width) {
  return {
    width,
    padding: '9px 10px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.10)',
    background: 'rgba(255,255,255,0.85)',
    outline: 'none',
    fontSize: 13,
  };
}

function Th({ children }) {
  return (
    <th style={{ textAlign: 'left', padding: '10px 10px', fontSize: 12, opacity: 0.8 }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: '10px 10px', fontSize: 13 }}>{children}</td>;
}
