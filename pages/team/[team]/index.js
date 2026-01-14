// pages/team/[team]/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import { HrHero, HrCardLink } from "../../../components/HrCard";
import { useAuth } from "../../../utils/useAuth";

export default function TeamDashboard() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase(); // u21 | nt

  const auth = useAuth();
  const isAdmin = auth.loggedIn && auth.role === "admin";
  const teamLabel = team === "u21" ? "Hrvatska U21" : "Hrvatska NT";

  function gatedHref(realHref) {
    return isAdmin ? realHref : "/login";
  }

  function gatedTag() {
    return isAdmin ? "Otvoreno" : "Zaključano";
  }

  function gatedSubtitle(base) {
    return isAdmin
      ? base
      : "Struktura modula je vidljiva, ali sadržaj traži prijavu.";
  }

  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, margin: "0 auto" }}>
      <HrHero
        title={teamLabel}
        subtitle="Pregled modula (preview). Igrači i skilovi su zaključani bez prijave."
        right={
          <Link href="/" style={{ color: "#111", fontWeight: 900, textDecoration: "underline" }}>
            ← Natrag na naslovnicu
          </Link>
        }
      />

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <HrCardLink
          title="Zahtjevi"
          subtitle={gatedSubtitle("Filter builder + spremanje upita + “dodaj u listu”.")}
          tag={gatedTag()}
          href={gatedHref(`/team/${team}/requirements`)}
        />
        <HrCardLink
          title="Popisi (Liste)"
          subtitle={gatedSubtitle("Organiziraj igrače po listama: DEF/IM/WING/FWD…")}
          tag={gatedTag()}
          href={gatedHref(`/team/${team}/lists`)}
        />
        <HrCardLink
          title="Igrači"
          subtitle={gatedSubtitle("Lista igrača u timu + detalji profila, snapshotovi, bilješke.")}
          tag={gatedTag()}
          href={gatedHref(`/team/${team}/players`)}
        />
        <HrCardLink
          title="Upozorenja"
          subtitle={gatedSubtitle("Crveni karton, ozljede, krivi trening/stamina (skeleton u V1).")}
          tag={gatedTag()}
          href={gatedHref(`/team/${team}/alerts`)}
        />
        <HrCardLink
          title="Kalendar natjecanja"
          subtitle="Pregled ciklusa i datuma (Euro / SP / Kup nacija)."
          tag="Otvoreno"
          href={`/team/${team}/calendar`}
        />
        <HrCardLink
          title="Postavke treninga"
          subtitle={gatedSubtitle("Ciljevi treninga po poziciji i procjena odstupanja (MVP skeleton).")}
          tag={gatedTag()}
          href={gatedHref(`/team/${team}/training`)}
        />
      </div>

      {auth.loading ? (
        <div style={{ marginTop: 14, opacity: 0.85, color: "#fff" }}>Učitavam uloge…</div>
      ) : !isAdmin ? (
        <div style={{ marginTop: 14, color: "rgba(255,255,255,0.95)", fontWeight: 800 }}>
          Gost pregled: kartice su zaključane.{" "}
          <Link href="/login" style={{ color: "#fff", textDecoration: "underline" }}>
            Prijavi se
          </Link>
          .
        </div>
      ) : (
        <div style={{ marginTop: 14, color: "rgba(255,255,255,0.95)", fontWeight: 900 }}>
          Admin mode: kartice su otključane ✅
        </div>
      )}
    </div>
  );
}
