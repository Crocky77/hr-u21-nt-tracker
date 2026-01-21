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

                          <div style={{ marginTop: 6, color: "#c3002f", fontWeight: 800 }}>Pomoćnik izbornika:</div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#c3002f", fontWeight: 900 }}>Osoblje:</div>
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

                          <div style={{ marginTop: 6, color: "#0a3fa8", fontWeight: 800 }}>Pomoćnik izbornika:</div>
                          <div style={{ opacity: 0.85 }}>nepoznato</div>

                          <div style={{ marginTop: 6, color: "#0a3fa8", fontWeight: 900 }}>Osoblje:</div>
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

                  {/* TRANSFER MODUL (PRIVREMENO ISKLJUČEN) */}
                  <div style={{ marginTop: 14 }}>
                    <div className="hr-3dCard">
                      <div className="hr-3dCardInner">
                        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 1000 }}>Hrvatski U21/NT igrači na transfer listi</div>
                            <div style={{ marginTop: 4, opacity: 0.85, fontSize: 13 }}>
                              Modul je privremeno isključen do dobivanja službene CHPP licence.
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            padding: 14,
                            borderRadius: 14,
                            background: "rgba(10,63,168,0.08)",
                            border: "1px solid rgba(10,63,168,0.18)",
                          }}
                        >
                          <div style={{ fontWeight: 1000, fontSize: 16 }}>Privremeno nedostupno</div>
                          <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.4 }}>
                            Transfer modul je privremeno isključen.
                            <br />
                            Aktivirat će se nakon dobivanja službene <b>CHPP licence</b> (službeni izvor podataka).
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

              {/* FOOTER LINKS */}
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="hr-homePill" href="/login" style={{ textDecoration: "none" }}>
                  Login
                </Link>
                <Link className="hr-homePill" href="/help" style={{ textDecoration: "none" }}>
                  Help
                </Link>
                <Link className="hr-homePill" href="/privacy" style={{ textDecoration: "none" }}>
                  Privacy
                </Link>
                <Link className="hr-homePill" href="/terms" style={{ textDecoration: "none" }}>
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
