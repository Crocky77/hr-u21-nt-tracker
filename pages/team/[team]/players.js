import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '../../../utils/supabaseClient'

export default function TeamPlayers() {
  const router = useRouter()
  const teamSlug = router.query.team

  const [playersRaw, setPlayersRaw] = useState([])
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

      // RPC: u bazi je parametar p_team_slug (ne team_slug)
      const { data, error: rpcErr } = await supabase.rpc('list_team_players', {
        p_team_slug: String(teamSlug),
        p_search: search ? String(search) : null,
        p_pos: pos !== 'all' ? String(pos) : null,
        p_age_min: ageMin ? Number(ageMin) : null,
        p_age_max: ageMax ? Number(ageMax) : null,
      })

      if (rpcErr) {
        setError(rpcErr.message)
        setPlayersRaw([])
        setLoading(false)
        return
      }

      setPlayersRaw(Array.isArray(data) ? data : [])
      setLoading(false)
    })()
  }, [teamSlug])

  const players = useMemo(() => {
    // 1) normalizacija
    const normalized = (playersRaw || [])
      .map((p) => ({
        ...p,
        // ime može biti full_name ili name ovisno o RPC-u
        _name: (p.full_name || p.name || '').trim(),
        // ht id može biti ht_player_id ili ht_id ili htid ovisno o RPC-u
        _htid: String(p.ht_player_id ?? p.ht_id ?? p.htid ?? '').trim(),
        _id: p.id,
      }))
      // makni prazne redove koji nemaju ništa smisleno (sprječava “prazne” duplikate)
      .filter((p) => p._name || p._htid || p._id)

    // 2) DEDUPE (prvo po HTID, ako nema onda po internom id)
    const seen = new Set()
    const out = []

    for (const p of normalized) {
      const key = p._htid ? `ht:${p._htid}` : p._id ? `id:${p._id}` : `nm:${p._name.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(p)
    }

    return out
  }, [playersRaw])

  const uniquePositions = useMemo(() => {
    const set = new Set()
    for (const p of playersRaw || []) {
      const v = (p.position || p.pos || '').trim()
      if (v) set.add(v)
    }
    return Array.from(set).sort()
  }, [playersRaw])

  const applyFilters = async () => {
    if (!teamSlug) return
    setLoading(true)
    setError(null)

    const { data, error: rpcErr } = await supabase.rpc('list_team_players', {
      p_team_slug: String(teamSlug),
      p_search: search ? String(search) : null,
      p_pos: pos !== 'all' ? String(pos) : null,
      p_age_min: ageMin ? Number(ageMin) : null,
      p_age_max: ageMax ? Number(ageMax) : null,
    })

    if (rpcErr) {
      setError(rpcErr.message)
      setPlayersRaw([])
      setLoading(false)
      return
    }

    setPlayersRaw(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  return (
    <div style={{ padding: 22, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Igrači ({String(teamSlug || '').toUpperCase()})</div>

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

        <button
          onClick={applyFilters}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.14)',
            background: 'white',
            cursor: 'pointer',
            fontWeight: 800,
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
          <div style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>Klik na red otvara detalje igrača</div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.03)', textAlign: 'left' }}>
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
                    <Td>{p.position || p.pos || '—'}</Td>
                    <Td>{p.age_y ?? p.age ?? '—'}</Td>
                    <Td>{htid}</Td>
                    <Td>{p.fo ?? '—'}</Td>
                    <Td>{p.st ?? '—'}</Td>
                    <Td>{p.tr ?? '—'}</Td>
                    <Td>{p.skill_def ?? p.de ?? '—'}</Td>
                    <Td>{p.skill_pm ?? p.pm ?? '—'}</Td>
                    <Td>{p.skill_scor ?? p.sc ?? '—'}</Td>
                    <Td>{p.skill_sp ?? p.sp ?? '—'}</Td>
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
