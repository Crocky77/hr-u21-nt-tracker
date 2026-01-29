import Link from "next/link";

export default function Header({ showNav = true }) {
  return (
    <header className="hdr">
      {/* cijeli header klikabilan -> naslovnica */}
      <Link href="/" className="hdrClick" aria-label="Naslovnica">
        <span />
      </Link>

      <div className="hdrInner">
        <div className="left">
          <img className="logo" src="/logo.png" alt="HR U21/NT Tracker" />
          <div className="title">Hrvatski U21/NT Tracker</div>
        </div>

        {showNav && (
          <nav className="nav">
            <Link href="/" className="navLink">
              Naslovnica
            </Link>
            <Link href="/team/nt" className="navLink">
              NT
            </Link>
            <Link href="/team/u21" className="navLink">
              U21
            </Link>
          </nav>
        )}
      </div>

      <style jsx>{`
        .hdr {
          position: sticky;
          top: 0;
          z-index: 50;
          height: 86px;
          background: rgba(10, 10, 10, 0.55);
          backdrop-filter: blur(6px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.18); /* tanka linija 1px */
        }

        .hdrClick {
          position: absolute;
          inset: 0;
          display: block;
        }

        .hdrInner {
          position: relative;
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px 0 10px; /* skroz lijevo */
          pointer-events: none; /* da klik ide na overlay */
        }

        .left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          width: 62px; /* veći logo */
          height: 62px;
          object-fit: contain;
          margin-left: 2px;
        }

        .title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: none;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 18px;
          pointer-events: auto; /* nav linkovi moraju biti klikabilni */
        }

        .navLink {
          color: #ffffff;
          font-weight: 800;
          text-decoration: none;
          opacity: 0.95;
        }

        .navLink:hover {
          text-decoration: underline;
          opacity: 1;
        }

        @media (max-width: 720px) {
          .title {
            font-size: 18px;
          }
          .logo {
            width: 52px;
            height: 52px;
          }
          .nav {
            gap: 12px;
          }
        }
      `}</style>
    </header>
  );
}
