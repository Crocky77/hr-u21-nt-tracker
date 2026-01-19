import Link from "next/link";
import { supabase } from "../utils/supabaseClient";

/**
 * Home page je public (preview).
 * Ovdje smijemo prikazati samo anonimizirane oznake osoblja (staff_label),
 * NIKAD email/nick/identitet.
 */
export async function getStaticProps() {
  try {
    const { data, error } = await supabase
      .from("staff_members_public")
      .select("team_type, role, staff_label");

    if (error) {
      // fallback na prazno ako DB iz bilo kojeg razloga ne da podatke
      return {
        props: { staffByTeam: { U21: {}, NT: {} } },
        revalidate: 60,
      };
    }

    const staffByTeam = { U21: {}, NT: {} };

    for (const row of data || []) {
      const team = row.team_type;
      const role = row.role;
      const label = row.staff_label;

      if (!team || !role || !label) continue;
      if (!staffByTeam[team]) staffByTeam[team] = {};
      if (!staffByTeam[team][role]) staffByTeam[team][role] = [];
      staffByTeam[team][role].push(label);
    }

    return {
      props: { staffByTeam },
      // public stranica - dovoljno je osvježenje svaku minutu
      revalidate: 60,
    };
  } catch (e) {
    return {
      props: { staffByTeam: { U21: {}, NT: {} } },
      revalidate: 60,
    };
  }
}

function pickOne(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : "(nema podataka)";
}

function pickNth(arr, idx) {
  return Array.isArray(arr) && arr.length > idx ? arr[idx] : "(nema podataka)";
}

function StaffBlock({ teamType, staff, color }) {
  // roleovi koje želimo prikazati uvijek
  const coach = pickOne(staff?.coach);
  const assistant = pickOne(staff?.assistant);
  const scout1 = pickNth(staff?.scout, 0);
  const scout2 = pickNth(staff?.scout, 1);

  return (
    <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.35, color }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>
        Osoblje ({teamType})
      </div>

      <div>
        <span style={{ fontWeight: 700 }}>Izbornik:</span> {coach}
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>Pomoćnik izbornika:</span>{" "}
        {assistant}
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>Skaut #1:</span> {scout1}
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>Skaut #2:</span> {scout2}
      </div>
    </div>
  );
}

export default function HomePage({ staffByTeam }) {
  const u21Staff = staffByTeam?.U21 || {};
  const ntStaff = staffByTeam?.NT || {};

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
                    Javni pregled strukture i “preview”. Igrači i skillovi su
                    zaključani bez prijave.
                  </div>

                  {/* U21 / NT - VEĆE KARTICE */}
                  <div className="hr-homeGrid" style={{ marginTop: 14 }}>
                    <Link
                      href="/team/u21"
                      className="hr-3dCard hr-3dHover hr-homeMiniCardU21"
                      style={{
                        textDecoration: "none",
                        display: "block",
                        minHeight: 170,
                      }}
                      aria-label="Otvori Hrvatska U21"
                      title="Otvori Hrvatska U21"
                    >
                      <div
                        className="hr-3dCardInner"
                        style={{ padding: 18 }}
                      >
                        <div className="hr-homeMiniHead">
                          <div
                            className="hr-homeMiniTitle"
                            style={{ fontSize: 20 }}
                          >
                            Hrvatska U21
                          </div>
                        </div>

                        <div
                          className="hr-homeMiniText"
                          style={{ fontSize: 14, marginTop: 6 }}
                        >
                          Pregled modula (preview). Igrači i skillovi su
                          zaključani bez prijave.
                        </div>

                        <StaffBlock
                          teamType="U21"
                          staff={u21Staff}
                          color="#c62828"
                        />
                      </div>
                    </Link>

                    <Link
                      href="/team/nt"
                      className="hr-3dCard hr-3dHover hr-homeMiniCardNT"
                      style={{
                        textDecoration: "none",
                        display: "block",
                        minHeight: 170,
                      }}
                      aria-label="Otvori Hrvatska NT"
                      title="Otvori Hrvatska NT"
                    >
                      <div
                        className="hr-3dCardInner"
                        style={{ padding: 18 }}
                      >
                        <div className="hr-homeMiniHead">
                          <div
                            className="hr-homeMiniTitle"
                            style={{ fontSize: 20 }}
                          >
                            Hrvatska NT
                          </div>
                        </div>

                        <div
                          className="hr-homeMiniText"
                          style={{ fontSize: 14, marginTop: 6 }}
                        >
                          Pregled modula (preview). Igrači i skillovi su
                          zaključani bez prijave.
                        </div>

                        <StaffBlock
                          teamType="NT"
                          staff={ntStaff}
                          color="#1565c0"
                        />
                      </div>
                    </Link>
                  </div>

                  {/* Linkovi (vidljiviji) */}
                  <div
                    className="hr-homeLinks hr-homeLinksPills"
                    style={{ marginTop: 14 }}
                  >
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
                      <div style={{ fontWeight: 1000 }}>
                        Moji igrači u Hrvatskom trackeru
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
                        CHPP spajanje dolazi kasnije. Za sada pripremamo UI + DB
                        za “moji igrači”.
                      </div>
                    </div>

                    <Link
                      className="hr-homePill"
                      href="/my-players"
                      style={{ textDecoration: "none" }}
                    >
                      Prijava (CHPP kasnije)
                    </Link>
                  </div>
                </div>
              </div>

              {/* NAPOMENA */}
              <div className="hr-homeNote">
                Napomena: u V1 gost vidi “preview” modula, ali sve stranice koje
                prikazuju igrače/skillove traže prijavu.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
                            }
