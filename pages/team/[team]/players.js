import AppLayout from "../../../components/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

function PlayersPage({ team }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [team]);

  async function loadPlayers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_type", team)
      .order("full_name", { ascending: true });

    if (!error) setPlayers(data || []);
    setLoading(false);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Igrači ({team.toUpperCase()})</h1>
        <div className="page-subtitle">
          Aktivni tim: <b>{team}</b> · Popis igrača ({players.length})
        </div>
      </div>

      <div className="page-card">
        <div className="filters-row">
          <input placeholder="Search: ime, HT ID, pozicija…" />
          <input placeholder="Pozicija" />
          <input placeholder="Age min" />
          <input placeholder="Age max" />
          <button>Primijeni</button>
          <button>Kolone</button>
        </div>

        {loading ? (
          <div className="loading">Učitavanje…</div>
        ) : (
          <table className="data-table">
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
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{p.position || "-"}</td>
                  <td>{p.age_years}</td>
                  <td>{p.ht_player_id || "-"}</td>
                  <td>{p.form}</td>
                  <td>{p.stamina}</td>
                  <td>{p.current_training || "-"}</td>
                  <td>{p.skill_defending}</td>
                  <td>{p.skill_playmaking}</td>
                  <td>{p.skill_scoring}</td>
                  <td>{p.skill_set_pieces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

PlayersPage.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      team: params.team,
    },
  };
}

export default PlayersPage;
