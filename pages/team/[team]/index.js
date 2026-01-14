// pages/team/[team]/index.js
import Link from "next/link";
import { HrHero, HrCardLink } from "../../../components/HrCard";

export default function TeamDashboard({ team }) {
  const isU21 = team === "u21";
  const title = isU21 ? "Hrvatska U21" : "Hrvatska NT";

  // za sada sve "zaključano" vodi na login
  const lockedHref = "/login";

  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, margin: "0 auto" }}>
      <HrHero
        title={title}
        subtitle="Pregled modula (preview). Igrači i skilovi su zaključani bez prijave."
        right={<div style={pill}>Preview</div>}
      />

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <HrCardLink title="Zahtjevi" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" href={lockedHref} />
        <HrCardLink title="Popisi (Liste)" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" href={lockedHref} />
        <HrCardLink title="Igrači" subtitle="Lista igrača + detalji profila, snapshotovi, bilješke." tag="Zaključano" href={lockedHref} />
        <HrCardLink title="Upozorenja" subtitle="Crveni karton, ozljede, krivi trening/stamina (skeleton u V1)." tag="Zaključano" href={lockedHref} />

        {/* Kalendar - za sada ostaje preview (bez linka) */}
        <div style={{ opacity: 0.98 }}>
          <div style={{ textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: 14,
                padding: 18,
                minHeight: 120,
                boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900 }}>Kalendar natjecanja</div>
              <div style={{ opacity: 0.78, marginTop: 8, lineHeight: 1.35 }}>
                Pregled ciklusa i datuma (Euro / SP / Kup nacija).
              </div>
            </div>
          </div>
        </div>

        <HrCardLink title="Postavke treninga" subtitle="Ciljevi treninga po poziciji i procjena odstupanja (MVP skeleton)." tag="Zaključano" href={lockedHref} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/" style={backLink}>
          ← Natrag na naslovnicu
        </Link>
      </div>
    </div>
  );
}

const pill = {
  fontSize: 12,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.12)",
  whiteSpace: "nowrap",
};

const backLink = {
  textDecoration: "underline",
  color: "rgba(255,255,255,0.95)",
  fontWeight: 900,
};

export async function getServerSideProps(ctx) {
  const raw = String(ctx.params?.team || "").toLowerCase();
  const team = raw === "u21" ? "u21" : raw === "nt" ? "nt" : null;

  if (!team) return { notFound: true };
  return { props: { team } };
}
