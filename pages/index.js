import Link from "next/link";

export default function Home() {
  return (
    <div className="hr-homeWrap">
      <div className="hr-homeCardStack">
        <div className="hr-homeCard hr-homeHero">
          <div className="hr-homeHeroTitle">Hrvatski U21/NT Tracker</div>
          <div className="hr-homeHeroSub">
            Javni pregled strukture i “preview”. Igrači i skillovi su zaključani bez prijave.
          </div>

          <div className="hr-homeHeroBtns">
            <Link className="hr-homeBtn" href="/team/u21">Hrvatska U21</Link>
            <Link className="hr-homeBtn" href="/team/nt">Hrvatska NT</Link>
          </div>
        </div>

        <div className="hr-homeCard hr-homeMyPlayers">
          <div className="hr-homeRow">
            <div>
              <div className="hr-homeCardTitle">Moji igrači u Hrvatskom trackeru</div>
              <div className="hr-homeCardText">
                CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB za “moji igrači” u globalnom trackeru.
              </div>
            </div>

            <div className="hr-homeRight">
              <span className="hr-homePill">Prijava (CHPP kasnije)</span>
            </div>
          </div>
        </div>

        <div className="hr-homeGrid">
          <div className="hr-homeMiniCard">
            <div className="hr-homeMiniHead">
              <div className="hr-homeMiniTitle">Hrvatska U21</div>
              <span className="hr-homeTag">Preview</span>
            </div>
            <div className="hr-homeMiniText">Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.</div>
            <div className="hr-homeMiniLink">
              <Link href="/team/u21">Otvori →</Link>
            </div>
          </div>

          <div className="hr-homeMiniCard">
            <div className="hr-homeMiniHead">
              <div className="hr-homeMiniTitle">Hrvatska NT</div>
              <span className="hr-homeTag">Preview</span>
            </div>
            <div className="hr-homeMiniText">Pregled modula (preview). Igrači i skillovi su zaključani bez prijave.</div>
            <div className="hr-homeMiniLink">
              <Link href="/team/nt">Otvori →</Link>
            </div>
          </div>
        </div>

        <div className="hr-homeLinks">
          <Link href="/about">O alatu →</Link>
          <span> · </span>
          <Link href="/help">Pomoć →</Link>
          <span> · </span>
          <Link href="/donate">Donacije →</Link>
        </div>

        <div className="hr-homeNote">
          Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje prikazuju igrače/skillove traže prijavu.
        </div>
      </div>
    </div>
  );
}
