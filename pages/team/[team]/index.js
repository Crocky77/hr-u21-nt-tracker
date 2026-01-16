// pages/team/[team]/index.js
import { useRouter } from "next/router";
import Link from "next/link";
import AppLayout from "../../../components/AppLayout";
import HrCard from "../../../components/HrCard";

function teamLabel(team) {
  const t = String(team || "").toLowerCase();
  if (t === "u21") return "Hrvatska U21";
  if (t === "nt") return "Hrvatska NT";
  return `Team: ${team || ""}`;
}

export default function TeamHome() {
  const router = useRouter();
  const team = String(router.query.team || "").toLowerCase();
  const label = teamLabel(team);

  return (
    <AppLayout
      accent={team === "u21" ? "u21" : team === "nt" ? "nt" : "global"}
      title={label}
      subtitle="Pregled modula. Igrači i skillovi su zaključani bez prijave (preview)."
      actions={
        <>
          <Link className="hr-btn" href="/">
            ← Natrag na naslovnicu
          </Link>
        </>
      }
    >
      <div className="hr-grid">
        <HrCard
          title="Zahtjevi"
          description="Filter builder + spremanje upita + “dodaj u listu”."
          badge="Otvoreno"
          disabled
        />
        <HrCard
          title="Popisi (Liste)"
          description="Organiziraj igrače po listama: DEF/IM/WING/FWD..."
          badge="Otvoreno"
          disabled
        />
        <HrCard
          title="Igrači"
          description="Lista igrača u timu + detalji profila."
          badge="Otvoreno"
          href={`/team/${team}/players`}
        />
        <HrCard
          title="Upozorenja"
          description="Kartoni, ozljede, krivi trening/stamina (skeleton)."
          badge="Otvoreno"
          href={`/team/${team}/alerts`}
        />
        <HrCard
          title="Kalendar natjecanja"
          description="Pregled ciklusa i datuma (Euro / SP / Kup nacija)."
          badge="Uskoro"
          disabled
        />
        <HrCard
          title="Postavke treninga"
          description="Ciljevi treninga po poziciji i procjena odstupanja (skeleton)."
          badge="Uskoro"
          disabled
        />
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.85 }}>
        * “Uskoro” = UI placeholder dok ne napravimo team-based rute bez CHPP.
      </div>
    </AppLayout>
  );
}
