import Link from "next/link";
import { useRouter } from "next/router";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Team";
}

export default function TeamHome() {
  const router = useRouter();
  const { team } = router.query;

  if (!team) return null;

  return (
    <AppLayout fullWidth>
      <div className="shell">
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        <div className="main">
          <div className="headerCard">
            <div className="headerTitle">{teamLabel(team)}</div>
            <div className="headerSub">Pregled modula (MVP). Igrači i skilovi su zaključani bez prijave.</div>

            <div className="headerRight">
              <Link href="/" className="backHome">
                ← Natrag na naslovnicu
              </Link>
            </div>
          </div>

          <div className="grid">
            <Card
              title="Zahtjevi"
              desc="Filter builder + spremanje upita + “dodaj u listu”."
              href={`/team/${team}/requests`}
              status="Otvoreno"
            />
            <Card title="Popisi (Liste)" desc="Organiziraj igrače po listama: DEF/IM/WING/FWD..." href={`/team/${team}/lists`} status="Otvoreno" />
            <Card title="Igrači" desc="Lista igrača u timu + detalji profila." href={`/team/${team}/players`} status="Otvoreno" />
            <Card title="Upozorenja" desc="Kartoni, ozljede, krivi trening/stamina (skeleton)." href={`/team/${team}/alerts`} status="Otvoreno" />
            <Card title="Kalendar natjecanja" desc="Pregled ciklusa i datuma (Euro / SP / Kup nacija)." href={`/team/${team}/events`} status="Uskoro" />
            <Card title="Postavke treninga" desc="Ciljevi treninga po poziciji + procjena odstupanja (skeleton)." href={`/team/${team}/training`} status="Uskoro" />
          </div>

          <div className="footNote">* “Uskoro” = placeholder dok ne završimo funkcionalnosti (CHPP dolazi kasnije).</div>
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 14px 0 18px 0;
        }
        .main {
          flex: 1;
          padding: 14px 18px 24px 18px;
        }

        .headerCard {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          margin-bottom: 14px;
        }
        .headerTitle {
          font-weight: 900;
          font-size: 22px;
        }
        .headerSub {
          grid-column: 1 / -1;
          opacity: 0.8;
          font-size: 13px;
        }
        .headerRight {
          align-self: start;
          justify-self: end;
        }
        .backHome {
          font-weight: 700;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.85);
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 8px 10px;
          border-radius: 12px;
        }
        .backHome:hover {
          background: rgba(255, 255, 255, 0.9);
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .footNote {
          margin-top: 12px;
          font-size: 12px;
          opacity: 0.75;
        }

        @media (max-width: 920px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}

function Card({ title, desc, href, status }) {
  return (
    <a href={href} className="card">
      <div className="row">
        <div className="t">{title}</div>
        <div className={status === "Otvoreno" ? "pill open" : "pill soon"}>{status}</div>
      </div>
      <div className="d">{desc}</div>
      <div className="go">Otvori →</div>

      <style jsx>{`
        .card {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.9);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
          display: block;
        }
        .card:hover {
          background: rgba(255, 255, 255, 0.85);
        }
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .t {
          font-weight: 900;
          font-size: 16px;
        }
        .d {
          margin-top: 6px;
          font-size: 13px;
          opacity: 0.8;
        }
        .go {
          margin-top: 10px;
          font-weight: 800;
          font-size: 13px;
        }
        .pill {
          font-size: 12px;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.75);
        }
        .open {
          background: rgba(0, 0, 0, 0.78);
          color: #fff;
        }
        .soon {
          opacity: 0.75;
        }
      `}</style>
    </a>
  );
}
