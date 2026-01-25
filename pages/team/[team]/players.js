import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabaseClient';

function safeInt(v) {
  if (v === null || typeof v === 'undefined' || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const teamSlug = useMemo(() => {
    const t = (team || 'u21').toString().toLowerCase();
    return t === 'nt' ? 'nt' : 'u21';
  }, [team]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [positions, setPositions] = useState([]);

  // 1) učitaj pozicije (ako RPC postoji) – fallback na default
  useEffect(() => {
    let cancelled = false;

    async function loadPositions() {
      try {
        const r = await supabase.rpc('list_team_positions', { p_team_slug: teamSlug });
        if (!cancelled && !r.error && Array.isArray(r.data) && r.data.length) {
          // očekujemo npr. [{pos:"W"}, ...] ili [{position:"W"}]
          const list = r.data
            .map((x) => x?.pos ?? x?.position ?? null)
            .filter(Boolean);
          if (list.length) setPositions(list);
        }
      } catch (e) {
        // ignore
      }
    }

    loadPositions();
    return () => {
      cancelled = true;
    };
  }, [teamSlug]);

  // 2) učitaj igrače (bez filtera – init)
  useEffect(() => {
    if (!teamSlug) return;
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setError('');
      try {
        // Minimalno: call bez filtera – jer filter RPC varijanta ti je pukla po shema-cache
        const r = await supabase.rpc('list_team_players', { team_slug: teamSlug });

        if (r.error) throw new Error(r.error.message || 'Greška kod učitavanja igrača.');

        if (!cancelled) setPlayers(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Greška.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [teamSlug]);

  // 3) lokalni filter (dok ne stabiliziramo RPC s parametrima)
  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    const p = (pos || '').trim();

    const amin = safeInt(ageMin);
    const amax = safeInt(ageMax);

    return (players || []).filter((row) => {
      const name = (row.full_name ?? row.name ?? '').toString().toLowerCase();
      const htId = (row.ht_id ?? row.ht_player_id ?? '').toString().toLowerCase();
      const position = (row.pos ?? row.position ?? '').toString();

      // search: ime ili ht id
      if (q) {
        const ok = name.includes(q) || htId.includes(q);
        if (!ok) return false;
      }

      // pozicija
      if (p && position !== p) return false;

      // age min/max (ako postoji age_years)
      const ay = safeInt(row.age_years ?? row.age ?? null);
      if (amin !== null && ay !== null && ay < amin) return false;
      if (amax !== null && ay !== null && ay > amax) return false;

      return true;
    });
  }, [players, search, pos, ageMin, ageMax]);

  const title = teamSlug === 'nt' ? 'Igrači (NT)' : 'Igrači (U21)';

  return (
    <div style={{ padding: 24 }}>
      {/* OUTER GRID: left module | main | right module */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr) 220px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* LEFT MODULE (reserved) */}
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 16,
            padding: 12,
            background: 'rgba(255,255,255,0.55)',
            minHeight: 120,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Left module</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>(rezervirano za kasnije)</div>
        </div>

        {/* MAIN */}
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 16,
            padding: 16,
            background: 'rgba(255,255,255,0.60)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{title}</div>
            <div style={{ opacity: 0.7 }}>Aktivni tim: {teamSlug}</div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, opacity: 0.9 }}>
              <Link href={`/team/${teamSlug}`} style={{ textDecoration: 'underline' }}>
                Natrag na module
              </Link>
              <span style={{ opacity: 0.7 }}>Popis igrača ({filtered.length})</span>
            </div>
          </div>

          {/* FILTERI */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: ime, HT ID, pozicija..."
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                minWidth: 260,
                flex: '1 1 260px',
              }}
            />

            <select
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                minWidth: 160,
              }}
            >
              <option value="">Pozicija (sve)</option>
              {(positions.length ? positions : ['GK', 'CD', 'WB', 'IM', 'W', 'FW']).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <input
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              placeholder="Age min"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                width: 120,
              }}
            />
            <input
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              placeholder="Age max"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.12)',
                width: 120,
              }}
            />
          </div>

          {/* ERROR */}
          {error ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: 'rgba(255,0,0,0.08)',
                border: '1px solid rgba(255,0,0,0.18)',
                marginBottom: 12,
              }}
            >
              Greška: {error}
            </div>
          ) : null}

          {/* TABLE */}
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 8 }}>
            Klik na red otvara detalje igrača
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                  <th style={{ padding: 10 }}>Ime</th>
                  <th style={{ padding: 10, width: 70 }}>Poz</th>
                  <th style={{ padding: 10, width: 70 }}>God</th>
                  <th style={{ padding: 10, width: 110 }}>HTID</th>
                  <th style={{ padding: 10, width: 60 }}>Fo</th>
                  <th style={{ padding: 10, width: 60 }}>St</th>
                  <th style={{ padding: 10, width: 60 }}>TR</th>
                  <th style={{ padding: 10, width: 60 }}>DE</th>
                  <th style={{ padding: 10, width: 60 }}>PM</th>
                  <th style={{ padding: 10, width: 60 }}>SC</th>
                  <th style={{ padding: 10, width: 60 }}>SP</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} style={{ padding: 12, opacity: 0.7 }}>
                      Učitavam...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: 12, opacity: 0.7 }}>
                      Nema podataka.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const pid = row.id ?? row.player_id ?? null;

                    const name = row.full_name ?? row.name ?? '—';
                    const position = row.pos ?? row.position ?? '—';
                    const age = row.age_years ?? row.age ?? '—';
                    const htId = row.ht_id ?? row.ht_player_id ?? '—';

                    const href = pid ? `/players/${pid}?team=${teamSlug}` : '#';

                    return (
                      <tr
                        key={`${pid ?? 'x'}-${htId}-${name}`}
                        onClick={() => {
                          if (pid) router.push(href);
                        }}
                        style={{
                          cursor: pid ? 'pointer' : 'default',
                          borderBottom: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <td style={{ padding: 10, fontWeight: 700 }}>{name}</td>
                        <td style={{ padding: 10 }}>{position}</td>
                        <td style={{ padding: 10 }}>{age}</td>
                        <td style={{ padding: 10 }}>{htId}</td>
                        <td style={{ padding: 10 }}>{row.form ?? row.fo ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.stamina ?? row.st ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.skill_tr ?? row.tr ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.skill_def ?? row.de ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.skill_pm ?? row.pm ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.skill_scor ?? row.sc ?? '—'}</td>
                        <td style={{ padding: 10 }}>{row.skill_sp ?? row.sp ?? '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT MODULE (reserved) */}
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 16,
            padding: 12,
            background: 'rgba(255,255,255,0.55)',
            minHeight: 120,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Right module</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>(rezervirano za kasnije)</div>
        </div>
      </div>

      {/* MOBILE: sakrij side module (jednostavno) */}
      <style jsx>{`
        @media (max-width: 1100px) {
          div[style*='grid-template-columns: 220px'] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
