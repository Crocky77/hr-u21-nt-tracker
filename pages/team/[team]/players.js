import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../../utils/supabaseClient";

function teamLabel(team) {
  if (team === "u21") return "Hrvatska U21";
  if (team === "nt") return "Hrvatska NT";
  return "Tim";
}

const DEFAULT_COLUMNS = {
  // osnovno
  full_name: true,
  pos: true,
  age: true,
  ht_player_id: true,
  nationality: false,
  tsi: false,
  wage: false,
  form: false,
  stamina: false,
  stamina_pct: false,
  training_last: false,
  training_now: false,

  // skills
  skill_gk: true,
  skill_def: true,
  skill_pm: true,
  skill_wing: false,
  skill_pass: true,
  skill_score: false,
  skill_sp: false,
};

function colLabel(key) {
  const map = {
    full_name: "Ime",
    pos: "Poz",
    age: "God",
    ht_player_id: "HT ID",
    nationality: "Nacija",
    tsi: "TSI",
    wage: "Plaća",
    form: "Forma",
    stamina: "Stamina",
    stamina_pct: "% Stam",
    training_last: "Zadnji trening",
    training_now: "Trenutni trening",

    skill_gk: "GK",
    skill_def: "DEF",
    skill_pm: "PM",
    skill_wing: "WING",
    skill_pass: "PASS",
    skill_score: "SCOR",
    skill_sp: "SP",
  };
  return map[key] || key;
}

function isAuthError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return msg.includes("not authenticated") || msg.includes("jwt") || msg.includes("auth");
}

