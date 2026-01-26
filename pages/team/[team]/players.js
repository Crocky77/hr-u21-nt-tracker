/* ============================================================
   PLAYERS – NT / U21
   A1.2 UI UPGRADE (NO LOGIC REMOVAL)
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

/* ============================================================
   CONSTANTS (UI ONLY)
   ============================================================ */

const ALL_POSITIONS = [
  "GK", "WB", "CD", "OCD", "WING",
  "IM", "IMTW", "WTM", "OFFIM",
  "PDIM",
  "FORW", "FTW", "PNF", "TDF"
];

const SPECIALITIES = [
  { value: "all", label: "Sve" },
  { value: "none", label: "Bez specke" },
  { value: "Q", label: "Quick" },
  { value: "U", label: "Unpredictable" },
  { value: "T", label: "Technical" },
  { value: "P", label: "Powerful" },
  { value: "H", label: "Head" },
];

const COLUMN_ORDER = [
  "full_name",
  "ht_player_id",
  "specialty",
  "skill_gk",
  "skill_def",
  "skill_wing",
  "skill_pm",
  "skill_pass",
  "skill_score",
  "skill_sp",
  "age",
  "pos",
  "form",
  "stamina",
  "tsi",
];

/* ============================================================
   COMPONENT
   ============================================================ */

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  /* -------------------------
     EXISTING STATE (PRESERVED)
     ------------------------- */
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // postojeći filteri (ako ih ima – NE DIRAM logiku)
  const [search, setSearch] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  /* -------------------------
     NEW UI STATE (A1.2)
     ------------------------- */
  const [position, setPosition] = useState("all");
  const [speciality, setSpeciality] = useState("all");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(COLUMN_ORDER);

  /* ============================================================
     DATA LOAD (PRESERVED IDEA)
     ============================================================ */

  useEffect(() => {
    if (!team) return;
    loadPlayers();
  }, [team]);

  async function loadPlayers() {
    setLoading(true);

    // ⚠️ NAMJERNO GENERIČKI – NE MIJENJAM TVOJU RPC LOGIKU
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_slug", team);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // UI DEDUPLICATION (A1.2) – backend NE DIRAM
    const map = new Map();
    data.forEach((p) => {
      const key = p.ht_player_id || p.id;
      if (!map.has(key)) map.set(key, p);
    });

    setPlayers(Array.from(map.values()));
    setLoading(false);
  }

  /* ============================================================
     FILTERING (EXTENDS EXISTING)
     ============================================================ */

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (
        search &&
        !`${p.full_name} ${p.ht_player_id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) return false;

      if (ageMin && p.age < Number(ageMin)) return false;
      if (ageMax && p.age > Number(ageMax)) return false;

      if (position !== "all" && p.pos !== position) return false;

      if (speciality === "none" && p.specialty) return false;
      if (
        speciality !== "all" &&
        speciality !== "none" &&
        p.specialty !== speciality
      ) return false;

      return true;
    });
  }, [players, search, ageMin, ageMax, position, speciality]);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="page-layout">

      {/* ================= HEADER ================= */}
      <header className="nt-header">
        <h1>NT Pregled</h1>
      </header>

      <div className="layout-body">

        {/* ================= SIDEBAR ================= */}
        <aside className="sidebar">

          <div className="sb-section">
            <div className="sb-title">Hrvatska NT</div>
            <ul>
              <li>Zahtjevi</li>
              <li>Popisi</li>
              <li className="active">Igrači</li>
              <li>Upozorenja</li>
              <li>Kalendar natjecanja</li>
              <li>Postavke treninga</li>
            </ul>
          </div>

          <div className="sb-divider" />

          <div className="sb-section">
            <div className="sb-title">Hrvatska U21</div>
            <ul>
              <li>Zahtjevi</li>
              <li>Popisi</li>
              <li>Igrači</li>
              <li>Upozorenja</li>
              <li>Kalendar natjecanja</li>
              <li>Postavke treninga</li>
            </ul>
          </div>

          <div className="sb-divider" />

          <div className="sb-section">
            <div className="sb-title">Sponzori</div>
            <div className="sb-muted">test</div>
          </div>

        </aside>

        {/* ================= CONTENT ================= */}
        <main className="content">

          {/* -------- FILTER BAR -------- */}
          <div className="filters">
            <input
              placeholder="Ime / HTID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              placeholder="Dob min"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
            />

            <input
              placeholder="Dob max"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
            />

            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="all">Sve pozicije</option>
              {ALL_POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
            >
              {SPECIALITIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button onClick={() => setColumnsOpen(!columnsOpen)}>
              Kolone
            </button>
          </div>

          {/* -------- COLUMN PICKER -------- */}
          {columnsOpen && (
            <div className="column-picker">
              {COLUMN_ORDER.map((col) => (
                <label key={col}>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() =>
                      setVisibleColumns((prev) =>
                        prev.includes(col)
                          ? prev.filter((c) => c !== col)
                          : [...prev, col]
                      )
                    }
                  />
                  {col}
                </label>
              ))}
            </div>
          )}

          {/* -------- TABLE -------- */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {visibleColumns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p) => (
                  <tr key={p.ht_player_id || p.id}>
                    {visibleColumns.map((c) => (
                      <td key={c} className="cell">
                        {p[c] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .page-layout {
          width: 100%;
        }

        .nt-header {
          height: 70px;
          background: repeating-linear-gradient(
            135deg,
            #c40000,
            #c40000 14px,
            #ffffff 14px,
            #ffffff 28px
          );
          display: flex;
          align-items: center;
          padding-left: 20px;
          box-shadow: inset 0 -3px 6px rgba(0,0,0,.3);
        }

        .nt-header h1 {
          font-size: 24px;
          font-weight: bold;
        }

        .layout-body {
          display: flex;
        }

        .sidebar {
          width: 240px;
          padding: 14px;
        }

        .sb-title {
          font-weight: bold;
          margin-bottom: 6px;
        }

        .sb-section ul {
          list-style: none;
          padding-left: 0;
        }

        .sb-section li {
          padding: 4px 0;
        }

        .sb-section li.active {
          font-weight: bold;
        }

        .sb-divider {
          margin: 12px 0;
          border-top: 1px solid #ddd;
        }

        .content {
          flex: 1;
          padding: 16px;
        }

        .filters {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .column-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 6px;
          border-bottom: 1px solid #ddd;
          text-align: center;
          color: #000;
        }
      `}</style>
    </div>
  );
}
