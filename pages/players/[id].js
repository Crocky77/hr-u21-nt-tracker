import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function Pill({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#f3f4f6", fg: "#111827", bd: "#e5e7eb" },
    good: { bg: "#dcfce7", fg: "#166534", bd: "#bbf7d0" },
    warn: { bg: "#ffedd5", fg: "#9a3412", bd: "#fed7aa" },
    bad: { bg: "#fee2e2", fg: "#991b1b", bd: "#fecaca" },
    dark: { bg: "#111", fg: "#fff", bd: "#111" }
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999, background: s.bg, color: s.fg, border: `1px solid ${s.bd}`, fontSize: 12, fontWeight: 900 }}>
      {children}
    </span>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 10px 28px rgba(0,0,0,.08)", overflow: "hidden" }}>
      <div style={{ padding: 14, background: "#f7f7f7", borderBottom: "1px solid #e5e7eb", fontWeight: 900 }}>{title}</div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function kv(label, value) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ fontWeight: 800, opacity: 0.8 }}>{label}</div>
      <div style={{ fontWeight: 900 }}>{value ?? <span style={{ opacity: 0.5 }}>—</span>}</div>
    </div>
  );
}

function normalizeSkills(obj) {
  const s = obj || {};
  // standard redoslijed radi čitljivosti
  const order = ["gk", "def", "wb", "pm", "w", "ps", "sc", "sp"];
  const labels = {
    gk: "GK",
    def: "DEF",
    wb: "WB",
    pm: "PM",
    w: "W",
    ps: "PASS",
    sc: "SCOR",
    sp: "SP"
  };
  return order.map((k) => ({ key: k, label: labels[k], value: s[k] }));
}

