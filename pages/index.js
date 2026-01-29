import Link from 'next/link';
import AppLayout from '../components/AppLayout';

export default function HomePage() {
  return (
    <AppLayout variant="home" headerTitle="Hrvatski U21/NT Tracker" showHeaderNav={false}>
      <div className="hr-container">
        <div className="hr-homePanel">
          <h1 className="hr-homeTitle">Moji igrači u Hrvatskom trackeru</h1>
          <p className="hr-homeSub">CHPP dozvola je kasnije. Za sada pripremamo UI + DB za "moji igrači".</p>

          {/* Samo ovaj widget je klikabilan (ne pola stranice) */}
          <Link href="/my-players" className="hr-myPlayersWidget" aria-label="Moji igrači">
            <div>
              <div className="hr-myPlayersWidgetTitle">Moji igrači u Hrvatskom trackeru</div>
              <div className="hr-myPlayersWidgetSub">Otvori modul i prijavi se (CHPP kasnije).</div>
            </div>
            <span className="hr-myPlayersBtn">Prijava (CHPP kasnije)</span>
          </Link>

          {/* PRVI RED */}
          <div className="hr-homeTopRow">
            <Link href="/team/nt" className="hr-homeBigBtn hr-homeBigBtn--nt" aria-label="NT Hrvatska">
              <span className="hr-homeBigBtnText">NT Hrvatska</span>
            </Link>
            <Link href="/team/u21" className="hr-homeBigBtn hr-homeBigBtn--u21" aria-label="U21 Hrvatska">
              <span className="hr-homeBigBtnText">U21 Hrvatska</span>
            </Link>
            <Link href="/team/nt/transfers" className="hr-homeBigBtn hr-homeBigBtn--tr" aria-label="Transfer lista">
              <span className="hr-homeBigBtnText">Transfer lista</span>
            </Link>
          </div>

          {/* DRUGI + TREĆI RED (8 widgeta) */}
          <div className="hr-homeGrid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="hr-homeSmallCard">
                U izradi
              </div>
            ))}
          </div>

          <div className="hr-homeFooter">
            <div className="hr-homeFooterLinks">
              <span className="hr-homeFooterLink">O alatu</span>
              <span className="hr-homeFooterLink">Pomoć</span>
              <span className="hr-homeFooterLink">Donacije</span>
              <span className="hr-homeFooterLink">Privacy</span>
              <span className="hr-homeFooterLink">Terms</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
