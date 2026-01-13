// pages/team/[team]/alerts.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function teamLabel(team) {
  return team === "u21" ? "U21 Hrvatska" : "NT Hrvatska";
}
function teamTypeDB(team) {
  return team === "u21" ? "U21" : "NT";
}

export default function TeamAlerts() {
  const router = useRouter();
  const team = (router.query.team || "").toString().toLowerCase();

  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userTeamType, setUserTeamType] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role || "");
      setUserTeamType(urows[0].team_type || null);
      setAccess("ok");
    })();
  }, []);

  useEffect(() => {
    if (access !== "ok") return;
    if (!team || (team !== "u21" && team !== "nt")) return;

    const wanted = teamTypeDB(team);
    if (role !== "admin") {
      if (!userTeamType || userTeamType !== wanted) {
        router.replace("/");
      }
    }
  }, [access, team, role, userTeamType, router]);

  async function fetchAlerts() {
    if (!team || (team !== "u21" && team !== "nt")) return;
    setLoading(true);

    const wanted = teamTypeDB(team);

    const { data, error } = await supabase
      .from("training_alerts")
      .select("*")
      .eq("team_type", wanted)
      .order("created_at", { ascending: false });

    if (!error && data) setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    if (access === "ok") fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, team]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!query) return true;
      const msg = (r.message || "").toLowerCase();
      const sev = (r.severity || "").toLowerCase();
      const type = (r.alert_type || "").toLowerCase();
      return msg.includes(query) || sev.includes(query) || type.includes(query);
    });
  }, [rows, q]);

  async function toggleResolved(id, current) {
    const { error } = await supabase.from("training_alerts").update({ resolved: !current }).eq("id", id);
    if (error) alert("Greška: " + error.message);
    else fetchAlerts();
  }

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, border: "1px solid #e5e7eb" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Upozorenja</h1>
          <p><strong>Nemaš pristup.</strong></p>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading" || !team) {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Hrvatski U21/NT Tracker" team={team} teamLabel={teamLabel(team)} email={email} role={role}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Upozorenja</h1>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
            Aktivni tim: <strong>{teamLabel(team)}</strong>
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: message / severity / type..."
          style={{ flex: 1, minWidth: 260, padding: 12, borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff" }}
        />

        <button
          onClick={fetchAlerts}
          style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
        >
          Osvježi
        </button>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, background: "#fff", overflowX: "auto" }}>
        <div style={{ padding: 12, fontWeight: 1000, borderBottom: "1px solid #e5e7eb" }}>
          Training alerti {loading ? " (učitavam...)" : `(${filtered.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Status</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Severity</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Type</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Message</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Due</th>
              <th style={{ padding: "10px 10px", borderBottom: "1px solid #eee" }}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const resolved = !!r.resolved;
              return (
                <tr key={r.id}>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                    {resolved ? "✅ resolved" : "⚠️ open"}
                  </td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.severity || "—"}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.alert_type || "—"}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.message || "—"}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>{r.due_date || "—"}</td>
                  <td style={{ padding: "10px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    <button
                      onClick={() => toggleResolved(r.id, resolved)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        fontWeight: 900,
                        cursor: "pointer"
                      }}
                    >
                      {resolved ? "Otvori" : "Zatvori"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 14, opacity: 0.75 }}>
                  Nema alertova za ovaj tim.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
