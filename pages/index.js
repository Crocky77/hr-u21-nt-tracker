// pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "../components/AppLayout";
import { supabase } from "../utils/supabaseClient";

function Card({ title, subtitle, coach, assistant, team, onOpen }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 320,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: 22,
        padding: 18,
        boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* dekorativni “dres” blok desno */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: 14,
          width: 86,
          height: 86,
          borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.08)",
          background:
            team === "u21"
              ? "linear-gradient(135deg, #ffffff 0%, #fff 40%, #f3f4f6 100%)"
              : "linear-gradient(135deg, #111 0%, #3b3b3b 60%, #111 100%)"
        }}
      >
        {/* mini šahovnica */}
        <div style={{ position: "absolute", left: 10, top: 10, width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.10)" }}>
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((__, c) => {
              const size = 44 / 4;
              const x = c * size;
              const y = r * size;
              const isRed = (r + c) % 2 === 0;
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    background: isRed ? "#d61f2c" : "#fff"
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 900 }}>{subtitle}</div>
      <div style={{ fontSize: 24, fontWeight: 1000, marginTop: 6 }}>{title}</div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85, fontWeight: 800 }}>
        Izbornik: <strong>{coach}</strong> · Pomoćnik: <strong>{assistant}</strong>
      </div>

      <button
        onClick={onOpen}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 16,
          border: "none",
          background: "linear-gradient(135deg, #101114 0%, #2a2b30 100%)",
          color: "#fff",
          fontWeight: 1000,
          cursor: "pointer"
        }}
      >
        → Otvori {team === "u21" ? "U21" : "NT"} dashboard
      </button>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Osoblje vidi samo svoj tim (admin vidi sve).
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [access, setAccess] = useState("loading"); // loading | denied | ok
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // hardcoded staff nickovi (dok CHPP ne dođe)
  const staff = {
    u21: { coach: "matej1603", assistant: "Zvonzi_" },
    nt: { coach: "Zagi_", assistant: "Nosonja" }
  };

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
        .select("*")
        .eq("email", userEmail)
        .limit(1);

      if (!urows || urows.length === 0) {
        setAccess("denied");
        return;
      }

      setRole(urows[0].role || "");
      setAccess("ok");
    })();
  }, []);

  if (access === "denied") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 18 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Odaberi tim</h1>
          <p style={{ marginTop: 10 }}>
            <strong>Nisi prijavljen.</strong> Idi na login.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (access === "loading") {
    return (
      <AppLayout title="Hrvatski U21/NT Tracker">
        <div style={{ padding: 10 }}>Učitavam...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Hrvatski U21/NT Tracker" email={email} role={role}>
      {/* HERO */}
      <div
        style={{
          borderRadius: 24,
          padding: 20,
          background: "linear-gradient(135deg, rgba(214,31,44,0.12) 0%, rgba(214,31,44,0.03) 55%, rgba(0,0,0,0.02) 100%)",
          border: "1px solid rgba(214,31,44,0.15)",
          marginBottom: 14
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 1100, letterSpacing: -0.3 }}>Odaberi tim</div>
        <div style={{ marginTop: 6, fontSize: 14, opacity: 0.8, fontWeight: 700 }}>
          (V1) Ručno dodavanje igrača + bilješke + U21 cutoff widget. CHPP sync dolazi čim dobijemo licencu.
        </div>
      </div>

      {/* TEAM CARDS */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Card
          title="U21 Hrvatska"
          subtitle="U21 selekcija"
          coach={staff.u21.coach}
          assistant={staff.u21.assistant}
          team="u21"
          onOpen={() => router.push("/team/u21/dashboard")}
        />

        <Card
          title="NT Hrvatska"
          subtitle="Seniorska reprezentacija"
          coach={staff.nt.coach}
          assistant={staff.nt.assistant}
          team="nt"
          onOpen={() => router.push("/team/nt/dashboard")}
        />
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Savjet: odaberi tim i ulaziš u odgovarajući dashboard. Skauti/osoblje vide samo svoj tim (admin vidi sve).
      </div>
    </AppLayout>
  );
}
