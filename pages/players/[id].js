import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabaseClient } from "../../utils/supabaseClient";

function Badge({ label, value, color = "#111", bg = "#f3f4f6" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 6,
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 800,
        border: "1px solid #e5e7eb",
      }}
    >
      <span style={{ opacity: 0.7, fontWeight: 900 }}>{label}:</span>
      <span>{value ?? "-"}</span>
    </span>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,.06)",
      }}
    >
      {title && (
        <div style={{ fontWeight: 1000, marginBottom: 10, fontSize: 14 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export default function PlayerProfileLegacy() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [snap, setSnap] = useState(null);
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [noteVisibility, setNoteVisibility] = useState("team");
  const [noteRating, setNoteRating] = useState(3);
  const [noteTag, setNoteTag] = useState("watch");

  const [snapEdit, setSnapEdit] = useState({
    form: "",
    stamina: "",
    tsi: "",
    training_type: "",
    training_intensity: "",
    stamina_share: "",
    coach_level: "",
    assistant_count: "",
    medic_count: "",
    form_coach_count: "",
  });

  const playerIdNum = useMemo(() => {
    if (!id) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (!mounted) return;
      setUser(data?.user ?? null);

      if (data?.user) {
        const { data: roleRow } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setRole(roleRow?.role ?? null);
      } else {
        setRole(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!playerIdNum) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      // Player
      const { data: p, error: pErr } = await supabaseClient
        .from("players")
        .select(
          `
          id,
          full_name,
          position,
          age_years,
          age_days,
          ht_id,
          ht_player_id,
          nationality,
          team_type,
          is_active,
          status,
          last_seen,
          skill_goalkeeping,
          skill_defending,
          skill_playmaking,
          skill_winger,
          skill_passing,
          skill_scoring,
          skill_set_pieces,
          salary,
          form,
          stamina,
          current_training
        `
        )
        .eq("id", playerIdNum)
        .maybeSingle();

      // Snapshot (optional)
      const { data: s } = await supabaseClient
        .from("player_snapshots")
        .select("*")
        .eq("player_id", playerIdNum)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Notes (optional)
      const { data: n } = await supabaseClient
        .from("player_notes")
        .select("*")
        .eq("player_id", playerIdNum)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      setPlayer(pErr ? null : p ?? null);
      setSnap(s ?? null);
      setNotes(n ?? []);

      if (s) {
        setSnapEdit({
          form: s.form ?? "",
          stamina: s.stamina ?? "",
          tsi: s.tsi ?? "",
          training_type: s.training_type ?? "",
          training_intensity: s.training_intensity ?? "",
          stamina_share: s.stamina_share ?? "",
          coach_level: s.coach_level ?? "",
          assistant_count: s.assistant_count ?? "",
          medic_count: s.medic_count ?? "",
          form_coach_count: s.form_coach_count ?? "",
        });
      } else {
        setSnapEdit({
          form: "",
          stamina: "",
          tsi: "",
          training_type: "",
          training_intensity: "",
          stamina_share: "",
          coach_level: "",
          assistant_count: "",
          medic_count: "",
          form_coach_count: "",
        });
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [playerIdNum]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!user) return alert("Moraš biti prijavljen.");
    if (!playerIdNum) return;
    if (!noteText.trim()) return;

    const payload = {
      player_id: playerIdNum,
      author_id: user.id,
      visibility: noteVisibility,
      rating: noteRating,
      tag: noteTag,
      note: noteText.trim(),
    };

    const { error } = await supabaseClient.from("player_notes").insert(payload);
    if (error) return alert(error.message);

    setNoteText("");

    const { data: n } = await supabaseClient
      .from("player_notes")
      .select("*")
      .eq("player_id", playerIdNum)
      .order("created_at", { ascending: false });

    setNotes(n ?? []);
  };

  const upsertSnapshot = async (e) => {
    e.preventDefault();
    if (!user) return alert("Moraš biti prijavljen.");
    if (role !== "admin") return alert("Samo admin može uređivati snapshot.");
    if (!playerIdNum) return;

    const payload = {
      player_id: playerIdNum,
      updated_by: user.id,
      ...snapEdit,
    };

    const { error } = await supabaseClient
      .from("player_snapshots")
      .upsert(payload, { onConflict: "player_id" });

    if (error) return alert(error.message);

    const { data: s } = await supabaseClient
      .from("player_snapshots")
      .select("*")
      .eq("player_id", playerIdNum)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSnap(s ?? null);
    alert("Snapshot spremljen.");
  };

  if (loading) return <div style={{ padding: 24 }}>Učitavam...</div>;

  if (!player) {
    return (
      <main
        style={{
          fontFamily: "Arial, sans-serif",
          padding: 24,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ color: "#c00" }}>Profil igrača</h1>
          {/* Legacy route: fallback to U21 list */}
          <Link href="/team/u21/players" style={{ fontWeight: 900 }}>
            ← Igrači
          </Link>
        </div>
        <div style={{ marginTop: 10 }}>Igrač nije pronađen.</div>
      </main>
    );
  }

  // Back link: always return to the correct team list (NT vs U21).
  // This file is a legacy/global details route, so we infer the team from player.team_type.
  // If team_type is missing/unknown, default to U21.
  const teamSlug =
    String(player.team_type || "")
      .trim()
      .toLowerCase() === "nt"
      ? "nt"
      : "u21";
  const backHref = `/team/${teamSlug}/players`;

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>
            Hrvatski U21/NT Tracker
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 34, fontWeight: 1000, color: "#c00" }}>
            {player.full_name}
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link href={backHref} style={{ fontWeight: 900 }}>
            ← Igrači
          </Link>
          <Link href="/" style={{ fontWeight: 900 }}>
            Naslovna
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <Badge label={teamSlug.toUpperCase()} value="Poz" bg="#111" color="#fff" />
        <Badge label="Poz" value={player.position} />
        <Badge label="DOB" value={`${player.age_years ?? "-"}.${player.age_days ?? "-"}`} bg="#ecfdf5" color="#065f46" />
        <Badge label="Ulogiran" value={user?.email ?? "—"} bg="#eef2ff" color="#3730a3" />
        <Badge label="Uloga" value={role ?? "—"} bg="#fdf2f8" color="#9d174d" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 14, marginTop: 16 }}>
        <Card title="Osnovno">
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 8, columnGap: 10 }}>
            <div style={{ opacity: 0.65, fontWeight: 900 }}>Interni ID</div>
            <div style={{ fontWeight: 900 }}>{player.id}</div>

            <div style={{ opacity: 0.65, fontWeight: 900 }}>HT Player ID</div>
            <div style={{ fontWeight: 900 }}>{player.ht_player_id ?? player.ht_id ?? "-"}</div>

            <div style={{ opacity: 0.65, fontWeight: 900 }}>Tip</div>
            <div style={{ fontWeight: 900 }}>{teamSlug.toUpperCase()}</div>

            <div style={{ opacity: 0.65, fontWeight: 900 }}>Status</div>
            <div style={{ fontWeight: 900 }}>{player.status ?? (player.is_active ? "active" : "inactive")}</div>

            <div style={{ opacity: 0.65, fontWeight: 900 }}>Zadnje viđeno</div>
            <div style={{ fontWeight: 900 }}>
              {player.last_seen ? new Date(player.last_seen).toLocaleString() : "—"}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            * Kod dođe CHPP, ovdje ćemo prikazati Hattrick nick/klub, ligu, i sl.
          </div>
        </Card>

        <Card title="Portal-style status (trenutno/uskoro)">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge label="Forma" value={player.form ?? snap?.form ?? "—"} bg="#fff7ed" color="#9a3412" />
            <Badge label="Stamina" value={player.stamina ?? snap?.stamina ?? "—"} bg="#fff7ed" color="#9a3412" />
            <Badge label="TSI" value={snap?.tsi ?? "—"} />
            <Badge label="Trening" value={player.current_training ?? snap?.training_type ?? "—"} />
            <Badge label="Intenzitet" value={snap?.training_intensity ?? "—"} />
            <Badge label="Stamina %" value={snap?.stamina_share ?? "—"} />
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, lineHeight: 1.35 }}>
            <div style={{ fontWeight: 1000 }}>U21/NT “decision box” (sljedeće)</div>
            Ovdje ćemo dodati U21 cutoff (21g+111d), full-cycle status,
            stagnacija treninga i alerteve — čim uvedemo pravu HT dob + trening engine.
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Card title="Skillovi i sub-skillovi (portal tracker prikaz)">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {[
              ["GK", player.skill_goalkeeping],
              ["DEF", player.skill_defending],
              ["WB", player.skill_winger],
              ["PM", player.skill_playmaking],
              ["W", player.skill_winger],
              ["PASS", player.skill_passing],
              ["SCOR", player.skill_scoring],
              ["SP", player.skill_set_pieces],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 1000, opacity: 0.8 }}>{k}</div>
                <div style={{ fontSize: 24, fontWeight: 1000 }}>{v ?? "—"}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>sub: —</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * CHPP će puniti skillove/subskillove. Dok čekamo licencu, admin može ručno unositi osnovne stvari u “Snapshot”.
          </div>
        </Card>

        <Card title="Klub / osoblje / trener (portal tracker stil)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Coach level", snap?.coach_level],
              ["Asistenti", snap?.assistant_count],
              ["Medic", snap?.medic_count],
              ["Form coach", snap?.form_coach_count],
              ["Specialty", "—"],
              ["Experience", "—"],
              ["Leadership", "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ borderBottom: "1px dashed #e5e7eb", paddingBottom: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 900 }}>{k}</div>
                <div style={{ fontSize: 16, fontWeight: 1000 }}>{v ?? "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * Ovo je “kostur” profila. Kad dođe CHPP sync, ovo postaje stvarni portal-level prikaz.
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <Card title="Bilješke (tim / privatno)">
          {!user && (
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Moraš biti prijavljen da bi pisao bilješke.
            </div>
          )}

          {user && (
            <form onSubmit={addNote} style={{ display: "grid", gap: 10 }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Napiši bilješku... (npr. plan treninga, poziv, kontakt s managerom)"
                rows={4}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value)} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  <option value="team">Vidljivo timu</option>
                  <option value="private">Privatno</option>
                </select>

                <select value={noteRating} onChange={(e) => setNoteRating(Number(e.target.value))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      Ocjena {r}
                    </option>
                  ))}
                </select>

                <input value={noteTag} onChange={(e) => setNoteTag(e.target.value)} placeholder="tag (npr. watch)" style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </div>

              <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
                Spremi bilješku
              </button>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                * Timske bilješke vidi cijeli tim. Privatne vidi samo autor.
              </div>
            </form>
          )}
        </Card>

        <Card title="Timeline bilješki">
          {notes.length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.7 }}>Nema bilješki još.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {notes.map((n) => (
                <div key={n.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 1000 }}>
                      {n.visibility === "private" ? "Privatno" : "Tim"} • ⭐ {n.rating ?? "-"} • {n.tag ?? "—"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{n.author_id ? String(n.author_id).slice(0, 8) : "—"}</div>
                  </div>
                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontWeight: 700 }}>{n.note}</div>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Admin snapshot editor */}
      {role === "admin" && (
        <div style={{ marginTop: 12 }}>
          <Card title="Admin: Snapshot (privremeno ručni unos dok čekamo CHPP)">
            <form onSubmit={upsertSnapshot} style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
              <input value={snapEdit.form} onChange={(e) => setSnapEdit((p) => ({ ...p, form: e.target.value }))} placeholder="Forma (npr. 7.5)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.stamina} onChange={(e) => setSnapEdit((p) => ({ ...p, stamina: e.target.value }))} placeholder="Stamina (npr. 8)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.tsi} onChange={(e) => setSnapEdit((p) => ({ ...p, tsi: e.target.value }))} placeholder="TSI" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.training_type} onChange={(e) => setSnapEdit((p) => ({ ...p, training_type: e.target.value }))} placeholder="Trening (npr. DEF)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />

              <input value={snapEdit.training_intensity} onChange={(e) => setSnapEdit((p) => ({ ...p, training_intensity: e.target.value }))} placeholder="Intenzitet (0-100)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.stamina_share} onChange={(e) => setSnapEdit((p) => ({ ...p, stamina_share: e.target.value }))} placeholder="Stamina % (0-100)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.coach_level} onChange={(e) => setSnapEdit((p) => ({ ...p, coach_level: e.target.value }))} placeholder="Coach level (npr. solid)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.assistant_count} onChange={(e) => setSnapEdit((p) => ({ ...p, assistant_count: e.target.value }))} placeholder="Asistenti (broj)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />

              <input value={snapEdit.medic_count} onChange={(e) => setSnapEdit((p) => ({ ...p, medic_count: e.target.value }))} placeholder="Medic (broj)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <input value={snapEdit.form_coach_count} onChange={(e) => setSnapEdit((p) => ({ ...p, form_coach_count: e.target.value }))} placeholder="Form coach (broj)" style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }} />

              <button type="submit" style={{ gridColumn: "span 4", padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
                Spremi snapshot
              </button>
            </form>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              * Kad dođe CHPP, ovaj dio će se puniti automatski i više neće trebati ručni unos (osim internih selektorskih oznaka).
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
