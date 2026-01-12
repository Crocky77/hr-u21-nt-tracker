import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

function level(diff) {
  if (diff == null) return { label: "—", tone: "#e5e7eb", text: "#111" };
  if (diff >= 0) return { label: "OK", tone: "#dcfce7", text: "#166534" };
  if (diff >= -1.5) return { label: "WARNING", tone: "#ffedd5", text: "#9a3412" };
  return { label: "CRITICAL", tone: "#fee2e2", text: "#991b1b" };
}

export default function TreningAlarmi() {
  const [access, setAccess] = useState("loading");
  const [team, setTeam] = useState(null);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) {
        setAccess("denied");
        return;
      }

      const { data: urows } = await supabase
        .from("users")
        .select("team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0 || !urows[0].team_type) {
        setAccess("denied");
        return;
      }

      setTeam(urows[0].team_type);
      setAccess("ok");
    })();
  }, []);

  async function fetchRows() {
    if (!team) return;
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("players")
      .select("id, full_name, position, team_type, status, ideal_training_score, actual_training_score")
      .eq("team_type", team)
      .order("id", { ascending: false });

    if (error) alert("Greška: " + error.message);
    setRows(data || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && team) fetchRows();
  }, [access, team]);

  const computed = useMemo(() => {
    return rows.map((r) => {
      const ideal = r.ideal_training_score == null ? null : Number(r.ideal_training_score);
      const actual = r.actual_training_score == null ? null : Number(r.actual_training_score);
      const diff = ideal == null || actual == null ? null : (actual - ideal);
      return { ...r, ideal, actual, diff };
    });
  }, [rows]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
        <h1 style={{ color: "#b91c1c" }}>Trening alarmi</h1>
        <p>Nemaš pristup.</p>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>Učitavam...</main>;
  }

  return (
    <AppLayout pageTitle={`Trening alarmi — ${team}`}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
          Alarm lista {loadingRows ? "(učitavam...)" : `(${computed.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Igrač</th>
              <th style={th}>Poz</th>
              <th style={th}>Ideal</th>
              <th style={th}>Actual</th>
              <th style={th}>Razlika</th>
              <th style={th}>Alarm</th>
            </tr>
          </thead>

          <tbody>
            {computed.map((r) => {
              const st = level(r.diff);
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 10px", fontWeight: 900 }}>{r.full_name}</td>
                  <td style={{ padding: "10px 10px" }}>{r.position}</td>
                  <td style={{ padding: "10px 10px" }}>{r.ideal ?? "—"}</td>
                  <td style={{ padding: "10px 10px" }}>{r.actual ?? "—"}</td>
                  <td style={{ padding: "10px 10px", fontWeight: 900 }}>
                    {r.diff == null ? "—" : r.diff.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 10px" }}>
                    <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 12, background: st.tone, color: st.text, fontWeight: 900 }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}

            {!loadingRows && computed.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, opacity: 0.7 }}>
                  Nema igrača u bazi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Ovo je skeleton. Kasnije: ideal/actual se računaju iz CHPP podataka (trening, trener, asistenti, intenzitet, stamina share, skill/subskill).
      </div>
    </AppLayout>
  );
}

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
