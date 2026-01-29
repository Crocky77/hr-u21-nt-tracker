import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     FILTER STATE (2B)
  ======================= */
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  const [minSkills, setMinSkills] = useState({
    gk: "",
    de: "",
    pm: "",
    wg: "",
    ps: "",
    sc: "",
    sp: "",
    stam: "",
    tsi: "",
    htms: "",
    htms28: "",
  });

  const [traits, setTraits] = useState({
    specialty: "any",
    agree: "any",
    agg: "any",
    hon: "any",
  });

  /* =======================
     COLUMNS (2B)
  ======================= */
  const [columns, setColumns] = useState({
    name: true,
    pos: true,
    age: true,
    htid: true,
    fo: true,
    st: true,
    tr: true,
    de: true,
    pm: true,
    sc: true,
    sp: true,
  });

  /* =======================
     LOAD PLAYERS (as-is)
  ======================= */
  useEffect(() => {
    if (!team) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/players?team=${team}`);
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : []);
      } catch {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [team]);

  /* =======================
     UI FILTER (TEMP – 2C = backend)
  ======================= */
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (search) {
        const s = search.toLowerCase();
        if (
          !p.full_name?.toLowerCase().includes(s) &&
          !String(p.ht_player_id || "").includes(s)
        )
          return false;
      }

      if (position && p.position !== position) return false;
      if (ageMin && p.age_years < Number(ageMin)) return false;
      if (ageMax && p.age_years > Number(ageMax)) return false;

      return true;
    });
  }, [players, search, position, ageMin, ageMax]);

  if (!team) return null;

  return (
    <AppLayout fullWidth>
      <div className="shell">
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        <div className="main">
          <h1>Igrači ({team.toUpperCase()})</h1>
          <div className="sub">
            Aktivni tim: {team} · Popis igrača ({filteredPlayers.length})
          </div>

          {/* ================= FILTERS ================= */}
          <div className="box">
            <div className="row">
              <input
                placeholder="Search: ime, HT ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                placeholder="Pozicija"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <input
                placeholder="Age min"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
              <input
                placeholder="Age max"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
              <button>Primijeni</button>
            </div>

            <div className="row grid">
              {[
                ["GK", "gk"],
                ["DEF", "de"],
                ["PM", "pm"],
                ["WING", "wg"],
                ["PASS", "ps"],
                ["SCOR", "sc"],
                ["SP", "sp"],
                ["STAM", "stam"],
                ["TSI", "tsi"],
                ["HTMS", "htms"],
                ["HTMS28", "htms28"],
              ].map(([label, key]) => (
                <input
                  key={key}
                  placeholder={`${label} ≥`}
                  value={minSkills[key]}
                  onChange={(e) =>
                    setMinSkills({ ...minSkills, [key]: e.target.value })
                  }
                />
              ))}
            </div>

            <div className="row">
              <select
                value={traits.specialty}
                onChange={(e) =>
                  setTraits({ ...traits, specialty: e.target.value })
                }
              >
                <option value="any">Specialty (any)</option>
                <option value="Q">Quick</option>
                <option value="H">Head</option>
                <option value="T">Technical</option>
              </select>

              <select
                value={traits.agree}
                onChange={(e) =>
                  setTraits({ ...traits, agree: e.target.value })
                }
              >
                <option value="any">Agreeability</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>

              <select
                value={traits.agg}
                onChange={(e) =>
                  setTraits({ ...traits, agg: e.target.value })
                }
              >
                <option value="any">Aggressiveness</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>

              <select
                value={traits.hon}
                onChange={(e) =>
                  setTraits({ ...traits, hon: e.target.value })
                }
              >
                <option value="any">Honesty</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* ================= COLUMNS ================= */}
          <div className="box">
            <strong>Kolone</strong>
            <div className="row grid">
              {Object.keys(columns).map((c) => (
                <label key={c}>
                  <input
                    type="checkbox"
                    checked={columns[c]}
                    onChange={() =>
                      setColumns({ ...columns, [c]: !columns[c] })
                    }
                  />{" "}
                  {c.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <table>
            <thead>
              <tr>
                {columns.name && <th>Ime</th>}
                {columns.pos && <th>Poz</th>}
                {columns.age && <th>God</th>}
                {columns.htid && <th>HTID</th>}
                {columns.fo && <th>Fo</th>}
                {columns.st && <th>St</th>}
                {columns.tr && <th>TR</th>}
                {columns.de && <th>DE</th>}
                {columns.pm && <th>PM</th>}
                {columns.sc && <th>SC</th>}
                {columns.sp && <th>SP</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="11">Učitavanje…</td>
                </tr>
              )}

              {!loading && filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan="11">Nema igrača</td>
                </tr>
              )}

              {!loading &&
                filteredPlayers.map((p, i) => (
                  <tr key={i}>
                    {columns.name && <td>{p.full_name}</td>}
                    {columns.pos && <td>{p.position}</td>}
                    {columns.age && <td>{p.age_years}</td>}
                    {columns.htid && <td>{p.ht_player_id}</td>}
                    {columns.fo && <td>{p.form}</td>}
                    {columns.st && <td>{p.stamina}</td>}
                    {columns.tr && <td>{p.current_training}</td>}
                    {columns.de && <td>{p.skill_defending}</td>}
                    {columns.pm && <td>{p.skill_playmaking}</td>}
                    {columns.sc && <td>{p.skill_scoring}</td>}
                    {columns.sp && <td>{p.skill_set_pieces}</td>}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 12px 0;
        }
        .main {
          flex: 1;
          padding: 16px;
          overflow-x: auto;
        }
        .sub {
          opacity: 0.7;
          margin-bottom: 10px;
        }
        .box {
          background: #fff;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 6px;
        }
        input,
        select {
          padding: 6px;
          font-size: 13px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th,
        td {
          padding: 6px;
          border-bottom: 1px solid #ddd;
          white-space: nowrap;
        }
        th {
          background: #f2f2f2;
          font-weight: 800;
        }
      `}</style>
    </AppLayout>
  );
}
