import Link from "next/link";

export default function Header({ title, showNavLinks }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* LOGO + TITLE */}
        <div className="left">
          <img src="/logo.png" alt="Logo" className="logo" />
          <span className="title">{title}</span>
        </div>

        {/* DESNI LINKOVI (samo izvan naslovnice) */}
        {showNavLinks && (
          <nav className="nav">
            <Link href="/">Naslovnica</Link>
            <Link href="/team/nt">NT</Link>
            <Link href="/team/u21">U21</Link>
          </nav>
        )}
      </div>

      <style jsx>{`
        .header {
          width: 100%;
          background: linear-gradient(to right, #050505, #1a0000);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          height: 96px; /* HERO LOGO */
          width: auto;
        }

        .title {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          gap: 22px;
        }

        .nav :global(a) {
          color: #dddddd;
          text-decoration: none;
          font-weight: 500;
        }

        .nav :global(a:hover) {
          color: #ffffff;
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
}
