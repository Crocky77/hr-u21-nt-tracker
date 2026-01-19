import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

function safeTeam(team) {
  return team === "u21" || team === "nt" ? team : "u21";
}

export default function TeamPlayers() {
  const router = useRouter();
  const team = safeTeam(router.query.team);

  // === Skeleton data (dok ne spojimo DB/CHPP) ===
  const requestOptions = useMemo(() => {
    if (team === "u21") {
      return [
        { id: "u21_gk", name: "U21 GK (test)" },
        { id: "u21_def", name: "U21 DEF (test)" },
        { id: "u21_any", name: "U21 bilo tko (preview)" },
      ];
    }
    return [
      { id: "nt_gk", name: "NT GK (test)" },
      { id: "nt_def", name: "NT DEF (test)" },
      { id: "nt_any", name: "NT bilo tko (preview)" },
    ];
  }, [team]);

  const [selectedRequestId, setSelectedRequestId] = useState(requestOptions[0]?.id || "");
  const [q, setQ] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [pos, setPos] = useState("");
  const [showSkills, setShowSkills] = useState(true);

  // Placeholder "rezultati"
  const results = useMemo(() => {
    // U ovom skeletonu samo filtriramo fake listu (da UI “diše”).
    // Kasnije: ovdje ide DB query prema odabranom zahtjevu + dodatni filteri.
    const fake = [
      { id: "101", name: "Igrač A", pos: "GK", age: 19, status: "OK", ht_id: "123456789" },
      { id: "102", name: "Igrač B", pos: "DEF", age: 20, status: "OK", ht_id: "223456789" },
      { id: "103", name: "Igrač C", pos: "IM", age: 21, status: "Watch", ht_id: "323456789" },
      { id: "104", name: "Igrač D", pos: "WING", age: 22, status: "OK", ht_id: "423456789" },
    ];

    let rows = fake;

    if (pos) rows = rows.filter((r) => r.pos === pos);
    if (ageMin) rows = rows.filter((r) => r.age >= Number(ageMin));
    if (ageMax) rows = rows.filter((r) => r.age <= Number(ageMax));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          String(r.ht_id || "").includes(s) ||
          String(r.pos || "").toLowerCase().includes(s)
      );
    }

    // “Zahtjev” u skeletonu samo mijenja naslov (kasnije ide DB filter)
    if (selectedRequestId.endsWith("_gk")) rows = rows.filter((r) => r.pos === "GK");
    if (selectedRequestId.endsWith("_def")) rows = rows.filter((r) => r.pos === "DEF");

    return rows;
  }, [q, ageMin, ageMax, pos, selectedRequestId]);

  const label = teamLabel(team);

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        {/* HEADER */}
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Igrači</h1>
            <div className="hr-pageSub">
              Aktivni tim: <b>{label}</b> — odaberi zahtjev i filtriraj rezultate (skeleton)
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="hr-backBtn" href={`/team/${team}`}>
              ← Natrag na module
            </Link>
            <Link className="hr-backBtn" href="/">
              Naslovnica
            </Link>
          </div>
        </div>

        {/* REQUEST PICKER + FILTERS */}
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr 1fr 1fr",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div style={{ minWidth: 240 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Zahtjev</div>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.92)",
                fontWeight: 800,
              }}
            >
              {requestOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Pretraga</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ime, HT ID, pozicija…"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                background: "rgba(255,255,255,0.92)",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Dob</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="min"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  outline: "none",
                  background: "rgba(255,255,255,0.92)",
                }}
              />
              <input
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="max"
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  outline: "none",
                  background: "rgba(255,255,255,0.92)",
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Pozicija</div>
            <select
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.92)",
                fontWeight: 800,
              }}
            >
              <option value="">Sve</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="IM">IM</option>
              <option value="WING">WING</option>
              <option value="FWD">FWD</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
            <input
              type="checkbox"
              checked={showSkills}
              onChange={(e) => setShowSkills(e.target.checked)}
            />
            Prikaži “skill” stupce (preview)
          </label>

          <button
            type="button"
            onClick={() => alert("U 16.3 spajamo ovo na DB (team_requests → query → players).")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(255,255,255,0.9)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Primijeni zahtjev → (skeleton)
          </button>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setAgeMin("");
              setAgeMax("");
              setPos("");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(255,255,255,0.9)",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Reset filtera
          </button>
        </div>

        {/* RESULTS TABLE */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>
            Rezultati ({results.length})
          </div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.92)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: showSkills
                  ? "1.4fr 0.7fr 0.7fr 0.9fr 0.9fr 0.9fr 1fr"
                  : "1.6fr 0.8fr 0.8fr 1.2fr 1fr",
                padding: "10px 12px",
                fontWeight: 900,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <div>Ime</div>
              <div>Poz</div>
              <div>Dob</div>
              {showSkills ? (
                <>
                  <div>GK</div>
                  <div>DEF</div>
                  <div>PM</div>
                  <div>Akcija</div>
                </>
              ) : (
                <>
                  <div>HT ID</div>
                  <div>Akcija</div>
                </>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{ padding: "12px", opacity: 0.7 }}>Nema rezultata.</div>
            ) : (
              results.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: showSkills
                      ? "1.4fr 0.7fr 0.7fr 0.9fr 0.9fr 0.9fr 1fr"
                      : "1.6fr 0.8fr 0.8fr 1.2fr 1fr",
                    padding: "10px 12px",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{r.name}</div>
                  <div>{r.pos}</div>
                  <div>{r.age}</div>

                  {showSkills ? (
                    <>
                      <div style={{ opacity: 0.75 }}>—</div>
                      <div style={{ opacity: 0.75 }}>—</div>
                      <div style={{ opacity: 0.75 }}>—</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => alert("Dodavanje u listu dolazi u Task 17 (Lists).")}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "rgba(255,255,255,0.9)",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          + U listu
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("Detalji igrača dolaze kad napravimo players/[id] + DB.")}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "rgba(255,255,255,0.9)",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Detalji →
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {r.ht_id || "—"}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => alert("Dodavanje u listu dolazi u Task 17 (Lists).")}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "rgba(255,255,255,0.9)",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          + U listu
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            * U Task 16.3 spajamo “Zahtjev” na DB (team_requests) i stvarne igrače (bez CHPP još).
          </div>
        </div>
      </div>
    </div>
  );
                        }
