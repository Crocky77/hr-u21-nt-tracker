import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { supabase } from "../../../lib/supabaseClient";

/**
 * Task 2.2: Compact Players table UI
 * - Smaller font, narrow columns, abbreviated headers
 * - Column chooser ("Kolone")
 * - Row click -> player details
 * - Keeps existing filters: search, position, age min/max
 */

const COLS = [
  { key: "full_name", label: "Ime", width: 220, sticky: true },
  { key: "position", label: "Poz", width: 48 },
  { key: "age_years", label: "God", width: 52, right: true },
  { key: "ht_player_id", label: "HTID", width: 92, right: true },
  { key: "salary", label: "Sal", width: 84, right: true, fmt: (v) => (v ?? "") },
  { key: "form", label: "Fo", width: 42, right: true },
  { key: "stamina", label: "St", width: 42, right: true },
  { key: "current_training", label: "TR", width: 74 },
  { key: "skill_goalkeeping", label: "GK", width: 44, right: true },
  { key: "skill_defending", label: "DE", width: 44, right: true },
  { key: "skill_playmaking", label: "PM", width: 44, right: true },
  { key: "skill_winger", label: "WG", width: 44, right: true },
  { key: "skill_passing", label: "PS", width: 44, right: true },
  { key: "skill_scoring", label: "SC", width: 44, right: true },
  { key: "skill_set_pieces", label: "SP", width: 44, right: true },
];

const DEFAULT_VISIBLE = [
  "full_name",
  "position",
  "age_years",
  "ht_player_id",
  "form",
  "stamina",
  "current_training",
  "skill_defending",
  "skill_playmaking",
  "skill_scoring",
  "skill_set_pieces",
];

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function TeamPlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // Column chooser
  const [showCols, setShowCols] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);

  const columns = useMemo(() => {
    const set = new Set(visibleCols);
    return COLS.filter((c) => set.has(c.key));
  }, [visibleCols]);

  const teamSlug = (team || "").toString();

  async function fetchPlayers() {
    if (!teamSlug) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("list_team_players", {
        p_team_slug: teamSlug,
        p_search: search?.trim() || null,
        p_position: position === "all" ? null : position,
        p_age_min: numOrNull(ageMin),
        p_age_max: numOrNull(ageMax),
        p_limit: 1000,
        p_offset: 0,
      });

      if (error) throw error;
      setPlayers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(`Greška kod dohvaćanja igrača: ${e.message || e}`);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (teamSlug) fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug]);

  function toggleCol(key) {
    setVisibleCols((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      // Always keep name visible (prevents "empty" UX)
      s.add("full_name");
      return Array.from(s);
    });
  }

  function onRowClick(playerId) {
    if (!playerId) return;
    router.push(`/players/${playerId}`);
  }

  const total = players?.length ?? 0;

  return (
    <Layout title="Igrači">
      <div style={{ padding: 16 }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: 22 }}>Igrači</h1>
        <div style={{ color: "#666", marginBottom: 10, fontSize: 13 }}>
          Aktivni tim: <b>{teamSlug}</b>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search: ime, HT ID, pozicija..."
            style={{
              height: 34,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              minWidth: 220,
              fontSize: 13,
            }}
          />

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              height: 34,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 13,
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
            type="number"
            value={ageMin}
            onChange={(e) => setAgeMin(e.target.value)}
            placeholder="Age min"
            style={{
              height: 34,
              width: 92,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 13,
            }}
          />

          <input
            type="number"
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
            placeholder="Age max"
            style={{
              height: 34,
              width: 92,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 13,
            }}
          />

          <button
            onClick={fetchPlayers}
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Primijeni
          </button>

          <button
            onClick={() => setShowCols((v) => !v)}
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Kolone
          </button>

          <div style={{ marginLeft: "auto", fontSize: 13, color: "#666" }}>
            Popis igrača <b>({total})</b>
          </div>
        </div>

        {/* Column chooser */}
        {showCols && (
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 8, color: "#444" }}>
              Označi kolone (što manje kolona = preglednije, bez horizontalnog skrola)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 6,
                fontSize: 13,
              }}
            >
              {COLS.map((c) => (
                <label key={c.key} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(c.key)}
                    onChange={() => toggleCol(c.key)}
                  />
                  <span>
                    <b>{c.label}</b> <span style={{ color: "#777" }}>({c.key})</span>
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                onClick={() => setVisibleCols(DEFAULT_VISIBLE)}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Reset default
              </button>

              <button
                onClick={() => setShowCols(false)}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                Zatvori
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            overflow: "hidden",
            background: "white",
          }}
        >
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #eee",
              fontSize: 12,
              color: "#666",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            {loading ? "Učitavam..." : "Klik na red otvara detalje igrača"}
            <span style={{ marginLeft: "auto" }}>
              <Link href={`/team/${teamSlug}`} style={{ fontWeight: 600 }}>
                Natrag na module
              </Link>
            </span>
          </div>

          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              fontSize: 12, // small font
            }}
          >
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    title={c.key}
                    style={{
                      width: c.width,
                      textAlign: c.right ? "right" : "left",
                      padding: "6px 8px",
                      borderBottom: "1px solid #eee",
                      background: "#fbfbfb",
                      position: c.sticky ? "sticky" : "static",
                      left: c.sticky ? 0 : undefined,
                      zIndex: c.sticky ? 2 : 1,
                      whiteSpace: "nowrap",
                      fontWeight: 700,
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!loading && total === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 12, color: "#777" }}>
                    Nema rezultata za odabrane filtere.
                  </td>
                </tr>
              )}

              {players.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onRowClick(p.id)}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f1f1",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {columns.map((c) => {
                    const raw = p?.[c.key];
                    const val = c.fmt ? c.fmt(raw) : raw;

                    return (
                      <td
                        key={c.key}
                        style={{
                          width: c.width,
                          padding: "6px 8px",
                          textAlign: c.right ? "right" : "left",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          position: c.sticky ? "sticky" : "static",
                          left: c.sticky ? 0 : undefined,
                          background: c.sticky ? "white" : undefined,
                          zIndex: c.sticky ? 1 : 0,
                        }}
                        title={val ?? ""}
                      >
                        {val ?? ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
          Tip: drži default set kolona (bez skrola), a za analize otvori “Kolone” i privremeno upali što ti treba.
        </div>
      </div>
    </Layout>
  );
              }
