import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../../lib/supabaseClient";

export default function TeamRequestsPage() {
  const router = useRouter();
  const { team } = router.query;

  const [teamId, setTeamId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NT ONLY – dohvat team_id
  useEffect(() => {
    if (!team) return;

    const loadTeam = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("teams")
        .select("id, team_type")
        .eq("slug", team)
        .single();

      if (error || !data) {
        setError("Ne mogu dohvatiti NT tim.");
        setLoading(false);
        return;
      }

      // samo NT
      if (data.team_type !== "NT") {
        setError("Ova stranica je samo za NT zahtjeve.");
        setLoading(false);
        return;
      }

      setTeamId(data.id);
    };

    loadTeam();
  }, [team]);

  // lista NT zahtjeva
  useEffect(() => {
    if (!teamId) return;

    const loadRequests = async () => {
      const { data, error } = await supabase.rpc(
        "list_team_requirements",
        { p_team_id: teamId }
      );

      if (error) {
        setError("Greška pri dohvaćanju zahtjeva.");
        setRequests([]);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    loadRequests();
  }, [teamId]);

  // brisanje zahtjeva
  const deleteRequest = async (id) => {
    if (!confirm("Obrisati NT zahtjev?")) return;

    const { error } = await supabase
      .from("requirements")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Greška pri brisanju.");
      return;
    }

    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Zahtjevi — NT</h1>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => alert("Z2 – unos zahtjeva slijedi")}>
          + Novi zahtjev
        </button>
      </div>

      {loading && <div>Učitavanje…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div>Nema definiranih NT zahtjeva.</div>
      )}

      {!loading && !error && requests.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Naziv</th>
              <th style={th}>Pravila</th>
              <th style={th}>Aktivno</th>
              <th style={th}>Kreirano</th>
              <th style={th}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.rules_count}</td>
                <td style={td}>{r.is_active ? "DA" : "NE"}</td>
                <td style={td}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td style={td}>
                  <button
                    onClick={() => deleteRequest(r.id)}
                    style={{ color: "red" }}
                  >
                    🗑 Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: 8,
};

const td = {
  borderBottom: "1px solid #eee",
  padding: 8,
};
