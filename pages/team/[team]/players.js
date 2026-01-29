import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!team) return;

    // trenutno NE diramo logiku fetcha (ostaje kako je bila 24.01)
    // ovo je samo UI + layout korak (2A)
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/players?team=${team}`);
        const data = await res.json();
        setPlayers(data || []);
      } catch (e) {
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [team]);

  if (!team) return null;

  return (
    <AppLayout fullWidth>
      <div className="shell">
        {/* LEFT SIDEBAR – IDENTIČNO KAO REQUESTS */}
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        {/* MAIN CONTENT */}
        <div className="main">
          <h1 style={{ marginBottom: 6 }}>Igrači ({team.toUpperCase()})</h1>
          <div style={{ opacity: 0.7, marginBottom: 12 }}>
            Aktivni tim: {team}
          </div>

          {/* FILTER BAR (minimal – portal stil dolazi u 2B) */}
          <div className="filters">
            <input placeholder="Search: ime, HT ID, pozicija…" />
            <input placeholder="Pozicija" />
            <input placeholder="Age min" />
            <input placeholder="Age max" />
            <button>Primijeni</button>
            <button>Kolone</button>
          </div>

          {/* TABLE */}
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Poz</th>
                  <th>God</th>
                  <th>HTID</th>
                  <th>Fo</th>
                  <th>St</th>
                  <th>TR</th>
                  <th>DE</th>
                  <th>PM</th>
                  <th>SC</th>
                  <th>SP</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="11">Učitavanje…</td>
                  </tr>
                )}

                {!loading && players.length === 0 && (
                  <tr>
                    <td colSpan="11">Nema igrača</td>
                  </tr>
                )}

                {!loading &&
                  players.map((p, i) => (
                    <tr key={i}>
                      <td>{p.full_name}</td>
                      <td>{p.position || "-"}</td>
                      <td>{p.age_years || "-"}</td>
                      <td>{p.ht_player_id || "-"}</td>
                      <td>{p.form || "-"}</td>
                      <td>{p.stamina || "-"}</td>
                      <td>{p.current_training || "-"}</td>
                      <td>{p.skill_defending || "-"}</td>
                      <td>{p.skill_playmaking || "-"}</td>
                      <td>{p.skill_scoring || "-"}</td>
                      <td>{p.skill_set_pieces || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 60px);
        }

        .sidebar {
          padding: 14px 0 18px 0;
        }

        .main {
          flex: 1;
          padding: 14px 18px 24px 18px;
          overflow-x: auto;
        }

        .filters {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .filters input {
          padding: 6px 8px;
        }

        .filters button {
          padding: 6px 10px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        th,
        td {
          padding: 6px 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          text-align: left;
          white-space: nowrap;
        }

        th {
          background: rgba(0, 0, 0, 0.04);
          font-weight: 800;
        }

        tr:hover td {
          background: rgba(0, 0, 0, 0.03);
        }
      `}</style>
    </AppLayout>
  );
}