export default function TeamPlayers() {
  const router = useRouter();
  const { team } = router.query;

  const [teamId, setTeamId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  const [rows, setRows] = useState([]);

  const [showCols, setShowCols] = useState(false);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  const label = useMemo(() => teamLabel(team), [team]);

  // učitaj kolone iz localStorage per team
  useEffect(() => {
    if (!team) return;
    try {
      const key = `hr_tracker_cols_${team}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setColumns({ ...DEFAULT_COLUMNS, ...parsed });
      } else {
        setColumns(DEFAULT_COLUMNS);
      }
    } catch {
      setColumns(DEFAULT_COLUMNS);
    }
  }, [team]);

  // spremi kolone
  useEffect(() => {
    if (!team) return;
    try {
      const key = `hr_tracker_cols_${team}`;
      localStorage.setItem(key, JSON.stringify(columns));
    } catch {
      // ignore
    }
  }, [columns, team]);

  // resolve teamId po slug-u (u21/nt)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!team) return;
      setTeamId(null);
      setLoadError("");

      const { data, error } = await supabase
        .from("teams")
        .select("id, slug")
        .eq("slug", team)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setLoadError(`Ne mogu dohvatiti team_id za "${team}". (${error.message})`);
        return;
      }
      if (!data?.id) {
        setLoadError(`Ne postoji tim za slug "${team}". Provjeri tablicu teams.`);
        return;
      }

      setTeamId(data.id);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [team]);

  async function loadPlayers() {
    setLoading(true);
    setLoadError("");

    try {
      if (!teamId) {
        setLoadError("Nema team_id. Pričekaj da se učita tim ili provjeri tablicu teams.");
        setRows([]);
        setLoading(false);
        return;
      }

      const p_age_min = ageMin === "" ? null : Number(ageMin);
      const p_age_max = ageMax === "" ? null : Number(ageMax);

      const { data, error } = await supabase.rpc("list_team_players", {
        p_team_id: teamId,
        p_position: position || null,
        p_age_min,
        p_age_max,
        p_search: search || null,
      });

      if (error) {
        if (isAuthError(error)) {
          setLoadError(
            "Zaključano bez prijave. (Auth nije spojen u UI još). Kad spojimo login, ovo će se automatski otvoriti."
          );
          setRows([]);
          setLoading(false);
          return;
        }
        setLoadError(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      setLoadError(String(e?.message || e));
      setRows([]);
      setLoading(false);
    }
  }

  // auto-load kad dobijemo teamId (prvi put)
  useEffect(() => {
    if (!teamId) return;
    loadPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (!team) return null;

  const visibleKeys = Object.keys(columns).filter((k) => columns[k]);

  return (
    <div className="hr-pageWrap">
      <div className="hr-pageCard">
        <div className="hr-pageHeaderRow">
          <div>
            <h1 className="hr-pageTitle">Igrači</h1>
            <div className="hr-pageSub">Aktivni tim: {label}</div>
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

        {/* FILTERI */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search: ime, HT ID, pozicija..."
              style={{
                flex: "1",
                minWidth: 240,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
              }}
            />

            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                minWidth: 140,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.95)",
                outline: "none",
                fontWeight: 800,
              }}
            >
              <option value="">Pozicija (sve)</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="WB">WB</option>
              <option value="IM">IM</option>
              <option value="WING">WING</option>
              <option value="FWD">FWD</option>
            </select>

            <input
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              placeholder="Age min"
              inputMode="numeric"
              style={{
                width: 110,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
              }}
            />
            <input
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              placeholder="Age max"
              inputMode="numeric"
              style={{
                width: 110,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={loadPlayers}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.92)",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {loading ? "Učitavam..." : "Primijeni"}
            </button>

            <button
              type="button"
              onClick={() => setShowCols((v) => !v)}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.92)",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Kolone
            </button>
          </div>

          {/* COLUMN PICKER */}
          {showCols && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <div style={{ fontWeight: 1000, marginBottom: 8 }}>Odabir prikaza (sprema se po timu)</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {Object.keys(columns).map((k) => (
                  <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={!!columns[k]}
                      onChange={(e) => setColumns((prev) => ({ ...prev, [k]: e.target.checked }))}
                    />
                    <span style={{ fontWeight: 900 }}>{colLabel(k)}</span>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setColumns(DEFAULT_COLUMNS)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.92)",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Reset default
                </button>

                <button
                  type="button"
                  onClick={() => setShowCols(false)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.92)",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Zatvori
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}
        {loadError && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(220,38,38,0.06)",
              color: "rgba(127,29,29,0.95)",
              fontWeight: 900,
            }}
          >
            {loadError}
          </div>
        )}

        {/* TABLE */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 1000, marginBottom: 8 }}>Popis igrača ({rows.length})</div>

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              overflowX: "auto",
              background: "rgba(255,255,255,0.85)",
            }}
          >
            <div
              style={{
                minWidth: 980,
                display: "grid",
                gridTemplateColumns: `repeat(${visibleKeys.length + 1}, minmax(110px, 1fr))`,
                gap: 0,
                padding: "10px 12px",
                fontWeight: 900,
                background: "rgba(0,0,0,0.04)",
              }}
            >
              {visibleKeys.map((k) => (
                <div key={k}>{colLabel(k)}</div>
              ))}
              <div>Akcija</div>
            </div>

            {rows.length === 0 ? (
              <div style={{ padding: "12px", opacity: 0.7 }}>
                {loading ? "Učitavam..." : "Nema rezultata."}
              </div>
            ) : (
              rows.map((p) => (
                <div
                  key={p.id}
                  style={{
                    minWidth: 980,
                    display: "grid",
                    gridTemplateColumns: `repeat(${visibleKeys.length + 1}, minmax(110px, 1fr))`,
                    gap: 0,
                    padding: "10px 12px",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    alignItems: "center",
                    fontSize: 13,
                  }}
                >
                  {visibleKeys.map((k) => (
                    <div key={k} style={{ fontWeight: k === "full_name" ? 900 : 700 }}>
                      {p?.[k] ?? ""}
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link
                      className="hr-backBtn"
                      href={`/team/${team}/players/${p.id}`}
                      style={{ padding: "8px 10px" }}
                    >
                      Detalji
                    </Link>

                    {p?.ht_player_id ? (
                      <a
                        className="hr-backBtn"
                        href={`https://www.hattrick.org/Club/Players/Player.aspx?playerId=${p.ht_player_id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: "8px 10px" }}
                      >
                        HT →
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Napomena: “Detalji” je idući korak (16.3.4). Auth/CHPP nije spojen, pa DB može vratiti “Not authenticated”
            dok ne povežemo login.
          </div>
        </div>
      </div>
    </div>
  );
}
