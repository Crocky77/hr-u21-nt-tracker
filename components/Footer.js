import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <nav>
        <Link href="/about">O alatu</Link>
        <Link href="/help">Pomoć</Link>
        <Link href="/donations">Donacije</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>

      <style jsx>{`
        .footer {
          margin-top: 60px;
          padding: 20px 0;
          text-align: center;
          background: rgba(0,0,0,0.65);
          border-top: 1px solid rgba(255,255,255,0.15);
        }

        nav {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        nav :global(a) {
          color: #ccc;
          text-decoration: none;
          font-size: 14px;
        }

        nav :global(a:hover) {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>
    </footer>
  )
}
