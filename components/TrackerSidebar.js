import Link from "next/link";
import { useRouter } from "next/router";

export default function TrackerSidebar() {
  const router = useRouter();
  const team = router.query.team;

  const isActive = (href) => router.asPath === href;

  const TeamLink = ({ href, children }) => (
    <Link href={href} className={isActive(href) ? "sb-link sb-linkActive" : "sb-link"}>
      {children}
    </Link>
  );

  return (
    <aside className="sb">
      <div className="sb-card">
        <div className="sb-title">Hrvatska {team === "u21" ? "U21" : "NT"}</div>

        <div className="sb-section">
          <div className="sb-label">SPONZORI</div>
          <div className="sb-sponsor">test</div>
        </div>

        <div className="sb-section">
          <div className="sb-label">NT</div>
          <nav className="sb-nav">
            <TeamLink href="/team/nt/requests">Zahtjevi</TeamLink>
            <TeamLink href="/team/nt/lists">Popisi</TeamLink>
            <TeamLink href="/team/nt/players">Igrači</TeamLink>
            <TeamLink href="/team/nt/alerts">Upozorenja</TeamLink>
            <TeamLink href="/team/nt/events">Kalendar natjecanja</TeamLink>
            <TeamLink href="/team/nt/training">Postavke treninga</TeamLink>
          </nav>
        </div>

        <div className="sb-divider" />

        <div className="sb-section">
          <div className="sb-label">HRVATSKA U21</div>
          <nav className="sb-nav">
            <TeamLink href="/team/u21/requests">Zahtjevi</TeamLink>
            <TeamLink href="/team/u21/lists">Popisi</TeamLink>
            <TeamLink href="/team/u21/players">Igrači</TeamLink>
            <TeamLink href="/team/u21/alerts">Upozorenja</TeamLink>
            <TeamLink href="/team/u21/events">Kalendar natjecanja</TeamLink>
            <TeamLink href="/team/u21/training">Postavke treninga</TeamLink>
          </nav>
        </div>

        <div className="sb-note">* Sve stavke su rezervirane za kasnije.</div>
      </div>

      <style jsx>{`
        .sb {
          width: 260px;
          flex: 0 0 260px;
        }

        .sb-card {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .sb-title {
          font-weight: 900;
          font-size: 15px;
          margin-bottom: 8px;
        }

        .sb-section {
          margin-top: 10px;
        }

        /* MINI HEADER (ispunjeni) */
        .sb-label {
          display: inline-block;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.78);
          border: 1px solid rgba(0, 0, 0, 0.35);
          padding: 6px 10px;
          border-radius: 10px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
          margin-bottom: 8px;
        }

        .sb-sponsor {
          font-size: 13px;
          padding: 6px 8px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px dashed rgba(0, 0, 0, 0.18);
        }

        .sb-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }

        .sb-link {
          display: block;
          padding: 8px 10px;
          border-radius: 10px;
          color: rgba(0, 0, 0, 0.9);
          text-decoration: none;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.55);
        }

        .sb-link:hover {
          border-color: rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.8);
        }

        .sb-linkActive {
          background: rgba(0, 0, 0, 0.82);
          color: #fff;
        }

        .sb-divider {
          height: 10px;
        }

        .sb-note {
          margin-top: 12px;
          font-size: 11px;
          opacity: 0.75;
        }
      `}</style>
    </aside>
  );
}
