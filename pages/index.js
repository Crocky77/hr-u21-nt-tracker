import Link from "next/link";
import AppLayout from "../components/AppLayout";

export default function HomePage() {
  return (
    <AppLayout isHome>
      <div className="hr-homeWrap">
        <div className="hr-homeCardStack">
          {/* HERO (jedini naslov) */}
          <div className="hr-3dCard">
            <div className="hr-3dCardInner">
              <div className="hr-homeHeroTitle">Hrvatski U21/NT Tracker</div>
              <div className="hr-homeHeroSub">
                Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
              </div>

              {/* Linkovi u headeru (pregledno, ne ruši dizajn) */}
              <div className="hr-homeNav">
                <Link className="hr-homeNavLink" href="/about">O nama</Link>
                <Link className="hr-homeNavLink" href="/help">Pomoć</Link>
                <Link className="hr-homeNavLink" href="/donate">Donacije</Link>
                <Link className="hr-homeNavLink" href="/privacy">Privacy</Link>
                <Link className="hr-homeNavLink" href="/terms">Terms</Link>
              </div>

              {/* Glavni gumbi */}
              <div className="hr-homeHeroBtns">
                <Link className="hr-homeBtn hr-homeBtnU21" href="/team/u21">
                  Hrvatska U21
                </Link>
                <Link className="hr-homeBtn hr-homeBtnNT" href="/team/nt">
                  Hrvatska NT
                </Link>
              </div>
            </div>
          </div>

          {/* MOJI IGRACI */}
          <div className="hr-3dCard" style={{ marginTop: 12 }}>
            <div className="hr-3dCardInner">
              <div className="hr-homeRow">
                <div>
                  <div style={{ fontWeight: 900 }}>Moji igrači u Hrvatskom trackeru</div>
                  <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>
                    CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači” u globalnom trackeru.
                  </div>
                </div>

                <span className="hr-homePill">Prijava (CHPP kasnije)</span>
              </div>
            </div>
          </div>

          {/* 2 KLIKABILNE KARTICE (U21 / NT) */}
          <div className="hr-homeGrid">
            <Link href="/team/u21" className="hr-homeMiniCard hr-homeMiniCardU21">
              <div className="hr-3dCardInner">
                <div className="hr-homeMiniHead">
                  <div className="hr-homeMiniTitle">Hrvatska U21</div>
                  <span className="hr-homeTag">Preview</span>
                </div>
                <div className="hr-homeMiniText">
                  Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
                </div>
                <div className="hr-homeMiniLink">Otvori →</div>
              </div>
            </Link>

            <Link href="/team/nt" className="hr-homeMiniCard hr-homeMiniCardNT">
              <div className="hr-3dCardInner">
                <div className="hr-homeMiniHead">
                  <div className="hr-homeMiniTitle">Hrvatska NT</div>
                  <span className="hr-homeTag">Preview</span>
                </div>
                <div className="hr-homeMiniText">
                  Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
                </div>
                <div className="hr-homeMiniLink">Otvori →</div>
              </div>
            </Link>
          </div>

          <div className="hr-homeNote">
            Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
          </div>
        </div>
      </div>
    </AppLayout>
  );
            }