export default function PlayerProfile() {
  const router = useRouter();
  const { id } = router.query;

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [player, setPlayer] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const [notes, setNotes] = useState([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteVisibility, setNoteVisibility] = useState("team"); // team | private
  const [noteRating, setNoteRating] = useState("3");
  const [noteTags, setNoteTags] = useState("watch");

  // Admin-only: quick snapshot form (minimalno, dok nema CHPP)
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
    form_coach_count: ""
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

      const { data: urows } = await supabase.from("users").select("role").eq("email", userEmail).limit(1);
      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }
      setRole(urows[0].role);
      setAccess("ok");
    })();
  }, []);

  async function fetchAll(pid) {
    // player
    const { data: prow, error: perr } = await supabase
      .from("players")
      .select("id, ht_player_id, full_name, position, dob, team_type, status, notes, last_seen_at")
      .eq("id", pid)
      .limit(1)
      .maybeSingle();

    if (perr || !prow) {
      setPlayer(null);
      setSnapshot(null);
      setNotes([]);
      return;
    }
    setPlayer(prow);

    // snapshot (may be null)
    const { data: srow } = await supabase
      .from("player_snapshot")
      .select("*")
      .eq("player_id", pid)
      .limit(1)
      .maybeSingle();

    setSnapshot(srow || null);

    // sync edit fields if admin
    if (srow) {
      setSnapEdit({
        form: srow.form ?? "",
        stamina: srow.stamina ?? "",
        tsi: srow.tsi ?? "",
        training_type: srow.training_type ?? "",
        training_intensity: srow.training_intensity ?? "",
        stamina_share: srow.stamina_share ?? "",
        coach_level: srow.coach_level ?? "",
        assistant_count: srow.assistant_count ?? "",
        medic_count: srow.medic_count ?? "",
        form_coach_count: srow.form_coach_count ?? ""
      });
    }

    // notes
    const { data: nrows } = await supabase
      .from("player_notes")
      .select("id, author_email, visibility, rating, tags, note, created_at")
      .eq("player_id", pid)
      .order("created_at", { ascending: false });

    setNotes(nrows || []);
  }

  useEffect(() => {
    if (access !== "ok") return;
    if (!id) return;
    fetchAll(Number(id));
  }, [access, id]);

  const skills = useMemo(() => normalizeSkills(snapshot?.skills), [snapshot?.skills]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  async function addNote(e) {
    e.preventDefault();
    const pid = Number(id);

    const payload = {
      player_id: pid,
      author_email: email,
      visibility: noteVisibility,
      rating: Number(noteRating),
      tags: noteTags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      note: noteDraft.trim()
    };

    const { error } = await supabase.from("player_notes").insert(payload);
    if (error) {
      alert("Greška: " + error.message);
      return;
    }
    setNoteDraft("");
    await fetchAll(pid);
  }

  async function upsertSnapshot(e) {
    e.preventDefault();
    const pid = Number(id);

    // Upsert minimal fields; skills/subskills će kasnije puniti CHPP sync
    const payload = {
      player_id: pid,
      ht_player_id: player?.ht_player_id ?? null,
      updated_at: new Date().toISOString(),
      form: snapEdit.form === "" ? null : Number(snapEdit.form),
      stamina: snapEdit.stamina === "" ? null : Number(snapEdit.stamina),
      tsi: snapEdit.tsi === "" ? null : Number(snapEdit.tsi),
      training_type: snapEdit.training_type || null,
      training_intensity: snapEdit.training_intensity === "" ? null : Number(snapEdit.training_intensity),
      stamina_share: snapEdit.stamina_share === "" ? null : Number(snapEdit.stamina_share),
      coach_level: snapEdit.coach_level || null,
      assistant_count: snapEdit.assistant_count === "" ? null : Number(snapEdit.assistant_count),
      medic_count: snapEdit.medic_count === "" ? null : Number(snapEdit.medic_count),
      form_coach_count: snapEdit.form_coach_count === "" ? null : Number(snapEdit.form_coach_count)
    };

    const { error } = await supabase.from("player_snapshot").upsert(payload, { onConflict: "player_id" });
    if (error) {
      alert("Greška: " + error.message);
      return;
    }
    await fetchAll(pid);
  }

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: "#c00" }}>Profil igrača</h1>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/login">→ Prijava</Link>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  if (!player) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <h1 style={{ color: "#c00" }}>Profil igrača</h1>
          <Link href="/players">← Natrag</Link>
        </div>
        <p>Ne mogu pronaći igrača.</p>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Hrvatski U21/NT Tracker</div>
          <h1 style={{ margin: "6px 0 0", color: "#c00" }}>{player.full_name}</h1>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill tone="neutral">{player.team_type}</Pill>
            <Pill tone="neutral">Poz: {player.position}</Pill>
            <Pill tone="neutral">DOB: {player.dob}</Pill>
            <Pill tone="good">Ulogiran: {email}</Pill>
            <Pill tone="neutral">Uloga: {role}</Pill>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/players" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            ← Igrači
          </Link>
          <Link href="/" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb", textDecoration: "none" }}>
            Naslovna
          </Link>
          <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
            Odjava
          </button>
        </div>
      </div>

      {/* Top grid */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Osnovno">
          {kv("Interni ID", player.id)}
          {kv("HT Player ID", player.ht_player_id ?? "—")}
          {kv("Tip", player.team_type)}
          {kv("Status", player.status)}
          {kv("Zadnje viđeno", player.last_seen_at ? new Date(player.last_seen_at).toLocaleString() : "—")}
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * Kad dođe CHPP, ovdje ćemo prikazati Hattrick nick/club, ligu, i sl.
          </div>
        </Card>

        <Card title="Portal-style status (trenutno/uskoro)">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Pill tone={snapshot?.form != null ? "good" : "warn"}>Forma: {snapshot?.form ?? "—"}</Pill>
            <Pill tone={snapshot?.stamina != null ? "good" : "warn"}>Stamina: {snapshot?.stamina ?? "—"}</Pill>
            <Pill tone="neutral">TSI: {snapshot?.tsi ?? "—"}</Pill>
            <Pill tone="neutral">Trening: {snapshot?.training_type ?? "—"}</Pill>
            <Pill tone="neutral">Intenzitet: {snapshot?.training_intensity ?? "—"}</Pill>
            <Pill tone="neutral">Stamina %: {snapshot?.stamina_share ?? "—"}</Pill>
          </div>

          <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#f9fafb" }}>
            <div style={{ fontWeight: 900 }}>U21/NT “decision box” (sljedeće)</div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              Ovdje ćemo dodati: U21 cutoff (21g+111d), full-cycle status, stagnacija treninga i alertove — čim uvedemo pravu HT dob + trening engine.
            </div>
          </div>
        </Card>
      </div>

      {/* Skills + Training/Staff */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <Card title="Skillovi i sub-skillovi (portal tracker prikaz)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
            {skills.map((s) => (
              <div key={s.key} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{s.value ?? "—"}</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
                  sub: {snapshot?.subskills?.[`${s.key}_sub`] ?? "—"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * CHPP će puniti skillove/subskillove. Dok čekamo licencu, admin može ručno unositi osnovne stvari u “Snapshot”.
          </div>
        </Card>

        <Card title="Klub / osoblje / trener (portal tracker stil)">
          {kv("Coach level", snapshot?.coach_level)}
          {kv("Asistenti", snapshot?.assistant_count)}
          {kv("Medic", snapshot?.medic_count)}
          {kv("Form coach", snapshot?.form_coach_count)}
          {kv("Specialty", snapshot?.specialty)}
          {kv("Experience", snapshot?.experience)}
          {kv("Leadership", snapshot?.leadership)}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * Ovo je “kostur” profila. Kad dođe CHPP sync, ovo postaje stvarni portal-level prikaz.
          </div>
        </Card>
      </div>

      {/* Notes */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Bilješke (tim / privatno)">
          <form onSubmit={addNote} style={{ display: "grid", gap: 10 }}>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              required
              placeholder="Napiši bilješku… (npr. plan treninga, poziv, kontakt s managerom)"
              style={{ width: "100%", minHeight: 90, padding: 10, borderRadius: 12, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={noteVisibility} onChange={(e) => setNoteVisibility(e.target.value)} style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <option value="team">Vidljivo timu</option>
                <option value="private">Privatno</option>
              </select>

              <select value={noteRating} onChange={(e) => setNoteRating(e.target.value)} style={{ padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}>
                <option value="1">Ocjena 1</option>
                <option value="2">Ocjena 2</option>
                <option value="3">Ocjena 3</option>
                <option value="4">Ocjena 4</option>
                <option value="5">Ocjena 5</option>
              </select>

              <input
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="tagovi (npr. core,watch,risk)"
                style={{ flex: 1, minWidth: 220, padding: 10, borderRadius: 12, border: "1px solid #e5e7eb" }}
              />
            </div>

            <button type="submit" style={{ padding: "10px 12px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontWeight: 900, cursor: "pointer" }}>
              Spremi bilješku
            </button>
          </form>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            * Timske bilješke vidi cijeli tim. Privatne vidi samo autor.
          </div>
        </Card>

        <Card title="Timeline bilješki">
          {notes.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Nema bilješki još.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {notes.map((n) => (
                <div key={n.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>{n.author_email}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Pill tone={n.visibility === "private" ? "warn" : "neutral"}>{n.visibility}</Pill>
                      <Pill tone="neutral">⭐ {n.rating ?? "—"}</Pill>
                      {(n.tags || []).slice(0, 4).map((t) => (
                        <Pill key={t} tone="neutral">{t}</Pill>
                      ))}
                    </div>
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
