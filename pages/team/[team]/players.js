import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '../../../utils/supabaseClient'

export default function TeamPlayers() {
  const router = useRouter()
  const teamSlug = router.query.team

  const [rows, setRows] = useState([])
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [pos, setPos] = useState('all')
  const [ageMin, setAgeMin] = useState('')
  const [ageMax, setAgeMax] = useState('')

  useEffect(() => {
    if (!teamSlug) return

    ;(async () => {
      setLoading(true)
      setError(null)

      // 1) Dohvati team po slug-u
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select('id, slug, name')
        .eq('slug', String(teamSlug))
        .single()

      if (teamErr) {
        setError(`teams: ${teamErr.message}`)
        setTeam(null)
        setRows([])
        setLoading(false)
        return
      }

      setTeam(teamData)

      // 2) Dohvati team_players + join players(*)
      const { data: tpData, error: tpErr } = await supabase
        .from('team_players')
        .select('team_id, player_id, players(*)')
        .eq('team_id', teamData.id)

      if (tpErr) {
        setError(`team_players: ${tpErr.message}`)
        setRows([])
        setLoading(false)
        return
      }

      setRows(Array.isArray(tpData) ? tpData : [])
      setLoading(false)
    })()
  }, [teamSlug])

  const players = useMemo(() => {
    // izvuci players iz join-a
    const rawPlayers = (rows || [])
      .map((r) => r.players)
      .filter(Boolean)

    // normalizacija + filter praznih
    const normalized = rawPlayers
      .map((p) => ({
        ...p,
        _name: String(p.full_name || p.name || '').trim(),
        _pos: String(p.position || p.pos || '').trim(),
        _ageY: Number(p.age_y ?? p.age ?? NaN),
        _htid: String(p.ht_player_id ?? p.ht_id ?? p.htid ?? '').trim(),
        _id: p.id,
      }))
      .filter((p) => p._name || p._htid || p._id)

    // FILTERI (front-end)
    const s = search.trim().toLowerCase()
    const min = ageMin ? Number(ageMin) : null
    const max = ageMax ? Number(ageMax) : null

    const filtered = normalized.filter((p) => {
      if (s) {
        const hay = `${p._name} ${p._pos} ${p._htid}`.toLowerCase()
        if (!hay.includes(s)) return false
      }
      if (pos !== 'all' && p._pos !== pos) return false
      if (min !== null && Number.isFinite(p._ageY) && p._ageY < min) return false
      if (max !== null && Number.isFinite(p._ageY) && p._ageY > max) return false
      return true
    })

    // DEDUPE (prvo HTID, pa id)
    const seen = new Set()
    const out = []
    for (const p of filtered) {
      const key = p._htid ? `ht:${p._htid}` : p._id ? `id:${p._id}` : `nm:${p._name.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(p)
    }

    // sort po imenu
    out.sort((a, b) => a._name.localeCompare(b._name))
    return out
  }, [rows, search, pos, ageMin, ageMax])

  const uniquePositions = useMemo(() => {
    const set = new Set()
    for (const p of players) {
      if (p._pos) set.add(p._pos)
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
            <div style={{ opacity: 0.75 }}>Popis igrača ({players.length})</div>
            <Link href={`/team/${teamSlug}`} style={{ textDecoration: 'none', opacity: 0.85 }}>
              Natrag na module
            </Link>
          </div>
        </div>
      </div>

      {/* FILTERS */}
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
              {players.map((p) => {
                const name = p._name || '—'
                const htid = p._htid || '—'
                const pid = p.id

                return (
                  <tr
                    key={p._htid ? `ht:${p._htid}` : `id:${p.id}`}
                    onClick={() => {
                      if (!pid) return
                      router.push(`/players/${pid}?team=${teamSlug}`)
                    }}
                    style={{ cursor: pid ? 'pointer' : 'default' }}
                  >
                    <Td>{name}</Td>
                    <Td>{p._pos || '—'}</Td>
                    <Td>{Number.isFinite(p._ageY) ? p._ageY : '—'}</Td>
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
