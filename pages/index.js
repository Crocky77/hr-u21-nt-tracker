import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hr-homeBg">
      <main className="hr-main">
        <div className="hr-container">
          <div className="hr-homeWrap">
            <div className="hr-homeCardStack">
              {/* HERO */}
              <div className="hr-3dCard">
                <div className="hr-3dCardInner">
                  <div className="hr-homeHeroTitle">Hrvatski U21/NT Tracker</div>
                  <div className="hr-homeHeroSub">
                    Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
                  </div>

                  {/* U21 / NT - 3D KVADRATI (klikajući) */}
                  <div className="hr-homeGrid" style={{ marginTop: 12 }}>
                    <Link
                      href="/team/u21"
                      className="hr-3dCard hr-3dHover hr-homeMiniCardU21"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="hr-3dCardInner">
                        <div className="hr-homeMiniHead">
                          <div className="hr-homeMiniTitle">Hrvatska U21</div>
                          <div className="hr-homeTag">Preview</div>
                        </div>
                        <div className="hr-homeMiniText">Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.</div>
                        <div className="hr-homeMiniLink">Otvori →</div>
                      </div>
                    </Link>

                    <Link
                      href="/team/nt"
                      className="hr-3dCard hr-3dHover hr-homeMiniCardNT"
                      style={{ textDecoration: "none" }}
                    >
                      <div className="hr-3dCardInner">
                        <div className="hr-homeMiniHead">
                          <div className="hr-homeMiniTitle">Hrvatska NT</div>
                          <div className="hr-homeTag">Preview</div>
                        </div>
                        <div className="hr-homeMiniText">Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.</div>
                        <div className="hr-homeMiniLink">Otvori →</div>
                      </div>
                    </Link>
                  </div>

                  {/* Linkovi (pregledno, bez ponavljanja naslova) */}
                  <div className="hr-homeLinks" style={{ marginTop: 10 }}>
                    <Link href="/about">O alatu</Link> <span className="hr-dot">•</span>{" "}
                    <Link href="/help">Pomoć</Link> <span className="hr-dot">•</span>{" "}
                    <Link href="/donate">Donacije</Link> <span className="hr-dot">•</span>{" "}
                    <Link href="/privacy">Privacy</Link> <span className="hr-dot">•</span>{" "}
                    <Link href="/terms">Terms</Link>
                  </div>
                </div>
              </div>

              {/* MOJI IGRACI */}
              <div className="hr-3dCard" style={{ marginTop: 12 }}>
                <div className="hr-3dCardInner">
                  <div className="hr-homeRow">
                    <div>
                      <div style={{ fontWeight: 1000 }}>Moji igrači u Hrvatskom trackeru</div>
                      <div style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
                        CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači”.
                      </div>
                    </div>

                    <Link className="hr-homePill" href="/my-players" style={{ textDecoration: "none" }}>
                      Prijava (CHPP kasnije)
                    </Link>
                  </div>
                </div>
              </div>

              {/* NAPOMENA */}
              <div className="hr-homeNote">
                Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
