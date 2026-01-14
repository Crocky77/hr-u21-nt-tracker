// pages/team/[team]/index.js
import Link from "next/link";

export default function TeamDashboard({ team }) {
  const isU21 = team === "u21";
  const title = isU21 ? "Hrvatska U21" : "Hrvatska NT";

  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.88)",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Pregled modula (preview). Igrači i skilovi su zaključani bez prijave.
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
          }}
        >
          Preview
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <ModuleCard title="Zahtjevi" locked />
        <ModuleCard title="Popisi (Liste)" locked />
        <ModuleCard title="Igrači" locked />
        <ModuleCard title="Upozorenja" locked />
        <ModuleCard title="Kalendar natjecanja" />
        <ModuleCard title="Postavke treninga" locked />
      </div>

      <div style={{ marginTop: 16, opacity: 0.9 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Natrag na naslovnicu
        </Link>
      </div>
    </div>
  );
}

function ModuleCard({ title, locked }) {
  return (
    <div
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        padding: 16,
        minHeight: 96,
      }}
    >
      {locked && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 999,
          }}
        >
          Zaključano
        </div>
      )}
      <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
      <div style={{ opacity: 0.72, marginTop: 6, fontSize: 14 }}>
        {locked
          ? "Struktura modula je vidljiva, ali sadržaj traži prijavu."
          : "Pregled ciklusa i datuma (Euro / SP / Kup nacija)."}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const raw = String(ctx.params?.team || "").toLowerCase();
  const team = raw === "u21" ? "u21" : raw === "nt" ? "nt" : null;

  if (!team) {
    return { notFound: true };
  }

  return { props: { team } };
}
