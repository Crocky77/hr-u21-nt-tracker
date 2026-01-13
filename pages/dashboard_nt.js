import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AppLayout from "../components/AppLayout";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardNT({ teamType = "NT" }) {
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [access, setAccess] = useState("loading");

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

      // ako user nema pristup ovom timu
      if (urows[0].team_type !== "NT" && urows[0].role !== "admin") {
        setAccess("denied");
        return;
      }

      setAccess("ok");
    })();
  }, []);

  if (access === "denied") {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h2>Nemaš pristup NT dashboardu</h2>
        <Link href="/">← Nazad</Link>
      </main>
    );
  }

  if (access === "loading") {
    return <main style={{ padding: 40 }}>Učitavam...</main>;
  }

  return (
    <AppLayout teamType={teamType} title="NT Dashboard">
      <div style={{ padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>NT Dashboard</h2>
        <p style={{ opacity: 0.8 }}>
          Ulogiran: <strong>{email}</strong> · Uloga: <strong>{role}</strong>
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginTop: 14
          }}
        >
          <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 900 }}>Aktivni NT igrači</div>
            <div style={{ fontSize: 38, fontWeight: 900, marginTop: 8 }}>0</div>
            <div style={{ opacity: 0.7 }}>MVP placeholder</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 900 }}>Top forma</div>
            <div style={{ marginTop: 10, opacity: 0.7 }}>Dolazi uskoro</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 900 }}>Trening alarmi</div>
            <div style={{ marginTop: 10, opacity: 0.7 }}>
              Ovdje dolazi “zaostaje za idealnim treningom”
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
