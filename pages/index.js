import Link from "next/link";
import AppLayout from "../components/AppLayout";

export default function HomePage() {
  return (
    <AppLayout title="Hrvatski U21/NT Tracker">
      <div className="hr-homeWrap">
        {/* HERO */}
        <div className="hr-3dCard hr-homeCardStack">
          <div className="hr-3dCardInner">
            <div className="hr-homeHeroTitle">Hrvatski U21/NT Tracker</div>
            <div className="hr-homeHeroSub">
              Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
            </div>

            <div className="hr-homeHeroBtns">
              <Link className="hr-homeBtn" href="/team/u21">
                Hrvatska U21
              </Link>
              <Link className="hr-homeBtn" href="/team/nt">
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

        {/* DVIJE PREVIEW KARTICE */}
        <div className="hr-homeGrid">
          <div className="hr-3dCard hr-3dHover">
            <div className="hr-3dCardInner">
              <div className="hr-homeMiniHead">
                <div className="hr-homeMiniTitle">Hrvatska U21</div>
                <span className="hr-homeTag">Preview</span>
              </div>
              <div className="hr-homeMiniText">
                Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
              </div>
              <Link className="hr-homeMiniLink" href="/team/u21">
                Otvori →
              </Link>
            </div>
          </div>

          <div className="hr-3dCard hr-3dHover">
            <div className="hr-3dCardInner">
              <div className="hr-homeMiniHead">
                <div className="hr-homeMiniTitle">Hrvatska NT</div>
                <span className="hr-homeTag">Preview</span>
              </div>
              <div className="hr-homeMiniText">
                Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.
              </div>
              <Link className="hr-homeMiniLink" href="/team/nt">
                Otvori →
              </Link>
            </div>
          </div>
        </div>

        {/* LINKOVI (kao prije) */}
        <div className="hr-homeLinks">
          <Link href="/about">O alatu</Link> — <Link href="/help">Pomoć</Link> —{" "}
          <Link href="/donate">Donacije</Link>
        </div>

        <div className="hr-homeNote">
          Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
        </div>
      </div>
    </AppLayout>
  );
}
