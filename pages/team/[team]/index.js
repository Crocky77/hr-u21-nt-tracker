import Link from "next/link";
import { useRouter } from "next/router";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

export default function TeamDashboard() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return null;

  const label = teamLabel(team);
  const base = `/team/${team}`;

  const modules = [
    {
      title: "Zahtjevi",
      desc: "Filter builder + spremanje upita + “dodaj u listu”.",
      href: `${base}/requests`,
      badge: "Otvoreno",
    },
    {
      title: "Popisi (Liste)",
      desc: "Organiziraj igrače po listama: DEF/IM/WING/FWD…",
      href: `${base}/lists`,
      badge: "Otvoreno",
    },
    {
      title: "Igrači",
      desc: "Lista igrača u timu + detalji profila.",
      href: `${base}/players`,
      badge: "Otvoreno",
    },
    {
      title: "Upozorenja",
      desc: "Kartoni, ozljede, krivi trening/stamina (skeleton).",
      href: `${base}/alerts`,
      badge: "Otvoreno",
    },
    {
      title: "Kalendar natjecanja",
      desc: "Pregled ciklusa i datuma (Euro / SP / Kup nacija).",
      href: `${base}/calendar`,
      badge: "Uskoro",
    },
    {
      title: "Postavke treninga",
      desc: "Ciljevi treninga po poziciji i procjena odstupanja (skeleton).",
      href: `${base}/training`,
      badge: "Uskoro",
    },
  ];

  return (
    <div className="hr-container">
      <h1 className="hr-teamTitle">{label}</h1>

      <div className="hr-teamGrid">
        {modules.map((m) => (
          <Link
            key={m.title}
            href={m.href}
            className="hr-3dCard hr-3dHover hr-moduleTile"
            style={{ textDecoration: "none" }}
          >
            <div className="hr-3dCardInner hr-moduleTileInner">
              <div className="hr-moduleTop">
                <div className="hr-moduleTitle">{m.title}</div>
                <span className="hr-badge">{m.badge}</span>
              </div>

              <div className="hr-moduleDesc">{m.desc}</div>

              <div className="hr-openLink">Otvori →</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        * “Uskoro” = UI placeholder dok ne napravimo team-based rute bez CHPP.
      </div>
    </div>
  );
}
