import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '../../../utils/supabaseClient'

export default function TeamPlayers() {
  const router = useRouter()
  const teamSlug = router.query.team

  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI filteri
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState('all')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')

  useEffect(() => {
    if (!teamSlug) return

    ;(async () => {
      setLoading(true)
      setError(null)

      // 1) dohvati team po slug-u
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select('id, slug, name')
        .eq('slug', String(teamSlug))
        .single()

      if (teamErr) {
        setError(`teams: ${teamErr.message}`)
        setTeam(null)
        setPlayers([])
        setLoading(false)
        return
      }

      setTeam(teamData)

      // 2) dohvati ID-eve igrača iz team_players
      const { data: tpRows, error: tpErr } = await supabase
        .from('team_players')
        .select('player_id')
        .eq('team_id', teamData.id)

      if (tpErr) {
        setError(`team_players: ${tpErr.message}`)
        setPlayers([])
        setLoading(false)
        return
      }

      const ids = Array.from(
        new Set(
          (tpRows || [])
            .map((r) => r?.player_id)
            .filter((x) => Number.isFinite(Number(x)))
        )
      )

      if (ids.length === 0) {
        setPlayers([])
        setLoading(false)
        return
      }

      // 3) dohvati igrače po id-jevima (bez join-a)
      const { data: plRows, error: plErr } = await supabase
        .from('players')
        .select(
          [
            'id',
            'full_name',
            'name',
            'position',      // u tvojoj bazi postoji "position"
            'pos',           // fallback ako je negdje "pos"
            'age_years',
            'age_y',         // fallback
            'ht_player_id',
            'ht_id',         // fallback
            'htid'           // fallback
          ].join(', ')
        )
        .in('id', ids)

      if (plErr) {
        setError(`players: ${plErr.message}`)
        setPlayers([])
        setLoading(false)
        return
      }

      // dedupe po HTID pa po ID (za svaki slučaj)
      const byKey = new Map()
      for (const p of plRows || []) {
        const htid = String(p.ht_player_id ?? p.ht_id ?? p.htid ?? '').trim()
        const key = htid ? `ht:${htid}` : `id:${p.id}`
        if (!byKey.has(key)) byKey.set(key, p)
      }

      setPlayers(Array.from(byKey.values()))
      setLoading(false)
    })()
  }, [teamSlug])

  // priprema + filteri na FE
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    const min = ageMin ? Number(ageMin) : null
    const max = ageMax ? Number(ageMax) : null

    const norm = (players || []).map((p) => ({
      ...p,
      _name: String(p.full_name || p.name || '').trim(),
      _pos: String(p.position ?? p.pos ?? '').trim(),
      _ageY: Number(p.age_years ?? p.age_y ?? NaN),
      _htid: String(p.ht_player_id ?? p.ht_id ?? p.htid ?? '').trim(),
    }))

    const out = norm.filter((p) => {
      if (s) {
        const hay = `${p._name} ${p._pos} ${p._htid}`.toLowerCase()
        if (!hay.includes(s)) return false
      }
      if (pos !== 'all' && p._pos && p._pos !== pos) return false
      if (min !== null && Number.isFinite(p._ageY) && p._ageY < min) return false
      if (max !== null && Number.isFinite(p._ageY) && p._ageY > max) return false
      return true
    })

    out.sort((a, b) => a._name.localeCompare(b._name))
    return out
  }, [players, search, pos, ageMin, ageMax])

  const uniquePositions = useMemo(() => {
    const set = new Set()
    for (const p of players) {
      const v = String(p.position ?? p.pos ?? '').trim()
      if (v) set.add(v)
    }
    return Array.from(set).sort()
  }, [players])

  return (
    <div style={{ padding: 22, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          Igrači ({String(teamSlug || '').toUpperCase()})
        </div>

        <div style={{ marginLeft: 12, opacity: 0.75, fontSize: 12 }}>
          Aktivni tim: <b>{team?.slug || teamSlug}</b>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ opacity: 0.75 }}>Popis igrača ({filtered.length})</div>
            <Link href={`/team/${teamSlug}`} style={{ textDecoration: 'none', opacity: 0.85 }}>
              Natrag na module
            </Link>
          </div>
        </div>
      </div>

      {/* FILTERI */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.14)',
            minWidth: 240,
          }}
        />

        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)' }}
        >
          <option value="all">Pozicija (sve)</option>
          {uniquePositions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          value={ageMin}
          onChange={(e) => setAgeMin(e.target.value)}
          placeholder="Age min"
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', width: 90 }}
        />
        <input
          value={ageMax}
          onChange={(e) => setAgeMax(e.target.value)}
          placeholder="Age max"
          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.14)', width: 90 }}
        />
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
          <div style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>Klik na red otvara detalje igrača</div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <Th>Ime</Th>
                <Th>Poz</Th>
                <Th>God</Th>
                <Th>HTID</Th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => {
                const name = String(p.full_name || p.name || '—')
                const htid = String(p.ht_player_id ?? p.ht_id ?? p.htid ?? '—')
                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/players/${p.id}?team=${teamSlug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Td>{name}</Td>
                    <Td>{String(p.position ?? p.pos ?? '—')}</Td>
                    <Td>{Number.isFinite(Number(p.age_years ?? p.age_y)) ? (p.age_years ?? p.age_y) : '—'}</Td>
                    <Td>{htid}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }) {
  return <th style={{ padding: '10px 10px', fontSize: 12, opacity: 0.8 }}>{children}</th>
}

function Td({ children }) {
  return <td style={{ padding: '10px 10px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: 13 }}>{children}</td>
}
