import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hr-homeBg">
      <main className="hr-main">
        <div className="hr-container">
          <div className="hr-homeWrap">
            <div className="hr-homeCardStack">

              {/* NASLOV */}
              <div className="hr-homeHeroTitle">
                Moji igrači u Hrvatskom trackeru
              </div>
              <div className="hr-homeHeroSub">
                Prijava i upravljanje igračima (CHPP kasnije).
              </div>

              {/* MOJI IGRAČI – KLIKABILNI WIDGET */}
              <Link
                href="/login"
                className="hr-homeMyPlayersCard"
                style={{ textDecoration: "none" }}
              >
                <div className="hr-homeMyPlayersInner">
                  <div className="hr-homeMyPlayersText">
                    <strong>Upravljanje mojim igračima</strong>
                    <div className="hr-homeMyPlayersSub">
                      Prijava i povezivanje (CHPP kasnije)
                    </div>
                  </div>

                  <div className="hr-homeMyPlayersBtn">
                    Prijava
                  </div>
                </div>
              </Link>

              {/* U21 / NT / TRANSFER */}
              <div className="hr-homeGrid">

                <Link href="/team/nt" className="hr-3dCard hr-3dHover">
                  <div className="hr-3dCardInner">
                    <div className="hr-homeMiniTitle">NT Hrvatska</div>
                  </div>
                </Link>

                <Link href="/team/u21" className="hr-3dCard hr-3dHover hr-homeMiniCardU21">
                  <div className="hr-3dCardInner">
                    <div className="hr-homeMiniTitle">U21 Hrvatska</div>
                  </div>
                </Link>

                <Link href="/transfers" className="hr-3dCard hr-3dHover">
                  <div className="hr-3dCardInner">
                    <div className="hr-homeMiniTitle">Transfer lista</div>
                  </div>
                </Link>

              </div>

              {/* PLACEHOLDER WIDGETI */}
              <div className="hr-homeGrid hr-homeGridSmall">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Link
                    key={i}
                    href="/uskoro"
                    className="hr-homePlaceholder"
                  >
                    U izradi
                  </Link>
                ))}
              </div>

              {/* FOOTER */}
              <div className="hr-homeFooter">
                <Link href="/about">O alatu</Link>
                <Link href="/help">Pomoć</Link>
                <Link href="/donations">Donacije</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
