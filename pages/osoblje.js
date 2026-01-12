import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

const ROLE_OPTIONS = ["admin", "coach", "assistant", "head_scout", "scout"];

export default function Osoblje() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [team, setTeam] = useState(null);
  const [myRole, setMyRole] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);

  const [form, setForm] = useState({ email: "", role: "scout" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userEmail = data?.user?.email ?? null;
      if (!userEmail) {
        setAccess("denied");
        return;
      }
      setEmail(userEmail);

      // team iz users
      const { data: urows } = await supabase
        .from("users")
        .select("team_type")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0 || !urows[0].team_type) {
        setAccess("denied");
        return;
      }
      const t = urows[0].team_type;
      setTeam(t);

      // rola iz staff_roles (per team)
      const { data: srows } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("team_type", t)
        .eq("email", userEmail)
        .limit(1);

      if (!srows || srows.length === 0) {
        setAccess("denied");
        return;
      }
      setMyRole(srows[0].role);
      setAccess("ok");
    })();
  }, []);

  const canManage = useMemo(() => {
    // MVP: admin može sve. Kasnije: coach može uređivati, admin superuser.
    return myRole === "admin" || myRole === "coach";
  }, [myRole]);

  async function fetchStaff() {
    if (!team) return;
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("staff_roles")
      .select("id, email, role, team_type, created_at")
      .eq("team_type", team)
      .order("role", { ascending: true });

    if (error) alert("Greška kod dohvata osoblja: " + error.message);
    setRows(data || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && team) fetchStaff();
  }, [access, team]);

  async function upsertStaff(e) {
    e.preventDefault();
    if (!canManage) return;

    const targetEmail = form.email.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      alert("Upiši ispravan email.");
      return;
    }

    // 1) upiši/azuriraj staff_roles
    const { error } = await supabase
      .from("staff_roles")
      .upsert({ team_type: team, email: targetEmail, role: form.role }, { onConflict: "team_type,email" });

    if (error) {
      alert("Greška: " + error.message);
      return;
    }

    // 2) osiguraj da user postoji u users tablici (za login + team_type)
    // Ako user još nema račun, pojavit će se kad se prvi put registrira.
    // Ali team_type želimo setirati čim postoji.
    await supabase.from("users").upsert(
      { email: targetEmail, team_type: team, role: "admin" }, // role u users nam je MVP/legacy; staff_roles je pravo
      { onConflict: "email" }
    );

    setForm({ email: "", role: "scout" });
    fetchStaff();
  }

  async function changeRole(id, newRole, staffEmail) {
    if (!canManage) return;

    const { error } = await supabase.from("staff_roles").update({ role: newRole }).eq("id", id);
    if (error) alert("Greška: " + error.message);
    else fetchStaff();
  }

  async function removeStaff(id, staffEmail) {
    if (!canManage) return;
    if (!confirm(`Maknuti ${staffEmail} iz tima ${team}?`)) return;

    const { error } = await supabase.from("staff_roles").delete().eq("id", id);
    if (error) alert("Greška: " + error.message);
    else fetchStaff();
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>
        <h1 style={{ color: "#b91c1c" }}>Osoblje</h1>
        <p>Nemaš pristup.</p>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 24 }}>Učitavam...</main>;
  }

  return (
    <AppLayout pageTitle={`Osoblje — ${team}`}>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900 }}>Tvoj račun</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Email: <b>{email}</b> • Tim: <b>{team}</b> • Uloga: <b>{myRole}</b>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            MVP: admin/coach može dodavati i mijenjati osoblje. Kad dođe CHPP, coach će se dodjeljivati automatski.
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj / promijeni osobu</div>

          {!canManage ? (
            <div style={{ opacity: 0.75 }}>Nemaš ovlasti za uređivanje osoblja.</div>
          ) : (
            <form onSubmit={upsertStaff} style={{ display: "grid", gridTemplateColumns: "1fr 220px 160px", gap: 10 }}>
              <input
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email osobe"
                style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
              >
                Spremi
              </button>
            </form>
          )}
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", overflowX: "auto" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>
            Popis osoblja {loadingRows ? "(učitavam...)" : `(${rows.length})`}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                <th style={th}>Email</th>
                <th style={th}>Uloga</th>
                <th style={th}>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 10px", fontWeight: 900 }}>{r.email}</td>
                  <td style={{ padding: "10px 10px" }}>
                    {canManage ? (
                      <select
                        value={r.role}
                        onChange={(e) => changeRole(r.id, e.target.value, r.email)}
                        style={{ padding: 8, borderRadius: 10, border: "1px solid #e5e7eb" }}
                      >
                        {ROLE_OPTIONS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    ) : (
                      r.role
                    )}
                  </td>
                  <td style={{ padding: "10px 10px" }}>
                    {canManage ? (
                      <button
                        onClick={() => removeStaff(r.id, r.email)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 900, cursor: "pointer" }}
                      >
                        Makni
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}

              {!loadingRows && rows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 14, opacity: 0.7 }}>
                    Nema osoblja u ovom timu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

const th = { padding: "10px 10px", borderBottom: "1px solid #eee" };
