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
                      aria-label="Otvori Hrvatska U21"
                      title="Otvori Hrvatska U21"
                    >
                      <div className="hr-3dCardInner">
                        <div className="hr-homeMiniHead">
                          <div className="hr-homeMiniTitle">Hrvatska U21</div>
                        </div>
                        <div className="hr-homeMiniText">
                          Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/team/nt"
                      className="hr-3dCard hr-3dHover hr-homeMiniCardNT"
                      style={{ textDecoration: "none" }}
                      aria-label="Otvori Hrvatska NT"
                      title="Otvori Hrvatska NT"
                    >
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

                  {/* Linkovi (vidljiviji) */}
                  <div className="hr-homeLinks hr-homeLinksPills" style={{ marginTop: 12 }}>
                    <Link href="/about" className="hr-homeLinkPill">
                      O alatu
                    </Link>
                    <Link href="/help" className="hr-homeLinkPill">
                      Pomoć
                    </Link>
                    <Link href="/donate" className="hr-homeLinkPill">
                      Donacije
                    </Link>
                    <Link href="/privacy" className="hr-homeLinkPill">
                      Privacy
                    </Link>
                    <Link href="/terms" className="hr-homeLinkPill">
                      Terms
                    </Link>
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

              {/* TRANSFER MODUL (HR boje) */}
              <div className="hr-3dCard" style={{ marginTop: 12 }}>
                <div
                  className="hr-3dCardInner"
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* HR traka (crveno-bijelo-plavo) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      right: 0,
                      height: 6,
                      background: "linear-gradient(90deg, #e11d48 0%, #ffffff 50%, #2563eb 100%)",
                    }}
                  />

                  <div style={{ paddingTop: 6 }}>
                    <div style={{ fontWeight: 1000 }}>Hrvatski U21/NT igrači na transfer listi</div>
                    <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>
                      Live (privremeno): Toxttrick scraping — samo hrvatski igrači, rotacija svakih 6h
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Brojači (trenutno placeholder dok scraping/API nije spojen) */}
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: 12,
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(37,99,235,0.12)",
                          border: "1px solid rgba(37,99,235,0.22)",
                        }}
                        title="Broj U21 igrača na transfer listi (privremeno 0)"
                      >
                        U21 (0)
                      </span>

                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: 12,
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(225,29,72,0.12)",
                          border: "1px solid rgba(225,29,72,0.22)",
                        }}
                        title="Broj NT igrača na transfer listi (privremeno 0)"
                      >
                        NT (0)
                      </span>

                      <div style={{ flex: 1 }} />

                      {/* Link na popis (ako imamo posebnu stranicu kasnije ćemo promijeniti href) */}
                      <Link
                        href="/popisi"
                        style={{
                          textDecoration: "none",
                          fontWeight: 900,
                          padding: "8px 12px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.16)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                        title="Otvori popis"
                      >
                        Otvori popis <span aria-hidden="true">→</span>
                      </Link>
                    </div>

                    <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
                      Nema hrvatskih igrača na TL (po izvoru).
                    </div>
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
