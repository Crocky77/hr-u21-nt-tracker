import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

const ROLE_LABEL = {
  coach: "Izbornik",
  assistant: "Pomoćnik izbornika",
  head_scout: "Glavni skaut",
  scout: "Skaut"
};

export default function Staff() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [teamType, setTeamType] = useState(null); // U21 | NT

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const canManage = role === "admin" || role === "coach";

  const [form, setForm] = useState({
    email: "",
    ht_nick: "",
    role: "scout"
  });

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
        .select("role, team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role);
      setTeamType(urows[0].team_type || "U21");
      setAccess("ok");
    })();
  }, []);

  async function fetchStaff() {
    if (!teamType) return;
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("staff_members")
      .select("id, team_type, email, ht_nick, role, created_at")
      .eq("team_type", teamType)
      .order("role", { ascending: true });

    if (!error && data) setRows(data);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && teamType) fetchStaff();
  }, [access, teamType]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function addMember(e) {
    e.preventDefault();

    const payload = {
      team_type: teamType,
      email: form.email.trim().toLowerCase(),
      ht_nick: form.ht_nick.trim() || null,
      role: form.role
    };

    const { error } = await supabase.from("staff_members").insert(payload);
    if (error) return alert("Greška: " + error.message);

    setForm({ email: "", ht_nick: "", role: "scout" });
    fetchStaff();
  }

  async function removeMember(id) {
    if (!confirm("Obrisati člana osoblja?")) return;
    const { error } = await supabase.from("staff_members").delete().eq("id", id);
    if (error) return alert("Greška: " + error.message);
    fetchStaff();
  }

  const sorted = useMemo(() => {
    const order = { coach: 1, assistant: 2, head_scout: 3, scout: 4 };
    return [...rows].sort((a, b) => (order[a.role] || 99) - (order[b.role] || 99));
  }, [rows]);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Osoblje</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading" || !teamType) {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout
      title="Osoblje"
      subtitle={`Aktivni tim: ${teamType} Hrvatska`}
      userLine={`Ulogiran: ${email} · Uloga: ${role}`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          <Link href="/players" style={btnGhost}>Igrači</Link>
          <Link href="/alerts" style={btnGhost}>Trening alarmi</Link>
          <button onClick={fetchStaff} style={btnGhost}>Osvježi</button>
          <button onClick={logout} style={btnBlack}>Odjava</button>
        </div>
      }
    >
      {canManage ? (
        <div style={card}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Dodaj člana osoblja</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            MVP: trenutno dodajemo ručno. Kasnije izbornik dodaje osoblje nakon CHPP autorizacije.
          </div>

          <form onSubmit={addMember} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 10, marginTop: 12 }}>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              placeholder="Email (mora biti prijavljen korisnik)"
              style={input}
            />
            <input
              value={form.ht_nick}
              onChange={(e) => setForm((p) => ({ ...p, ht_nick: e.target.value }))}
              placeholder="HT nick (opcionalno)"
              style={input}
            />
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              style={input}
            >
              <option value="assistant">Pomoćnik</option>
              <option value="head_scout">Glavni skaut</option>
              <option value="scout">Skaut</option>
              {/* coach u praksi dolazi iz CHPP / users.role; ali možeš i ručno ako baš treba */}
              <option value="coach">Izbornik</option>
            </select>

            <button type="submit" style={{ gridColumn: "span 3", ...btnBlack }}>
              Dodaj u {teamType}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ ...card, opacity: 0.95 }}>
          <div style={{ fontWeight: 900 }}>Napomena</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Samo izbornik i admin mogu mijenjati osoblje. Ti trenutno imaš read-only pristup.
          </div>
        </div>
      )}

      <div style={{ ...card, marginTop: 14, overflowX: "auto" }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          Popis osoblja {loadingRows ? " (učitavam...)" : `(${sorted.length})`}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
              <th style={th}>Uloga</th>
              <th style={th}>HT nick</th>
              <th style={th}>Email</th>
              <th style={th}>Akcija</th>
            </tr>
          </thead>
          <tbody>
            {!loadingRows && sorted.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 12, opacity: 0.7 }}>Nema unosa. (Izbornik/admin može dodati.)</td></tr>
            ) : null}

            {sorted.map((r) => (
              <tr key={r.id}>
                <td style={tdStrong}>{ROLE_LABEL[r.role] || r.role}</td>
                <td style={td}>{r.ht_nick || "—"}</td>
                <td style={td}>{r.email}</td>
                <td style={td}>
                  {canManage ? (
                    <button onClick={() => removeMember(r.id)} style={btnDanger}>Obriši</button>
                  ) : (
                    <span style={{ opacity: 0.6 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const btnDanger = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #fecaca",
  background: "#fff",
  color: "#991b1b",
  fontWeight: 900,
  cursor: "pointer"
};

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
const td = { padding: "10px 10px", borderBottom: "1px solid #f3f4f6" };
const tdStrong = { ...td, fontWeight: 900 };
