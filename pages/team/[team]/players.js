// pages/team/[team]/players.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import supabase from "../../../utils/supabaseClient";

export default function TeamPlayersPage() {
  const router = useRouter();
  const teamSlug = router.query.team; // "nt" ili "u21"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [players, setPlayers] = useState([]);

  // filteri (kao na tvojoj slici: search, pozicija, age min/max, primijeni)
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState(""); // "" = sve
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  // dedupe (NT ti ima duple): ključ = ht_id ako postoji, inače id
  const dedupedPlayers = useMemo(() => {
    const map = new Map();
    for (const p of players || []) {
      const key = p?.ht_id ?? p?.htid ?? p?.player_ht_id ?? p?.id;
      if (!map.has(key)) map.set(key, p);
    }
    return Array.from(map.values());
  }, [players]);

  async function fetchPlayers() {
    if (!teamSlug) return;

    setLoading(true);
    setError("");

    // Supabase RPC mora pogoditi TOČNA imena argumenata iz funkcije:
    // p_team_slug, p_search, p_pos, p_age_min, p_age_max
    const payload = {
      p_team_slug: String(teamSlug),
      p_search: search?.trim() ? search.trim() : null,
      p_pos: pos ? pos : null,
      p_age_min: ageMin !== "" ? Number(ageMin) : null,
      p_age_max: ageMax !== "" ? Number(ageMax) : null,
    };

    const { data, error } = await supabase.rpc("list_team_players", payload);

    if (error) {
      setPlayers([]);
      setError(error.message || String(error));
      setLoading(false);
      return;
    }

    setPlayers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // init load
  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug]);

  // helper za polja koja se razlikuju (ovisno što RPC vraća)
  function val(obj, keys, fallback = "—") {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== null && v !== undefined && v !== "") return v;
    }
    return fallback;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Igrači ({teamSlug?.toUpperCase?.() || ""})</h1>
          <div style={{ opacity: 0.7, marginTop: 4 }}>Aktivni tim: {teamSlug}</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ opacity: 0.7 }}>Popis igrača ({dedupedPlayers.length})</div>
          <button
            onClick={() => router.push(`/team/${teamSlug}`)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              cursor: "pointer",
            }}
          >
            Natrag na module
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          marginTop: 18,
          padding: 12,
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "rgba(255,255,255,0.6)",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: ime, HT ID, pozicija..."
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            minWidth: 260,
          }}
        />

        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            minWidth: 160,
            background: "white",
          }}
        >
          <option value="">Pozicija (sve)</option>
          <option value="GK">GK</option>
          <option value="DF">DF</option>
          <option value="IM">IM</option>
          <option value="W">W</option>
          <option value="FW">FW</option>
        </select>

        <input
          value={ageMin}
          onChange={(e) => setAgeMin(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Age min"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            width: 110,
          }}
        />
        <input
          value={ageMax}
          onChange={(e) => setAgeMax(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Age max"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            width: 110,
          }}
        />

        <button
          onClick={fetchPlayers}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          Primijeni
        </button>
      </div>

      {/* Error */}
      {error ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "rgba(255,0,0,0.08)",
            border: "1px solid rgba(255,0,0,0.25)",
          }}
        >
          <b>Greška:</b> {error}
        </div>
      ) : null}

      {/* Table */}
      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.10)",
          background: "white",
        }}
      >
        <div style={{ padding: 10, fontSize: 13, opacity: 0.7 }}>
          Klik na red otvara detalje igrača
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                {["Ime", "Poz", "God", "HTID", "Fo", "St", "TR", "DE", "PM", "SC", "SP"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: 14 }}>
                    Učitavam...
                  </td>
                </tr>
              ) : dedupedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: 14 }}>
                    Nema podataka.
                  </td>
                </tr>
              ) : (
                dedupedPlayers.map((p) => {
                  const id = val(p, ["id"], null);
                  const name = val(p, ["full_name", "name", "player_name"]);
                  const position = val(p, ["position", "pos"]);
                  const age = val(p, ["age", "age_y", "age_years"]);
                  const htId = val(p, ["ht_id", "htid", "player_ht_id"]);

                  const fo = val(p, ["form", "fo"]);
                  const st = val(p, ["stamina", "st"]);
                  const tr = val(p, ["trainer_skill", "tr"]);
                  const de = val(p, ["defending", "def", "de"]);
                  const pm = val(p, ["playmaking", "pm"]);
                  const sc = val(p, ["scoring", "sc"]);
                  const sp = val(p, ["set_pieces", "sp"]);

                  return (
                    <tr key={`${htId}-${id}`}>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {id ? (
                          <Link href={`/players/${id}?team=${teamSlug}`} style={{ textDecoration: "none" }}>
                            {name}
                          </Link>
                        ) : (
                          name
                        )}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {position}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {age}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {htId}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {fo}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {st}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {tr}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {de}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {pm}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {sc}
                      </td>
                      <td style={{ padding: "10px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {sp}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
