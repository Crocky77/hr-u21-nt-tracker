import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function AppLayout({
  title,
  subtitle,
  badgeLeft,
  badgeRight,
  children,
}) {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? null);
    })();
  }, []);

  return (
    <div className="page">
      <header className="top">
        <div className="topInner">
          <div className="brand">
            <div className="crest">HR</div>
            <div className="brandText">
              <div className="brandTitle">Hrvatski U21/NT Tracker</div>
              <div className="brandSub">Selektorski panel · Scouting · U21/NT</div>
            </div>
          </div>

          <div className="meta">
            <div className="badges">
              {badgeLeft ? <span className="pill pillLight">{badgeLeft}</span> : null}
              {badgeRight ? <span className="pill pillDark">{badgeRight}</span> : null}
            </div>
            {email ? <div className="who">Dobrodošli, <strong>{email}</strong></div> : null}
          </div>
        </div>

        <div className="nav">
          <div className="navInner">
            <Link className="navBtn" href="/">Naslovna</Link>
            <Link className="navBtn" href="/about">O alatu</Link>
            <Link className="navBtn" href="/help">Pomoć</Link>
            <Link className="navBtn" href="/donate">Donacije</Link>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="pageHead">
            <h1 className="h1">{title}</h1>
            {subtitle ? <div className="sub">{subtitle}</div> : null}
          </div>

          {children}
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(1100px 600px at 50% 0%, rgba(255,255,255,0.8), rgba(255,255,255,0.25)),
            linear-gradient(180deg, #b10d0d 0%, #7a0a0a 40%, #f3f4f6 40%, #f3f4f6 100%);
        }
        .top {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(6px);
        }
        .topInner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 16px 16px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .crest {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 1000;
          color: #fff;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          letter-spacing: 0.5px;
        }
        .brandTitle {
          color: #fff;
          font-weight: 1000;
          font-size: 18px;
          line-height: 1.15;
          text-shadow: 0 2px 10px rgba(0,0,0,0.25);
        }
        .brandSub {
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-weight: 700;
        }
        .meta {
          text-align: right;
          display: grid;
          gap: 6px;
        }
        .badges {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .pill {
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 950;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .pillLight {
          background: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.95);
        }
        .pillDark {
          background: rgba(0,0,0,0.32);
          color: #fff;
          border-color: rgba(0,0,0,0.2);
        }
        .who {
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 700;
        }
        .nav {
          border-top: 1px solid rgba(255,255,255,0.18);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          background: rgba(0,0,0,0.14);
        }
        .navInner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 10px 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .navBtn {
          text-decoration: none;
          color: #fff;
          font-weight: 900;
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .navBtn:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.18);
        }
        .main {
          padding: 22px 16px 40px;
        }
        .container {
          max-width: 1120px;
          margin: 0 auto;
        }
        .pageHead {
          margin-bottom: 14px;
        }
        .h1 {
          margin: 0;
          color: #111;
          font-size: 28px;
          font-weight: 1000;
          letter-spacing: -0.2px;
        }
        .sub {
          margin-top: 6px;
          color: rgba(0,0,0,0.65);
          font-weight: 700;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
