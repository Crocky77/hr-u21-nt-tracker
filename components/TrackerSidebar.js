import Link from "next/link";
import { useRouter } from "next/router";

export default function TrackerSidebar({ teamSlug = "nt" }) {
  const router = useRouter();
  const safeTeam = teamSlug === "nt" ? "nt" : "u21";

  const isActive = (href) => {
    // Aktivno ako je putanja ista ili ako je segment u url-u
    return router.asPath === href || router.asPath.startsWith(href + "?") || router.asPath.startsWith(href + "/");
  };

  const Item = ({ href, label }) => (
    <li className={isActive(href) ? "active" : ""}>
      <Link href={href}>{label}</Link>
    </li>
  );

  return (
    <aside className="sb">
      <div className="sb-card">
        <div className="sb-title">Hrvatska NT</div>

        <div className="sb-label">SPONZORI</div>
        <div className="sb-sponsor">test</div>

        <div className="sb-label sb-section">NT</div>
        <ul className="sb-list">
          <Item href={`/team/nt/requests`} label="Zahtjevi" />
          <Item href={`/team/nt/lists`} label="Popisi" />
          <Item href={`/team/nt/players`} label="Igrači" />
          <Item href={`/team/nt/alerts`} label="Upozorenja" />
          <Item href={`/team/nt/events`} label="Kalendar natjecanja" />
          <Item href={`/team/nt/training-settings`} label="Postavke treninga" />
        </ul>

        <div className="sb-label sb-section">Hrvatska U21</div>
        <ul className="sb-list">
          <Item href={`/team/u21/requests`} label="Zahtjevi" />
          <Item href={`/team/u21/lists`} label="Popisi" />
          <Item href={`/team/u21/players`} label="Igrači" />
          <Item href={`/team/u21/alerts`} label="Upozorenja" />
          <Item href={`/team/u21/events`} label="Kalendar natjecanja" />
          <Item href={`/team/u21/training-settings`} label="Postavke treninga" />
        </ul>

        <div className="sb-footnote">* Sve stavke su rezervirane za kasnije.</div>
      </div>

      <style jsx>{`
        .sb {
          width: 265px;
          flex: 0 0 265px;
        }

        .sb-card {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 14px 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .sb-title {
          font-weight: 800;
          margin-bottom: 10px;
        }

        .sb-label {
          font-size: 12px;
          font-weight: 800;
          opacity: 0.7;
          margin-top: 12px;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }

        .sb-label.sb-section {
          background: #111827;
          color: #ffffff;
          opacity: 1;
          padding: 6px 10px;
          border-radius: 10px;
          margin: 14px 0 8px;
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.25) inset, 0 2px 8px rgba(0, 0, 0, 0.15);
          text-transform: none;
          letter-spacing: 0;
        }

        .sb-sponsor {
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }

        .sb-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sb-list li {
          padding: 4px 0;
        }

        .sb-list li a {
          color: #111827;
          text-decoration: none;
        }

        .sb-list li.active a {
          font-weight: 800;
          text-decoration: underline;
        }

        .sb-footnote {
          margin-top: 12px;
          font-size: 12px;
          opacity: 0.7;
        }
      `}</style>
    </aside>
  );
}
