import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '../../utils/supabaseClient'

export default function PlayerDetails() {
  const router = useRouter()
  const { id, team } = router.query

  const [player, setPlayer] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    ;(async () => {
      setLoading(true)
      setError(null)

      // 1) PLAYER
      const { data: playerData, error: playerErr } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single()

      if (playerErr) {
        setError(playerErr.message)
        setLoading(false)
        return
      }

      setPlayer(playerData)

      // 2) SNAPSHOT (optional)
      const { data: snapData } = await supabase
        .from('player_snapshots')
        .select('*')
        .eq('player_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      setSnapshot(snapData?.[0] || null)
      setLoading(false)
    })()
  }, [id])

  const displayName = player?.full_name || player?.name || '—'
  const nationality = player?.nationality_name || player?.nationality || '—'
  const wage = player?.wage ?? player?.salary ?? '—'

  const skills = player
    ? [
        { label: 'GK', value: player.skill_gk },
        { label: 'DEF', value: player.skill_def },
        { label: 'PM', value: player.skill_pm },
        { label: 'WING', value: player.skill_wing },
        { label: 'PASS', value: player.skill_pass },
        { label: 'SCOR', value: player.skill_scor },
        { label: 'SP', value: player.skill_sp },
      ]
    : []

  return (
    <div style={{ padding: 22, maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Link href={team ? `/team/${team}/players` : '/'} style={{ textDecoration: 'none', opacity: 0.85 }}>
          ← Igrači
        </Link>
        <Link href="/" style={{ textDecoration: 'none', opacity: 0.85 }}>
          Naslovna
        </Link>

        <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.75 }}>
          Tim: <b>{team?.toUpperCase?.() || '—'}</b>
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>{displayName}</div>

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

      {!loading && !error && player && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 16,
            padding: 18,
            background: 'rgba(255,255,255,0.65)',
          }}
        >
          {/* LEFT */}
          <div>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Osnovno</div>

            <InfoRow label="Interni ID" value={player.id} />
            <InfoRow label="HT Player ID" value={player.ht_player_id} />
            <InfoRow label="Pozicija" value={player.position || '—'} />
            <InfoRow label="Dob" value={player.age_text || '—'} />
            <InfoRow label="Status" value={player.status || '—'} />
            <InfoRow label="Nacionalnost" value={nationality} />
            <InfoRow label="TSI" value={player.tsi ?? '—'} />
            <InfoRow label="Plaća" value={wage} />
          </div>

          {/* RIGHT */}
          <div>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Snapshot (zadnji)</div>
            {!snapshot ? (
              <div style={{ opacity: 0.7 }}>Nema snapshot podataka još.</div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                <div>
                  Datum: <b>{snapshot.created_at}</b>
                </div>
              </div>
            )}
          </div>

          {/* SKILLS */}
          <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Skillovi</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
              {skills.map((s) => (
                <div
                  key={s.label}
                  style={{
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 12,
                    padding: 10,
                    background: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{s.label}</div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{s.value ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0' }}>
      <div style={{ opacity: 0.65 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value ?? '—'}</div>
    </div>
  )
}
