import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header({ title, showNavLinks = false }) {
  const router = useRouter()

  return (
    <header className="header">
      <div className="left">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1 className="title">{title}</h1>
      </div>

      {showNavLinks && (
        <nav className="nav">
          <Link href="/">Naslovnica</Link>
          <Link href="/team/nt">NT</Link>
          <Link href="/team/u21">U21</Link>
        </nav>
      )}

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: linear-gradient(to right, #0b0b0b, #1a0000);
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }

        .left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo {
          height: 68px;
          width: auto;
        }

        .title {
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          white-space: nowrap;
        }

        .nav {
          display: flex;
          gap: 20px;
        }

        .nav :global(a) {
          color: #ddd;
          text-decoration: none;
          font-weight: 500;
        }

        .nav :global(a:hover) {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </header>
  )
}
