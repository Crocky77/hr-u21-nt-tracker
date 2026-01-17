import Link from "next/link";
import AppLayout from "../components/AppLayout";

export default function HomePage() {
  return (
    <AppLayout isHome>
      <div className="hr-homeWrap">
        <div className="hr-homeCardStack">
          {/* HERO - samo naslov i kratki opis (u boji) */}
          <div className="hr-3dCard hr-homeHeroCard">
            <div className="hr-3dCardInner">
              <div className="hr-homeHeroTitle">Hrvatski U21/NT Tracker</div>
              <div className="hr-homeHeroSub">
                Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
              </div>
            </div>
          </div>

          {/* MOJI IGRACI */}
          <div className="hr-3dCard hr-homeMyCard" style={{ marginTop: 12 }}>
            <div className="hr-3dCardInner">
              <div className="hr-homeRow">
                <div>
                  <div style={{ fontWeight: 900 }}>Moji igrači u Hrvatskom trackeru</div>
                  <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>
                    CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači”.
                  </div>
                </div>

                <span className="hr-homePill">Prijava (CHPP kasnije)</span>
              </div>
            </div>
          </div>

          {/* U21 / NT klikabilni moduli - bez “preview/otvori” */}
          <div className="hr-homeGrid">
            <Link href="/team/u21" className="hr-homeMiniCard hr-homeMiniCardU21">
              <div className="hr-3dCardInner">
                <div className="hr-homeMiniHead">
                  <div className="hr-homeMiniTitle">Hrvatska U21</div>
                </div>
                <div className="hr-homeMiniText">
                  Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
                </div>
              </div>
            </Link>

            <Link href="/team/nt" className="hr-homeMiniCard hr-homeMiniCardNT">
              <div className="hr-3dCardInner">
                <div className="hr-homeMiniHead">
                  <div className="hr-homeMiniTitle">Hrvatska NT</div>
                </div>
                <div className="hr-homeMiniText">
                  Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
                </div>
              </div>
            </Link>
          </div>

          {/* Sitni linkovi (bez rušenja dizajna) */}
          <div className="hr-homeBottomLinks">
            <Link href="/about">O alatu</Link>
            <span className="hr-dot">•</span>
            <Link href="/help">Pomoć</Link>
            <span className="hr-dot">•</span>
            <Link href="/donate">Donacije</Link>
            <span className="hr-dot">•</span>
            <Link href="/privacy">Privacy</Link>
            <span className="hr-dot">•</span>
            <Link href="/terms">Terms</Link>
          </div>

          <div className="hr-homeNote">
            Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
