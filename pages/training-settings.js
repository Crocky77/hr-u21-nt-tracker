import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

export default function TrainingSettings() {
  const [access, setAccess] = useState("loading");
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null);
  const canManage = role === "admin" || role === "coach";

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const [form, setForm] = useState({
    profile_name: "",
    position: "IM",
    min_ht_years: 20,
    min_ht_days: 0,
    max_ht_years: 21,
    max_ht_days: 111,
    target_primary_skill: "playmaking",
    target_primary_level: 14,
    target_secondary_skill: "passing",
    target_secondary_level: 10,
    note: ""
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) return setAccess("denied");
      setEmail(userEmail);

      const { data: urows } = await supabase
        .from("users")
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) return setAccess("denied");
      setRole(urows[0].role);
      setTeamType(urows[0].team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  async function fetchProfiles() {
    if (!teamType) return;
    setLoadingRows(true);

    const { data, error } = await supabase
      .from("training_profiles")
      .select("*")
      .eq("team_type", teamType)
      .order("position", { ascending: true });

    if (!error && data) setRows(data);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && teamType) fetchProfiles();
  }, [access, teamType]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function addProfile(e) {
    e.preventDefault();
    const payload = { ...form, team_type: teamType };

    const { error } = await supabase.from("training_profiles").insert(payload);
    if (error) return alert("Greška: " + error.message);

    setForm((p) => ({ ...p, profile_name: "" }));
    fetchProfiles();
  }

  const grouped = useMemo(() => {
    const m = {};
    for (const r of rows) {
      if (!m[r.position]) m[r.position] = [];
      m[r.position].push(r);
    }
    return m;
  }, [rows]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        <h1 style={{ color: "#c00" }}>Postavke treninga</h1>
        <p>Nemaš pristup.</p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading" || !teamType) {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout
      title="Postavke treninga"
      subtitle={`Idealni profili (MVP) · Tim: ${teamType}`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <Link href="/alerts" style={btnGhost}>Upozorenja</Link>
          <button onClick={fetchProfiles} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      {!canManage ? (
        <div style={card}>
          <b>Read-only:</b> samo izbornik/admin može uređivati profile.
        </div>
      ) : (
        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Dodaj novi idealni profil</div>

          <form onSubmit={addProfile} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.7fr 0.7fr", gap: 10, marginTop: 12 }}>
            <input
              value={form.profile_name}
              onChange={(e) => setForm((p) => ({ ...p, profile_name: e.target.value }))}
              placeholder="Naziv profila"
              required
              style={input}
            />

            <select value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} style={input}>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="WB">WB</option>
              <option value="IM">IM</option>
              <option value="W">W</option>
              <option value="FWD">FWD</option>
            </select>

            <input type="number" value={form.min_ht_years} onChange={(e) => setForm((p) => ({ ...p, min_ht_years: Number(e.target.value) }))} style={input} />
            <input type="number" value={form.min_ht_days} onChange={(e) => setForm((p) => ({ ...p, min_ht_days: Number(e.target.value) }))} style={input} />

            <input type="number" value={form.max_ht_years} onChange={(e) => setForm((p) => ({ ...p, max_ht_years: Number(e.target.value) }))} style={input} />
            <input type="number" value={form.max_ht_days} onChange={(e) => setForm((p) => ({ ...p, max_ht_days: Number(e.target.value) }))} style={input} />

            <input value={form.target_primary_skill} onChange={(e) => setForm((p) => ({ ...p, target_primary_skill: e.target.value }))} placeholder="primarni skill" style={input} />
            <input type="number" value={form.target_primary_level} onChange={(e) => setForm((p) => ({ ...p, target_primary_level: Number(e.target.value) }))} style={input} />

            <input value={form.target_secondary_skill} onChange={(e) => setForm((p) => ({ ...p, target_secondary_skill: e.target.value }))} placeholder="sekundarni skill" style={input} />
            <input type="number" value={form.target_secondary_level} onChange={(e) => setForm((p) => ({ ...p, target_secondary_level: Number(e.target.value) }))} style={input} />

            <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="napomena" style={{ ...input, gridColumn: "span 4" }} />

            <button type="submit" style={{ gridColumn: "span 4", ...btnBlack }}>
              Dodaj profil
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            MVP: ovo su “ciljevi” po dobi. Kasnije dodajemo punu formulu i subskillove.
          </div>
        </div>
      )}

      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>Postojeći profili</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          Učitano: {loadingRows ? "…" : rows.length}
        </div>

        {Object.keys(grouped).length === 0 && !loadingRows ? (
          <div style={{ marginTop: 10, opacity: 0.7 }}>Nema profila.</div>
        ) : null}

        {Object.entries(grouped).map(([pos, list]) => (
          <div key={pos} style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{pos}</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                    <th style={th}>Profil</th>
                    <th style={th}>Raspon</th>
                    <th style={th}>Primarni cilj</th>
                    <th style={th}>Sekundarni cilj</th>
                    <th style={th}>Napomena</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.id}>
                      <td style={tdStrong}>{r.profile_name}</td>
                      <td style={td}>{r.min_ht_years}g {r.min_ht_days}d → {r.max_ht_years}g {r.max_ht_days}d</td>
                      <td style={td}>{r.target_primary_skill} {r.target_primary_level}</td>
                      <td style={td}>{r.target_secondary_skill || "—"} {r.target_secondary_level ?? ""}</td>
                      <td style={td}>{r.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
};

const input = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff"
};

const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#fff",
  textDecoration: "none",
  fontWeight: 900,
  color: "#111"
};

const btnBlack = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer"
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };
