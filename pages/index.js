import Link from "next/link";
import AppLayout from "../components/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <section className="hr-homePanel">
        <h1 className="hr-homeTitle">Moji igrači u Hrvatskom trackeru</h1>
        <p className="hr-homeSub">
          CHPP dozvola je kasnije. Za sada pripremamo UI + DB za “moji igrači”.
        </p>

        {/* WIDE CLICKABLE WIDGET: samo ovaj je klikabilan */}
        <Link href="/my-players" className="hr-wideWidget" aria-label="Moji igrači">
          <div className="hr-wideWidgetLeft">
            <div className="hr-wideWidgetTitle">Moji igrači u Hrvatskom trackeru</div>
            <div className="hr-wideWidgetDesc">Otvori modul i prijavi se (CHPP kasnije).</div>
          </div>

          <div className="hr-wideWidgetRight">
            {/* gumb je samo vizual; modul je klik cijelog widgeta */}
            <span className="hr-loginBtn">Prijava (CHPP kasnije)</span>
          </div>
        </Link>

        {/* 1. red (NT / U21 / Transfers) */}
        <div className="hr-topTiles">
          <Link href="/team/nt" className="hr-tile hr-tileNt">
            <span className="hr-tileText">NT Hrvatska</span>
          </Link>

          <Link href="/team/u21" className="hr-tile hr-tileU21">
            <span className="hr-tileText">U21 Hrvatska</span>
          </Link>

          {/* NEMAŠ sliku za transfer: radimo svoj dizajn */}
          <Link href="/team/nt/transfers" className="hr-tile hr-tileTransfer">
            <span className="hr-tileText">Transfer lista</span>
          </Link>
        </div>

        {/* 2 reda: ukupno 8 widgeta */}
        <div className="hr-grid8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="hr-miniWidget" key={i}>
              U izradi
            </div>
          ))}
        </div>

        <footer className="hr-footerLite">
          <a href="#" className="hr-footerLink">O alatu</a>
          <a href="#" className="hr-footerLink">Pomoć</a>
          <a href="#" className="hr-footerLink">Donacije</a>
          <a href="#" className="hr-footerLink">Privacy</a>
          <a href="#" className="hr-footerLink">Terms</a>
        </footer>
      </section>
    </AppLayout>
  );
}
