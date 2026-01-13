import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AppLayout from "../components/AppLayout";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardNT() {
  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);

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

      const u = urows[0];
      setRole(u.role);

      // admin smije sve, ostali samo svoj team
      if (u.role !== "admin" && u.team_type !== "NT") {
        setAccess("denied");
        return;
      }

      setAccess("ok");
    })();
  }, []);

  if (access === "denied") {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        <h2 style={{ color: "#c00" }}>NT Dashboard</h2>
        <p><strong>Nemaš pristup.</strong></p>
        <Link href="/">← Nazad</Link>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout teamType="NT" title="NT Dashboard">
      <div style={{ padding: 14 }}>
        <div style={{ marginBottom: 10, opacity: 0.85 }}>
          Ulogiran: <strong>{email}</strong> · Uloga: <strong>{role}</strong>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12
          }}
        >
          <Card title="Aktivni NT igrači" big="0" sub="MVP placeholder" />
          <Card title="Upozorenja" big="0" sub="Trening/forma/stamina uskoro" />
          <Card title="Top forma" big="—" sub="Dolazi uskoro" />
          <Card title="Najveći napredak" big="—" sub="Dolazi uskoro" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <Panel title="Trening alarmi (skeleton)">
            <div style={rowStyle}>⚠️ Placeholder: “Igrač X stagnira 2 treninga”</div>
            <div style={rowStyle}>⚠️ Placeholder: “Igrač Y nije na očekivanom treningu”</div>
            <div style={rowStyle}>✅ Placeholder: “Sve OK za core listu”</div>
          </Panel>

          <Panel title="Brzi rez (demo)">
            <div style={{ opacity: 0.8 }}>
              Ovdje ćemo staviti tablicu “top core” + “zadnji update” kad krenemo s CHPP sync.
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}

function Card({ title, big, sub }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #e5e7eb" }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 36, fontWeight: 900, marginTop: 8 }}>{big}</div>
      <div style={{ opacity: 0.7 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #e5e7eb" }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

const rowStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 8,
  background: "#f9fafb"
};
