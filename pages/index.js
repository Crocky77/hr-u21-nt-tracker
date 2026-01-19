import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import supabase from "../utils/supabaseClient";

function StaffLine({ team, color, label, items }) {
  return (
    <div style={{ marginTop: 6, fontSize: 13 }}>
      <span style={{ fontWeight: 800, color }}>{label}:</span>{" "}
      {items && items.length ? (
        items.map((x, idx) => (
          <span key={`${team}-${label}-${x}-${idx}`}>
            <Link
              href={`/staff?team=${team}`}
              style={{
                color,
                textDecoration: "underline",
                textUnderlineOffset: 2,
                fontWeight: 800,
              }}
              title="Otvori osoblje"
            >
              {x}
            </Link>
            {idx < items.length - 1 ? ", " : ""}
          </span>
        ))
      ) : (
        <span style={{ opacity: 0.75 }}>(nema podataka)</span>
      )}
    </div>
  );
}

export default function HomePage() {
  const [staff, setStaff] = useState({
    U21: { coach: [], assistant: [], scout: [] },
    NT: { coach: [], assistant: [], scout: [] },
  });

  // boje osoblja (U21 crveno, NT plavo)
  const staffColors = useMemo(
    () => ({
      U21: "#b00020",
      NT: "#0b3d91",
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadStaff() {
      // staff_members_public: (team_type, role, staff_label)
      const { data, error } = await supabase
        .from("staff_members_public")
        .select("team_type, role, staff_label")
        .in("team_type", ["U21", "NT"]);

      if (cancelled) return;

      if (error) {
        // ako ne uspije, samo ostavimo prazno (bez rušenja UI)
        console.warn("staff_members_public load error:", error.message);
        return;
      }

      const next = {
        U21: { coach: [], assistant: [], scout: [] },
        NT: { coach: [], assistant: [], scout: [] },
      };

      (data || []).forEach((r) => {
        const team = r.team_type;
        const role = String(r.role || "").toLowerCase();
        const label = r.staff_label;

        if (!team || !label) return;

        // mapiranje role -> naše 3 grupe
        let key = null;
        if (role === "coach") key = "coach";
        else if (role === "assistant") key = "assistant";
        else if (role === "scout") key = "scout";
        else return;

        if (!next[team]) return;
        next[team][key].push(label);
      });

      // stabilan prikaz (sort)
      Object.keys(next).forEach((team) => {
        Object.keys(next[team]).forEach((k) => {
          next[team][k] = next[team][k].slice().sort((a, b) => a.localeCompare(b));
        });
      });

      setStaff(next);
    }

    loadStaff();
    return () => {
      cancelled = true;
    };
  }, []);

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

                  {/* NAV PILLS */}
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

              {/* U21 / NT — 3D KARTICE (VEĆE) */}
              <div className="hr-homeGrid" style={{ marginTop: 14 }}>
                {/* U21 */}
                <Link
                  href="/team/u21"
                  className="hr-3dCard hr-3dHover hr-homeMiniCardU21"
                  style={{ textDecoration: "none", minHeight: 120 }}
                  aria-label="Otvori Hrvatska U21"
                  title="Otvori Hrvatska U21"
                >
                  <div className="hr-3dCardInner">
                    <div className="hr-homeMiniHead">
                      <div className="hr-homeMiniTitle">Hrvatska U21</div>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                      Moduli: zahtjevi, popisi, igrači, upozorenja...
                    </div>

                    <StaffLine
                      team="u21"
                      color={staffColors.U21}
                      label="Izbornik"
                      items={staff.U21.coach}
                    />
                    <StaffLine
                      team="u21"
                      color={staffColors.U21}
                      label="Pomoćnik"
                      items={staff.U21.assistant}
                    />
                    <StaffLine
                      team="u21"
                      color={staffColors.U21}
                      label="Skaut #1/#2"
                      items={staff.U21.scout}
                    />
                  </div>
                </Link>

                {/* NT */}
                <Link
                  href="/team/nt"
                  className="hr-3dCard hr-3dHover hr-homeMiniCardNT"
                  style={{ textDecoration: "none", minHeight: 120 }}
                  aria-label="Otvori Hrvatska NT"
                  title="Otvori Hrvatska NT"
                >
                  <div className="hr-3dCardInner">
                    <div className="hr-homeMiniHead">
                      <div className="hr-homeMiniTitle">Hrvatska NT</div>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                      Moduli: zahtjevi, popisi, igrači, upozorenja...
                    </div>

                    <StaffLine
                      team="nt"
                      color={staffColors.NT}
                      label="Izbornik"
                      items={staff.NT.coach}
                    />
                    <StaffLine
                      team="nt"
                      color={staffColors.NT}
                      label="Pomoćnik"
                      items={staff.NT.assistant}
                    />
                    <StaffLine
                      team="nt"
                      color={staffColors.NT}
                      label="Skaut #1/#2"
                      items={staff.NT.scout}
                    />
                  </div>
                </Link>
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
