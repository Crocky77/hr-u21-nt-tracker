// pages/team/[team]/index.js
import Link from "next/link";
import { HrHero, HrCard } from "../../../components/HrCard";

export default function TeamDashboard({ team }) {
  const isU21 = team === "u21";
  const title = isU21 ? "Hrvatska U21" : "Hrvatska NT";

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
        <HrCard title="Zahtjevi" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" />
        <HrCard title="Popisi (Liste)" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" />
        <HrCard title="Igrači" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" />
        <HrCard title="Upozorenja" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" />
        <HrCard title="Kalendar natjecanja" subtitle="Pregled ciklusa i datuma (Euro / SP / Kup nacija)." />
        <HrCard title="Postavke treninga" subtitle="Struktura modula je vidljiva, ali sadržaj traži prijavu." tag="Zaključano" />
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
