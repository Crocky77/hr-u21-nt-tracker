import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [loading, setLoading] = useState(true);

  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const [players, setPlayers] = useState([]);

  /* -------------------------
     LOAD REQUIREMENTS
  --------------------------*/
  useEffect(() => {
    if (!team) return;

    const loadRequirements = async () => {
      const { data, error } = await supabase
        .from("requirements")
        .select("id, name")
        .eq("team_type", team)
        .order("name");

      if (!error) {
        setRequirements(data || []);
        if (data?.length) {
          setSelectedRequirement(data[0].id); // default = prvi zahtjev
        }
      }
    };

    loadRequirements();
  }, [team]);

  /* -------------------------
     LOAD PLAYERS BY REQUIREMENT
  --------------------------*/
  useEffect(() => {
    if (!team || !selectedRequirement) return;

    const loadPlayers = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc(
        "list_players_by_requirement",
        {
          p_team_type: team,
          p_requirement_id: selectedRequirement,
        }
      );

      if (!error) {
        // dedupe by ht_player_id OR full_name fallback
        const map = new Map();
        (data || []).forEach((p) => {
          const key = p.ht_player_id || p.full_name;
          if (!map.has(key)) map.set(key, p);
        });
        setPlayers([...map.values()]);
      } else {
        setPlayers([]);
      }

      setLoading(false);
    };

    loadPlayers();
  }, [team, selectedRequirement]);

  /* -------------------------
     TABLE COLUMNS (STATIC FOR NOW)
  --------------------------*/
  const columns = useMemo(
    () => [
      { key: "full_name", label: "Ime" },
      { key: "position", label: "Poz" },
      { key: "age_years", label: "God" },
      { key: "ht_player_id", label: "HTID" },
      { key: "form", label: "Fo" },
      { key: "stamina", label: "St" },
      { key: "current_training", label: "TR" },
      { key: "skill_defending", label: "DE" },
      { key: "skill_playmaking", label: "PM" },
      { key: "skill_scoring", label: "SC" },
      { key: "skill_set_pieces", label: "SP" },
    ],
    []
  );

  return (
    <AppLayout title="Igrači">
      <div style={{ padding: "20px", maxWidth: "1400px" }}>
        <h1>Igrači ({team?.toUpperCase()})</h1>
        <div style={{ marginBottom: 10, color: "#666" }}>
          Aktivni tim: {team} · Popis igrača ({players.length})
        </div>

        {/* -------------------------
            FILTER BAR (REQUIREMENT)
        --------------------------*/}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <select
            value={selectedRequirement || ""}
            onChange={(e) => setSelectedRequirement(e.target.value)}
          >
            {requirements.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button disabled>Display data filter</button>
          <button disabled>Display column filter</button>
        </div>

        {/* -------------------------
            TABLE
        --------------------------*/}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      textAlign: "left",
                      padding: "6px 8px",
                      borderBottom: "1px solid #ccc",
                      background: "#f2f2f2",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length}>Učitavanje…</td>
                </tr>
              )}

              {!loading && players.length === 0 && (
                <tr>
                  <td colSpan={columns.length}>Nema igrača</td>
                </tr>
              )}

              {!loading &&
                players.map((p) => (
                  <tr key={p.id}>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        style={{
                          padding: "4px 8px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {p[c.key] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
