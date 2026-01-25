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

  // UI dedupe (privremeno)
  const players = useMemo(() => {
    const seen = new Set();
    const out = [];

    for (const p of playersRaw || []) {
      // prioritet: interni id, pa ht_player_id
      const key =
        (typeof p.id !== 'undefined' && p.id !== null && `id:${p.id}`) ||
        (typeof p.ht_player_id !== 'undefined' && p.ht_player_id !== null && `ht:${p.ht_player_id}`) ||
        `name:${p.name || 'unknown'}`;

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

      try {
        // VAŽNO: Supabase RPC koristi IMENA parametara iz SQL funkcije.
        // U bazi je parametar nazvan p_team_slug (ne team_slug).
        const res = await supabase.rpc('list_team_players', { p_team_slug: teamSlug });

        if (res.error) {
          throw new Error(res.error.message || 'RPC list_team_players greška.');
        }

        if (!cancelled) {
          const raw = Array.isArray(res.data) ? res.data : [];

          // Dedupe (posebno važno za NT gdje se mogu pojaviti dupli redovi)
          const map = new Map();
          for (const p of raw) {
            const key = p?.id ?? p?.ht_id ?? `${p?.full_name || ''}-${p?.age_y || ''}-${p?.age_d || ''}`;
            if (!map.has(key)) map.set(key, p);
          }

          setPlayersRaw(Array.from(map.values()));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Greška.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [teamSlug]);

  function openPlayer(p) {
    // Detalji preko /players/[id]?team=...
    const id = p?.id;
    if (!id) return;
    router.push(`/players/${id}?team=${teamSlug}`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
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
              {players.map((p, idx) => (
                <tr
                  key={`${p.id || p.ht_player_id || p.name}-${idx}`}
                  onClick={() => openPlayer(p)}
                  style={{
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Td>{p.name || '—'}</Td>
                  <Td>{p.position || p.pos || '—'}</Td>
                  <Td>{typeof p.age_years !== 'undefined' ? p.age_years : (p.age ?? '—')}</Td>
                  <Td>{p.ht_player_id ?? p.htid ?? '—'}</Td>
                  <Td>{p.form ?? p.fo ?? '—'}</Td>
                  <Td>{p.stamina ?? p.st ?? '—'}</Td>
                  <Td>{p.tr ?? '—'}</Td>
                  <Td>{p.def ?? '—'}</Td>
                  <Td>{p.pm ?? '—'}</Td>
                  <Td>{p.sc ?? '—'}</Td>
                  <Td>{p.sp ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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
