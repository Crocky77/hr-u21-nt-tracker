import Link from "next/link";
import { useRouter } from "next/router";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function teamHeroClass(team) {
  if (team === "u21") return "hr-teamHero hr-teamHeroU21";
  if (team === "nt") return "hr-teamHero hr-teamHeroNT";
  return "hr-teamHero";
}

function Icon({ name }) {
  // Jednostavne SVG ikone (bez vanjskih slika)
  if (name === "requests") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z" fill="currentColor" opacity="0.2" />
        <path d="M8 7h8M8 11h8M8 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "lists") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M6 6h14M6 12h14M6 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "players") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" fill="currentColor" opacity="0.2" />
        <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (name === "alerts") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M12 3l10 18H2L12 3z" fill="currentColor" opacity="0.18" />
        <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 17h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M7 3v3M17 3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M5 6h14a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2z"
          fill="currentColor"
          opacity="0.14"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 14h4M7 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "training") {
    return (
      <svg viewBox="0 0 24 24" className="hr-moduleIconSvg" aria-hidden="true">
        <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 20V8l5-3 5 3v12" fill="currentColor" opacity="0.12" />
        <path d="M7 20V8l5-3 5 3v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

export default function TeamDashboard() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return null;

  const label = teamLabel(team);
  const base = `/team/${team}`;

  const modules = [
    {
      key: "requests",
      title: "Zahtjevi",
      desc: "Filter builder + spremanje upita + “dodaj u listu”.",
      href: `${base}/requests`,
      badge: "Otvoreno",
    },
    {
      key: "lists",
      title: "Popisi (Liste)",
      desc: "Organiziraj igrače po listama: DEF/IM/WING/FWD…",
      href: `${base}/lists`,
      badge: "Otvoreno",
    },
    {
      key: "players",
      title: "Igrači",
      desc: "Lista igrača u timu + detalji profila.",
      href: `${base}/players`,
      badge: "Otvoreno",
    },
    {
      key: "alerts",
      title: "Upozorenja",
      desc: "Kartoni, ozljede, krivi trening/stamina (skeleton).",
      href: `${base}/alerts`,
      badge: "Otvoreno",
    },
    {
      key: "calendar",
      title: "Kalendar natjecanja",
      desc: "Pregled ciklusa i datuma (Euro / SP / Kup nacija).",
      href: `${base}/calendar`,
      badge: "Uskoro",
    },
    {
      key: "training",
      title: "Postavke treninga",
      desc: "Ciljevi treninga po poziciji i procjena odstupanja (skeleton).",
      href: `${base}/training`,
      badge: "Uskoro",
    },
  ];

  return (
    <div className="hr-container hr-teamPage">
      <div className="hr-teamTopRow">
        <div className={teamHeroClass(team)}>
          <div className="hr-teamHeroTitle">{label}</div>
          <div className="hr-teamHeroSub">Pregled modula (MVP). Igrači i skillovi su zaključani bez prijave.</div>
        </div>

        <Link className="hr-backBtn" href="/">
          ← Natrag na naslovnicu
        </Link>
      </div>

      <div className="hr-teamGrid">
        {modules.map((m) => (
          <Link key={m.title} href={m.href} className="hr-3dCard hr-3dHover hr-moduleTile hr-moduleTileWithIcon">
            <div className="hr-3dCardInner hr-moduleTileInner">
              <div className="hr-moduleTop">
                <div className="hr-moduleTitle">{m.title}</div>
                <span className="hr-badge">{m.badge}</span>
              </div>

              <div className="hr-moduleDesc">{m.desc}</div>

              <div className="hr-openLink">Otvori →</div>

              <div className="hr-moduleIcon" aria-hidden="true">
                <Icon name={m.key} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hr-teamFootNote">
        * “Uskoro” = placeholder dok ne završimo funkcionalnosti (CHPP dolazi kasnije).
      </div>
    </div>
  );
}
