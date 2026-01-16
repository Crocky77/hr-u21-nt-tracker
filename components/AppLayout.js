// components/AppLayout.js
import Link from "next/link";

export default function AppLayout({ children, title, subtitle, actions, accent = "global" }) {
  const accentClass =
    accent === "u21"
      ? "hr-headerAccentU21"
      : accent === "nt"
      ? "hr-headerAccentNT"
      : "hr-headerAccentGlobal";

  return (
    <div className="hr-page">
      <div className="hr-shell">
        <nav className="hr-topnav">
          <Link className="hr-pill" href="/">
            Naslovna
          </Link>
          <Link className="hr-pill" href="/team/u21">
            Hrvatska U21
          </Link>
          <Link className="hr-pill" href="/team/nt">
            Hrvatska NT
          </Link>
        </nav>

        {(title || subtitle || actions) && (
          <header className={`hr-header ${accentClass}`}>
            <div className="hr-headerRow">
              <div>
                {title ? <h1 className="hr-title">{title}</h1> : null}
                {subtitle ? <p className="hr-subtitle">{subtitle}</p> : null}
              </div>
              {actions ? <div className="hr-actions">{actions}</div> : null}
            </div>
          </header>
        )}

        {children}
      </div>
    </div>
  );
}
