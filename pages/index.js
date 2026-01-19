import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function normalizeTeamType(v) {
  const s = String(v || "").toUpperCase().trim();
  if (s === "U21") return "U21";
  if (s === "NT") return "NT";
  return s;
}

function normalizeRole(v) {
  return String(v || "").toLowerCase().trim();
}

function buildStaffLine(staffByTeam, teamType) {
  const team = staffByTeam[teamType] || {};
  const coach = team.coach || [];
  const assistant = team.assistant || [];
  const scout = team.scout || [];

  const parts = [];

  if (coach.length) parts.push(`Izbornik: ${coach.join(", ")}`);
  if (assistant.length) parts.push(`Pomoćnik: ${assistant.join(", ")}`);

  if (scout.length) {
    // Ako su samo "Staff #1", "Staff #2" itd – prikazujemo ih sve
    parts.push(`Skauti: ${scout.join(", ")}`);
  }

  if (!parts.length) return "Osoblje: (nema podataka)";
  return parts.join(" • ");
}

export default function HomePage() {
  const [staffRows, setStaffRows] = useState([]);
  const [staffErr, setStaffErr] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadStaff() {
      setStaffErr(null);

      const { data, error } = await supabase
        .from("staff_members_public")
        .select("team_type, role, staff_label")
        .order("team_type", { ascending: true })
        .order("role", { ascending: true })
        .order("staff_label", { ascending: true });

      if (!alive) return;

      if (error) {
        setStaffErr(error.message || "Greška kod učitavanja osoblja.");
        setStaffRows([]);
        return;
      }

      setStaffRows(Array.isArray(data) ? data : []);
    }

    loadStaff();
    return () => {
      alive = false;
    };
  }, []);

  const staffByTeam = useMemo(() => {
    const out = { U21: {}, NT: {} };

    for (const r of staffRows) {
      const teamType = normalizeTeamType(r.team_type);
      const role = normalizeRole(r.role);
      const label = String(r.staff_label || "").trim();

      if (!label) continue;
      if (!out[teamType]) out[teamType] = {};
      if (!out[teamType][role]) out[teamType][role] = [];
      out[teamType][role].push(label);
    }

    return out;
  }, [staffRows]);

  const u21StaffLine = buildStaffLine(staffByTeam, "U21");
  const ntStaffLine = buildStaffLine(staffByTeam, "NT");

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

                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9, lineHeight: 1.35 }}>
                          {staffErr ? `Osoblje: greška (${staffErr})` : u21StaffLine}
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

                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9, lineHeight: 1.35 }}>
                          {staffErr ? `Osoblje: greška (${staffErr})` : ntStaffLine}
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
