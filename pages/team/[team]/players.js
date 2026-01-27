import AppLayout from "../../../components/AppLayout";
import { useEffect, useState } from "react";
import supabase from "../../../lib/supabaseClient";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlayers = async () => {
      const { data, error } = await supabase.rpc("list_team_players", {
        team_slug: "nt",
      });

      if (error) {
        setError(error.message);
        setPlayers([]);
      } else {
        setPlayers(data || []);
        setError(null);
      }
    };

    loadPlayers();
  }, []);

  return (
    <AppLayout team="nt">
      <div className="page-container">
        <h1>Igrači</h1>

        {error && (
          <div className="error-box">
            Greška: {error}
          </div>
        )}

        {!error && (
          <div className="table-wrapper">
            <table className="players-table">
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>HTID</th>
                  <th>Spec</th>
                  <th>GK</th>
                  <th>DEF</th>
                  <th>WING</th>
                  <th>PM</th>
                  <th>PASS</th>
                  <th>SCOR</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr>
                    <td colSpan="9">Nema podataka.</td>
                  </tr>
                )}

                {players.map((p) => (
                  <tr key={p.htid}>
                    <td>{p.name}</td>
                    <td>{p.htid}</td>
                    <td>{p.specialty || "-"}</td>
                    <td>{p.gk}</td>
                    <td>{p.def}</td>
                    <td>{p.wing}</td>
                    <td>{p.pm}</td>
                    <td>{p.pass}</td>
                    <td>{p.scor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
