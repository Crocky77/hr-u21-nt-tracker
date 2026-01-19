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
                    {/* U21 */}
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

                        {/* OSOBLJE (U21) */}
                        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.35 }}>
                          <div style={{ color: "#c3002f", fontWeight: 800 }}>Izbornik:</div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#c3002f", fontWeight: 800 }}>
                            Pomoćnik izbornika:
                          </div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#c3002f", fontWeight: 900 }}>
                            Osoblje:
                          </div>
                          <div style={{ opacity: 0.9 }}>
                            <span style={{ fontWeight: 800 }}>Glavni skaut:</span> nepoznato
                          </div>
                          <div style={{ opacity: 0.9 }}>
                            <span style={{ fontWeight: 800 }}>Skaut(i):</span> nepoznato
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* NT */}
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

                        {/* OSOBLJE (NT) */}
                        <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.35 }}>
                          <div style={{ color: "#0a3fa8", fontWeight: 800 }}>Izbornik:</div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#0a3fa8", fontWeight: 800 }}>
                            Pomoćnik izbornika:
                          </div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#0a3fa8", fontWeight: 900 }}>
                            Osoblje:
                          </div>
                          <div style={{ opacity: 0.9 }}>
                            <span style={{ fontWeight: 800 }}>Glavni skaut:</span> nepoznato
                          </div>
                          <div style={{ opacity: 0.9 }}>
                            <span style={{ fontWeight: 800 }}>Skaut(i):</span> nepoznato
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Linkovi (pills) */}
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
              <div
                className="hr-3dCard"
                style={{
                  marginTop: 12,
                  border: "2px solid rgba(195,0,47,0.35)",
                  boxShadow: "0 10px 25px rgba(10,63,168,0.10)",
                }}
              >
                <div className="hr-3dCardInner">
                  <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 1000 }}>
                        Hrvatski U21/NT igrači na transfer listi
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>
                        Live (privremeno): Toxttrick scraping — samo hrvatski igrači, rotacija svakih 6h
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        className="hr-homeLinkPill"
                        style={{
                          background: "rgba(10,63,168,0.10)",
                          border: "1px solid rgba(10,63,168,0.25)",
                          color: "#0a3fa8",
                          fontWeight: 900,
                          cursor: "default",
                        }}
                      >
                        U21 (0)
                      </span>
                      <span
                        className="hr-homeLinkPill"
                        style={{
                          background: "rgba(195,0,47,0.10)",
                          border: "1px solid rgba(195,0,47,0.25)",
                          color: "#c3002f",
                          fontWeight: 900,
                          cursor: "default",
                        }}
                      >
                        NT (0)
                      </span>

                      {/* VAŽNO: držim link isti kao prije (da ne dobijemo 404).
                          Ako je kod tebe druga ruta, samo mi reci koja je (npr. /transfers) */}
                      <Link
                        href="/dashboard_nt"
                        className="hr-homePill"
                        style={{
                          textDecoration: "none",
                          background: "linear-gradient(90deg, rgba(195,0,47,0.14), rgba(10,63,168,0.14))",
                          border: "1px solid rgba(0,0,0,0.08)",
                          fontWeight: 900,
                        }}
                      >
                        Otvori popis →
                      </Link>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, opacity: 0.85, fontSize: 13 }}>
                    Nema hrvatskih igrača na TL (po izvoru).
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
