import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabaseClient';

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id, team } = router.query;

  const teamSlug = useMemo(() => {
    const t = (team || 'u21').toString().toLowerCase();
    return t === 'nt' ? 'nt' : 'u21';
  }, [team]);

  const backHref = useMemo(() => `/team/${teamSlug}/players`, [teamSlug]);

  const [loading, setLoading] = useState(true);
  const [roleText, setRoleText] = useState('—');
  const [error, setError] = useState('');
  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function getUserRoleSafe() {
      try {
        // 1) user_profiles (ako postoji)
        const up = await supabase
          .from('user_profiles')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (up?.data && typeof up.data.role !== 'undefined') {
          return String(up.data.role);
        }

        // 2) profiles (ako postoji) - ali bez .select('role') da ne pukne kad kolona ne postoji
        const pr = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (pr?.data && typeof pr.data.role !== 'undefined') {
          return String(pr.data.role);
        }

        // 3) users (fallback)
        const us = await supabase
          .from('users')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (us?.data && typeof us.data.role !== 'undefined') {
          return String(us.data.role);
        }

        return '—';
      } catch (e) {
        return '—';
      }
    }

    async function load() {
      setLoading(true);
      setError('');

      try {
        const role = await getUserRoleSafe();
        if (!cancelled) setRoleText(role || '—');

        // Player (glavno) — select('*') da ne pucamo na nepostojećim kolonama
        const pRes = await supabase
          .from('players')
          .select('*')
          .eq('id', Number(id))
          .maybeSingle();

        if (pRes.error) {
          throw new Error(pRes.error.message || 'Greška kod učitavanja igrača.');
        }

        if (!cancelled) setPlayer(pRes.data || null);

        // Snapshot je opcionalan — ako tablica/kolone ne postoje, NE RUŠIMO stranicu
        try {
          const sRes = await supabase
            .from('player_snapshots')
            .select('*')
            .eq('player_id', Number(id))
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Ako snapshot query pukne zbog schema mismatcha, samo ignoriramo
          if (!sRes.error && !cancelled) setSnapshot(sRes.data || null);
        } catch (e) {
          // ignore snapshot errors
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
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ opacity: 0.7 }}>Učitavam...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <Link href={backHref}>← Igrači</Link>
          <span style={{ marginLeft: 12, opacity: 0.7 }}>
            Tim: <b>{teamSlug.toUpperCase()}</b>
          </span>
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: 'rgba(255,0,0,0.08)',
            border: '1px solid rgba(255,0,0,0.18)',
          }}
        >
          Greška: {error}
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <Link href={backHref}>← Igrači</Link>
          <span style={{ marginLeft: 12, opacity: 0.7 }}>
            Tim: <b>{teamSlug.toUpperCase()}</b>
          </span>
        </div>

        <div style={{ opacity: 0.8 }}>Igrač nije pronađen.</div>
      </div>
    );
  }

  const ageText =
    typeof player.age_years !== 'undefined' && typeof player.age_days !== 'undefined'
      ? `${player.age_years}y ${player.age_days}d`
      : '—';

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <Link href={backHref} style={{ textDecoration: 'none' }}>
          ← Igrači
        </Link>
        <Link href={`/team/${teamSlug}`} style={{ textDecoration: 'none', opacity: 0.8 }}>
          Naslovna
        </Link>
        <div style={{ marginLeft: 'auto', opacity: 0.8 }}>
          Tim: <b>{teamSlug.toUpperCase()}</b> · Uloga: <b>{roleText}</b>
        </div>
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>
        {player.name || '—'}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 16,
          border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 16,
          padding: 16,
          background: 'rgba(255,255,255,0.6)',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Osnovno</div>

          <Row label="Interni ID" value={player.id} />
          <Row label="HT Player ID" value={player.ht_player_id ?? '—'} />
          <Row label="Pozicija" value={player.position ?? '—'} />
          <Row label="Dob" value={ageText} />
          <Row label="Status" value={player.status ?? '—'} />
          <Row label="Nacionalnost" value={player.nationality ?? 'Hrvatska'} />
          <Row label="TSI" value={player.tsi ?? '—'} />
          <Row label="Plaća" value={player.salary ?? '—'} />
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Snapshot (zadnji)</div>
          {snapshot ? (
            <div style={{ opacity: 0.9, fontSize: 13, lineHeight: 1.5 }}>
              <div>
                <b>Datum:</b> {snapshot.created_at ? new Date(snapshot.created_at).toLocaleString() : '—'}
              </div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                (Snapshot prikaz ćemo kasnije proširiti – bitno je da stranica više ne puca.)
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.75 }}>Nema snapshot podataka još.</div>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontWeight: 800, marginTop: 4, marginBottom: 10 }}>Skillovi</div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(90px, 1fr))',
              gap: 10,
            }}
          >
            <Skill label="GK" value={player.skill_gk ?? player.gk ?? '—'} />
            <Skill label="DEF" value={player.skill_def ?? player.def ?? '—'} />
            <Skill label="PM" value={player.skill_pm ?? player.pm ?? '—'} />
            <Skill label="WING" value={player.skill_wing ?? player.wing ?? '—'} />
            <Skill label="PASS" value={player.skill_pass ?? player.pass ?? '—'} />
            <Skill label="SCOR" value={player.skill_scor ?? player.scor ?? '—'} />
            <Skill label="SP" value={player.skill_sp ?? player.sp ?? '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <div style={{ opacity: 0.75 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Skill({ label, value }) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 14,
        padding: 12,
        background: 'rgba(255,255,255,0.7)',
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{value}</div>
    </div>
  );
}
