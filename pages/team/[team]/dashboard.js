// pages/team/[team]/dashboard.js
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

function Card({ title, desc, href, locked }) {
  const body = (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 16,
        background: "#fff",
        position: "relative",
        minHeight: 92,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
      <div style={{ marginTop: 6, opacity: 0.85, lineHeight: 1.35 }}>{desc}</div>

      {locked ? (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 12,
            fontWeight: 900,
            padding: "6px 10px",
            borderRadius: 999,
            background: "#111",
            color: "#fff",
          }}
        >
          Zaključano
        </div>
      ) : null}
    </div>
  );

  if (!href) return body;

  return (
    <Link href={href} style={{ textDecoration: "none", color: "#111" }}>
      {body}
    </Link>
  );
}

export default function TeamDashboard() {
  const router = useRouter();
  const teamParam = router.query.team;
  const teamType = useMemo(() => normalizeTeamParam(teamParam), [teamParam]);

  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsLoggedIn(!!data?.session?.user);
      setAuthLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const isU21 = String(teamParam || "").toLowerCase() === "u21";
  const title = teamType ? `Dashboard – ${teamType}` : "Dashboard";

  // Gost može vidjeti dashboard, ali private stranice su locked
  const locked = !authLoading && !isLoggedIn;

  return (
    <AppLayout title={title}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 16,
            background: "linear-gradient(135deg, #ffffff 0%, #fff5f5 60%, #ffe4e6 100%)",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 900 }}>HR Tracker</div>
              <h1 style={{ margin: "6px 0 0" }}>{title}</h1>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                {locked ? (
                  <>
                    Gost pregled: vidiš strukturu modula, ali <b>igrači/skilovi</b> su zaključani.
                    {" "}
                    <Link href="/login" style={{ fontWeight: 900 }}>
                      Prijavi se
                    </Link>
                    .
                  </>
                ) : (
                  <>Prijavljen si: svi moduli dostupni (ovisno o roli).</>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/"
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  textDecoration: "none",
                  fontWeight: 900,
                  background: "#fff",
                  color: "#111",
                }}
              >
                Naslovna
              </Link>

              <Link
                href={`/team/${String(teamParam || "").toLowerCase()}/dashboard`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  textDecoration: "none",
                  fontWeight: 900,
                  background: "#111",
                  color: "#fff",
                }}
              >
                Osvježi
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card
            title="Zahtjevi"
            desc="Pretraživanje baze po kriterijima (pozicija, dob, skilovi) i dodavanje u liste."
            href={locked ? "/login" : `/team/${String(teamParam || "").toLowerCase()}/zahtjevi`}
            locked={locked}
          />
          <Card
            title="Popisi (Liste)"
            desc="Organiziraj igrače po listama: DEF/IM/WING/FWD…"
            href={locked ? "/login" : `/team/${String(teamParam || "").toLowerCase()}/liste`}
            locked={locked}
          />

          <Card
            title="Igrači"
            desc="Lista igrača u timu + detalji profila, snapshotovi, bilješke."
            href={locked ? "/login" : `/team/${String(teamParam || "").toLowerCase()}/players`}
            locked={locked}
          />

          <Card
            title="Upozorenja"
            desc="Crveni karton, ozljede, krivi trening/stamina (skeleton u V1)."
            href={locked ? "/login" : `/team/${String(teamParam || "").toLowerCase()}/alerts`}
            locked={locked}
          />

          <Card
            title="Kalendar natjecanja"
            desc="Pregled ciklusa i datuma (Euro / SP / Kup nacija)."
            href={`/team/${String(teamParam || "").toLowerCase()}/kalendar`}
            locked={false}
          />

          <Card
            title="Postavke treninga"
            desc="Ciljevi treninga po poziciji i procjena odstupanja (MVP skeleton)."
            href={locked ? "/login" : `/team/${String(teamParam || "").toLowerCase()}/training-settings`}
            locked={locked}
          />
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
          {isU21 ? (
            <>U21 dashboard ima dodatne module (ciklus, U21 kalkulator u budućnosti). U V1 je fokus na stabilnost i “portal parity”.</>
          ) : (
            <>NT dashboard nema U21 kalkulator. Fokus: senior roster + trening/ozljede/kartoni.</>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
