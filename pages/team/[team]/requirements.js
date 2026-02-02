import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "../../../lib/supabaseClient";

export default function TeamRequirementsPage() {
  const router = useRouter();
  const { team } = router.query;

  const [teamId, setTeamId] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1️⃣ Dohvati team_id po slug-u
  useEffect(() => {
    if (!team) return;

    const loadTeam = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("teams")
        .select("id, name")
        .eq("slug", team)
        .single();

      if (error) {
        setError("Ne mogu dohvatiti tim.");
        setLoading(false);
        return;
      }

      setTeamId(data.id);
      setLoading(false);
    };

    loadTeam();
  }, [team]);

  // 2️⃣ Dohvati zahtjeve za tim
  useEffect(() => {
    if (!teamId) return;

    const loadRequirements = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        "list_team_requirements",
        { p_team_id: teamId }
      );

      if (error) {
        setError("Ne mogu dohvatiti zahtjeve.");
      } else {
        setRequirements(data || []);
      }

      setLoading(false);
    };

    loadRequirements();
  }, [teamId]);

  // 3️⃣ Brisanje zahtjeva
  const deleteRequirement = async (id) => {
    const confirmDelete = confirm(
      "Jesi li siguran da želiš obrisati ovaj zahtjev?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("requirements")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Greška pri brisanju zahtjeva.");
      return;
    }

    // osvježi listu lokalno
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  // 4️⃣ Render
  return (
    <div style={{ padding: "20px" }}>
      <h1>Zahtjevi</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => alert("Dodavanje zahtjeva dolazi u Z2")}
        >
          ➕ Novi zahtjev
        </button>
      </div>

      {loading && <div>Učitavanje…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && requirements.length === 0 && (
        <div>Nema definiranih zahtjeva.</div>
      )}

      {!loading && requirements.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Naziv</th>
              <th style={th}>Broj pravila</th>
              <th style={th}>Aktivno</th>
              <th style={th}>Kreirano</th>
              <th style={th}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.rules_count}</td>
                <td style={td}>{r.is_active ? "DA" : "NE"}</td>
                <td style={td}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td style={td}>
                  <button
                    onClick={() => deleteRequirement(r.id)}
                    style={{ color: "red" }}
                  >
                    🗑️ Obriši
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

// jednostavni inline stilovi (namjerno minimalno)
const th = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "8px",
};

const td = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};
