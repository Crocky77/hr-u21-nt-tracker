// components/RequestsClient.js
import { useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "./AppLayout";
import { useAuth } from "../utils/useAuth";

// Ovo je "skeleton" UI za zahtjeve (B faza),
// ali mora graditi bez grešaka i bez CHPP.

export default function RequestsClient({ team = "u21" }) {
  const { loading, user, label } = useAuth({ requireAuth: false });

  const teamTitle = useMemo(() => (team === "nt" ? "Zahtjevi (NT)" : "Zahtjevi (U21)"), [team]);

  const [draft, setDraft] = useState({
    name: "",
    position: "ANY",
    ageMin: "",
    ageMax: "",
    gk: "",
    def: "",
    pm: "",
    wing: "",
    pass: "",
    scor: "",
    sp: ""
  });

  // MVP: još ne spremamo u DB (to ide u B fazi).
  // Ovdje samo pokazujemo kako će izgledati builder.

  return (
    <AppLayout title={teamTitle} team={team} requireAuth={false}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          {loading ? "Učitavam korisnika…" : user ? `Ulogiran: ${label}` : "Nisi prijavljen (za kreiranje će trebati prijava)."}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/team/${team}`} style={btn()}>
            ← Natrag
          </Link>
          <Link href="/login" style={btnDark()}>
            Prijava
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={card()}>
          <div style={{ fontWeight: 1000, marginBottom: 10 }}>Builder (preview)</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="Naziv zahtjeva (npr. GK 28-32, 18+)"
              style={inp()}
            />

            <select value={draft.position} onChange={(e) => setDraft((p) => ({ ...p, position: e.target.value }))} style={inp()}>
              <option value="ANY">Pozicija: bilo koja</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="WB">WB</option>
              <option value="IM">IM</option>
              <option value="W">W</option>
              <option value="FWD">FWD</option>
            </select>

            <input value={draft.ageMin} onChange={(e) => setDraft((p) => ({ ...p, ageMin: e.target.value }))} placeholder="Dob min (HT)" style={inp()} />
            <input value={draft.ageMax} onChange={(e) => setDraft((p) => ({ ...p, ageMax: e.target.value }))} placeholder="Dob max (HT)" style={inp()} />

            <input value={draft.gk} onChange={(e) => setDraft((p) => ({ ...p, gk: e.target.value }))} placeholder="Min GK" style={inp()} />
            <input value={draft.def} onChange={(e) => setDraft((p) => ({ ...p, def: e.target.value }))} placeholder="Min DEF" style={inp()} />
            <input value={draft.pm} onChange={(e) => setDraft((p) => ({ ...p, pm: e.target.value }))} placeholder="Min PM" style={inp()} />
            <input value={draft.wing} onChange={(e) => setDraft((p) => ({ ...p, wing: e.target.value }))} placeholder="Min WING" style={inp()} />
            <input value={draft.pass} onChange={(e) => setDraft((p) => ({ ...p, pass: e.target.value }))} placeholder="Min PASS" style={inp()} />
            <input value={draft.scor} onChange={(e) => setDraft((p) => ({ ...p, scor: e.target.value }))} placeholder="Min SCOR" style={inp()} />
            <input value={draft.sp} onChange={(e) => setDraft((p) => ({ ...p, sp: e.target.value }))} placeholder="Min SP" style={inp()} />
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Ovo je samo UI skeleton. U B fazi spremamo zahtjeve u DB + na “Igrači” stranici biramo zahtjev i dobijemo rezultate.
          </div>
        </div>

        <div style={card()}>
          <div style={{ fontWeight: 1000, marginBottom: 10 }}>Kako će raditi (logika)</div>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Manager autorizira tracker → “Moji igrači” se sinkaju (bez prikaza tuđih skillova).</li>
            <li>Izbornik kreira “Zahtjev” (dob + min skilovi).</li>
            <li>Na “Igrači” odabere zahtjev → dobije listu igrača koji ga zadovoljavaju.</li>
            <li>Izbornik dodaje igrače na “Liste” (DEF/IM/WING…) + bilješke.</li>
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}

function card() {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14
  };
}
function inp() {
  return { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" };
}
function btn() {
  return { padding: "9px 12px", borderRadius: 12, border: "1px solid #e5e7eb", textDecoration: "none", fontWeight: 900, color: "#111", background: "#fff" };
}
function btnDark() {
  return { padding: "9px 12px", borderRadius: 12, textDecoration: "none", fontWeight: 1000, color: "#fff", background: "#111" };
}
