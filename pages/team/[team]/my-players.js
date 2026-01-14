// pages/team/[team]/my-players.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";
import { supabase } from "../../../utils/supabaseClient";

function normalizeTeamParam(teamParam) {
  if (!teamParam) return null;
  const t = String(teamParam).toLowerCase();
  if (t === "u21") return "U21";
  if (t === "nt") return "NT";
  return String(teamParam).toUpperCase();
}

export default function MyPlayersPage() {
  const router = useRouter();
  const teamParam = router.query.team;
  const teamType = useMemo(() => normalizeTeamParam(teamParam), [teamParam]);

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [userId, setUserId] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    ht_player_id: "",
    full_name: "",
  });

  // 1) Auth check: ovo je "moji igrači" → mora biti login
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;

      if (!mounted) return;

      if (!uid) {
        setAccess("denied");
        return;
      }

      setUserId(uid);
      setAccess("ok");
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function fetchRows() {
    if (!userId || !teamType) return;

    setLoadingRows(true);
    setErr("");

    const { data, error } = await supabase
      .from("user_global_players")
      .select("id, team_type, ht_player_id, full_name, notes, priority, source, created_at, updated_at")
      .eq("user_id", userId)
      .eq("team_type", teamType)
      .order("updated_at", { ascending: false });

    if (error) {
      setErr(error.message || "Greška kod dohvaćanja.");
      setRows([]);
      setLoadingRows(false);
      return;
    }

    setRows(data || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (access === "ok" && userId && teamType) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, userId, teamType]);

  async function addPlayer(e) {
    e.preventDefault();
    setErr("");

    const htId = Number(form.ht_player_id);
    if (!Number.isFinite(htId) || htId <= 0) {
      setErr("HT ID mora biti broj (npr. 453285255).");
      return;
    }

    // RLS traži user_id = auth.uid()
    const payload = {
      user_id: userId,
      team_type: teamType,
      ht_player_id: htId,
      full_name: form.full_name ? form.full_name.trim() : null,
      source: "manual",
    };

    const { error } = await supabase.from("user_global_players").insert(payload);

    if (error) {
      // duplicate unique index → user već ima tog igrača u tom timu
      if ((error.message || "").toLowerCase().includes("duplicate")) {
        setErr("Ovaj igrač je već u tvojoj listi.");
      } else {
        setErr(error.message || "Greška kod dodavanja.");
      }
      return;
    }

    setForm({ ht_player_id: "", full_name: "" });
    fetchRows();
  }

  async function removePlayer(id) {
    if (!confirm("Ukloniti igrača iz 'Moji igrači'?")) return;

    const { error } = await supabase
      .from("user_global_players")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Greška: " + (error.message || "delete failed"));
      return;
    }

    fetchRows();
  }

  const title = teamType ? `Moji igrači – ${teamType}` : "Moji igrači";

  if (access === "loading") {
    return (
      <AppLayout title={title}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>Učitavam...</div>
      </AppLayout>
    );
  }

  if (access === "denied") {
    return (
      <AppLayout title={title}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>{title}</h1>
          <p>
            <b>Nemaš pristup.</b> Ovo je privatna stranica (moji igrači).
          </p>
          <Link href="/login">→ Prijava</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>{title}</h1>
            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Ovdje su samo igrači koje si ti dodao (kasnije CHPP sync).
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              href={`/team/${String(teamParam || "").toLowerCase()}/dashboard`}
              style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #e5e7eb", textDecoration: "none", fontWeight: 900, background: "#fff", color: "#111" }}
            >
              Dashboard
            </Link>

            <Link
              href={`/team/${String(teamParam || "").toLowerCase()}/players`}
              style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #e5e7eb", textDecoration: "none", fontWeight: 900, background: "#fff", color: "#111" }}
            >
              Igrači (team)
            </Link>
          </div>
        </div>

        {/* Forma */}
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Dodaj igrača (ručno — dok čekamo CHPP)</div>

          <form onSubmit={addPlayer} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={form.ht_player_id}
              onChange={(e) => setForm((p) => ({ ...p, ht_player_id: e.target.value }))}
              placeholder="HT Player ID (npr. 453285255)"
              required
              style={{ flex: "1 1 260px", padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
            />

            <input
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Ime (opcionalno)"
              style={{ flex: "2 1 320px", padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
            />

            <button
              type="submit"
              style={{ padding: "10px 14px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}
            >
              Dodaj
            </button>
          </form>

          {err ? <div style={{ marginTop: 10, color: "crimson", fontWeight: 800 }}>{err}</div> : null}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: kad dođe CHPP, ovo će se puniti automatski s “tvojim igračima”.
          </div>
        </div>

        {/* Tablica */}
        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff", overflowX: "auto" }}>
          <div style={{ padding: 12, fontWeight: 900, borderBottom: "1px solid #e5e7eb" }}>
            Moji igrači {loadingRows ? "(učitavam...)" : `(${rows.length})`}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.75 }}>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Ime</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>HT ID</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Source</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Updated</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6", fontWeight: 900 }}>
                    {r.full_name || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.ht_player_id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>{r.source || "manual"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6", fontSize: 12, opacity: 0.8 }}>
                    {r.updated_at ? new Date(r.updated_at).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f4f6" }}>
                    <button
                      onClick={() => removePlayer(r.id)}
                      style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 12, padding: "8px 10px", cursor: "pointer", fontWeight: 900 }}
                    >
                      Ukloni
                    </button>
                  </td>
                </tr>
              ))}

              {!loadingRows && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 14, opacity: 0.75 }}>
                    Nema igrača još. Dodaj prvog gore.
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
