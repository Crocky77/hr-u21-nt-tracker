import Link from "next/link";
import { useRouter } from "next/router";

export default function TrackerSidebar() {
  const router = useRouter();
  const team = (router.query?.team || "").toString().toLowerCase();
  const isNT = team === "nt";
  const isU21 = team === "u21";

  return (
    <aside className="sidebar">
      <div className="sb-card">
        <div className="sb-title">Hrvatska NT</div>

        <div className="sb-group">
          <div className="sb-label">SPONZORI</div>
          <div className="sb-sponsor">test</div>
        </div>

        <div className="sb-group">
          <div className="sb-label">NT</div>
          <ul className="sb-list">
            <li>
              <Link href="/team/nt/requests" legacyBehavior><a>Zahtjevi</a></Link>
            </li>
            <li className="disabled"><span>Popisi</span></li>
            <li className={isNT ? "active" : ""}>
              <Link href="/team/nt/players" legacyBehavior><a>Igrači</a></Link>
            </li>
            <li className="disabled"><span>Upozorenja</span></li>
            <li className="disabled"><span>Kalendar natjecanja</span></li>
            <li className="disabled"><span>Postavke treninga</span></li>
          </ul>
        </div>

        <div className="sb-divider" />

        <div className="sb-group">
          <div className="sb-label">Hrvatska U21</div>
          <ul className="sb-list">
            <li>
              <Link href="/team/u21/requests" legacyBehavior><a>Zahtjevi</a></Link>
            </li>
            <li className="disabled"><span>Popisi</span></li>
            <li className={isU21 ? "active" : ""}>
              <Link href="/team/u21/players" legacyBehavior><a>Igrači</a></Link>
            </li>
            <li className="disabled"><span>Upozorenja</span></li>
            <li className="disabled"><span>Kalendar natjecanja</span></li>
            <li className="disabled"><span>Postavke treninga</span></li>
          </ul>
        </div>

        <div className="sb-hint">
          * Sive stavke su rezervirane za kasnije.
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          flex: 0 0 265px;
          width: 265px;
          margin-left: 0;
          padding-left: 0;
        }
        .sb-card {
          background: #fff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 12px;
        }
        .sb-title {
          font-weight: 900;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .sb-group { margin-top: 10px; }
        .sb-label {
          font-weight: 800;
          font-size: 12px;
          opacity: 0.85;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 6px;
        }
        .sb-sponsor {
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 9px 10px;
          font-family: monospace;
        }
        .sb-list { list-style: none; padding: 0; margin: 0; }
        .sb-list li {
          padding: 7px 8px;
          border-radius: 10px;
          margin-bottom: 4px;
        }
        .sb-list li a { text-decoration: none; color: inherit; display: block; }
        .sb-list li.active {
          background: #eef3ff;
          border: 1px solid #dfe9ff;
          font-weight: 900;
        }
        .sb-list li.disabled { opacity: 0.45; }
        .sb-divider {
          margin: 12px 0;
          height: 1px;
          background: #eee;
        }
        .sb-hint {
          margin-top: 12px;
          font-size: 11px;
          opacity: 0.6;
          line-height: 1.35;
        }

        @media (max-width: 1100px) {
          .sidebar { display:none; }
        }
      `}</style>
    </aside>
  );
}
