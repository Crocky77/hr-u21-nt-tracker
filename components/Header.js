import Link from "next/link";

export default function Header({ title, showNavLinks }) {
  return (
    <header className="header">
      <div className="inner">
        <div className="left">
          <img src="/logo.png" alt="Logo" className="logo" />
          <span className="title">{title}</span>
        </div>

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
          height: 110px;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.92), rgba(30, 0, 0, 0.82));
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          position: relative;
        }

        .inner {
          height: 100%;
          width: 100%;
          padding: 0 18px; /* skroz lijevo */
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .logo {
          height: 96px;
          width: auto;
          margin-top: -18px; /* “preko” */
        }

        .title {
          color: #fff;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          gap: 22px;
        }

        .nav :global(a) {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-weight: 700;
        }

        .nav :global(a:hover) {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
}
