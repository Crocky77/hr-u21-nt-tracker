import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "../../../components/AppLayout";
import TrackerSidebar from "../../../components/TrackerSidebar";
import * as supabaseModule from "../../../utils/supabaseClient";

const supabase =
  supabaseModule?.default ||
  supabaseModule?.supabase ||
  supabaseModule?.supabaseClient;

const SKILL_LEVELS = Array.from({ length: 21 }, (_, i) => i);

const DEFAULT_COLUMNS = {
  name: true,
  pos: true,
  age: true,
  htid: true,
  spec: true,
  tsi: true,
  fo: true,
  st: true,
  tr: true,
  de: true,
  pm: true,
  wg: true,
  ps: true,
  sc: true,
  sp: true,
  htms: true,
  htms28: true,
};

const COLUMN_LABELS = {
  name: "Ime",
  pos: "Poz",
  age: "Dob",
  htid: "HTID",
  spec: "Spec",
  tsi: "TSI",
  fo: "Forma",
  st: "Stamina",
  tr: "Trening",
  de: "DEF",
  pm: "PM",
  wg: "WING",
  ps: "PASS",
  sc: "SCOR",
  sp: "SP",
  htms: "HTMS",
  htms28: "HTMS28",
};

function formatSkillValue(value) {
  if (value === null || typeof value === "undefined") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  if (numeric === 0) return "non-existent";
  if (numeric > 20) return `20(+${numeric - 20})`;
  return numeric;
}

function getField(player, keys) {
  for (const key of keys) {
    if (player && typeof player[key] !== "undefined" && player[key] !== null) {
      return player[key];
    }
  }
  return null;
}

function normalizeTrait(value) {
  if (!value) return "";
  return String(value).toLowerCase();
}

function dedupePlayers(rows) {
  const map = new Map();
  const list = Array.isArray(rows) ? rows : [];
  list.forEach((row, index) => {
    const key =
      row?.id ??
      row?.player_id ??
      row?.ht_player_id ??
      row?.htid ??
      `${row?.full_name || row?.name || "player"}-${index}`;
    if (!map.has(key)) map.set(key, row);
  });
  return Array.from(map.values());
}

export default function PlayersPage() {
  const router = useRouter();
  const { team } = router.query;

  const [teamId, setTeamId] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [requestId, setRequestId] = useState("");
  const [requestLoading, setRequestLoading] = useState(true);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [positions, setPositions] = useState([]);

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  const [minSkills, setMinSkills] = useState({
    gk: "",
    de: "",
    pm: "",
    wg: "",
    ps: "",
    sc: "",
    sp: "",
    stam: "",
    lead: "",
    exp: "",
    tsi: "",
    htms: "",
    htms28: "",
  });

  const [traits, setTraits] = useState({
    specialty: "any",
    agree: "any",
    agg: "any",
    hon: "any",
  });

  const [dataFiltersOpen, setDataFiltersOpen] = useState(true);
  const [columnFiltersOpen, setColumnFiltersOpen] = useState(true);

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  useEffect(() => {
    if (!team) return;

    let mounted = true;

    async function resolveTeam() {
      setTeamLoading(true);
      setError("");

      try {
        const { data, error: teamError } = await supabase
          .from("teams")
          .select("id, slug")
          .eq("slug", team)
          .maybeSingle();

        if (teamError) throw teamError;
        if (mounted) setTeamId(data?.id || null);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod dohvaćanja tima.");
      } finally {
        if (mounted) setTeamLoading(false);
      }
    }

    resolveTeam();

    return () => {
      mounted = false;
    };
  }, [team]);

  useEffect(() => {
    if (!teamId) return;

    let mounted = true;

    async function loadRequests() {
      setRequestLoading(true);
      setError("");

      try {
        const { data, error: reqError } = await supabase
          .from("team_requests")
          .select("id, name, status, priority")
          .eq("team_id", teamId)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false });

        if (reqError) throw reqError;

        if (mounted) setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e?.message || "Greška kod učitavanja zahtjeva.");
      } finally {
        if (mounted) setRequestLoading(false);
      }
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [teamId]);

  useEffect(() => {
    if (!team) return;

    let mounted = true;

    async function loadPositions() {
      try {
        const tries = [
          { team_slug: team },
          { team_id: teamId },
          { p_team_slug: team },
          { p_team_id: teamId },
        ];

        for (const args of tries) {
          if (Object.values(args).every((v) => v === null || typeof v === "undefined")) {
            continue;
          }

          const { data, error: posError } = await supabase.rpc(
            "list_team_positions",
            args
          );

          if (posError) continue;
          if (mounted && Array.isArray(data)) {
            setPositions(data.filter(Boolean));
            return;
          }
        }
      } catch (e) {
        // ignore optional function
      }
    }

    loadPositions();

    return () => {
      mounted = false;
    };
  }, [team, teamId]);

  useEffect(() => {
    if (!team || !requestId) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadPlayers() {
      setLoading(true);
      setError("");

      const requestValue = Number(requestId);
      const requestArg = Number.isFinite(requestValue) ? requestValue : requestId;

      const tries = [
        { team_slug: team, request_id: requestArg },
        { team_id: teamId, request_id: requestArg },
        { p_team_slug: team, p_request_id: requestArg },
        { p_team_id: teamId, p_request_id: requestArg },
      ];

      let data = null;
      let lastError = null;

      for (const args of tries) {
        if (Object.values(args).every((v) => v === null || typeof v === "undefined")) {
          continue;
        }

        const res = await supabase.rpc("list_team_players", args);
        if (res?.error) {
          lastError = res.error;
          continue;
        }

        if (Array.isArray(res?.data)) {
          data = res.data;
          break;
        }
      }

      if (!data) {
        try {
          if (teamId) {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("team_players")
              .select("player_id, players ( * )")
              .eq("team_id", teamId);

            if (fallbackError) throw fallbackError;

            data = (fallbackData || []).map((row) => row.players || row.player);
          }
        } catch (e) {
          lastError = e;
        }
      }

      if (!mounted) return;

      if (!data) {
        setError(lastError?.message || "Greška kod dohvaćanja igrača.");
        setPlayers([]);
      } else {
        setPlayers(dedupePlayers(data));
      }

      setLoading(false);
    }

    loadPlayers();

    return () => {
      mounted = false;
    };
  }, [team, teamId, requestId]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (search) {
        const s = search.toLowerCase();
        const name = String(player.full_name || player.name || "").toLowerCase();
        const htId = String(player.ht_player_id || player.htid || "");
        if (!name.includes(s) && !htId.includes(s)) return false;
      }

      if (position) {
        const posValue = String(getField(player, ["position", "pos", "role"]) || "");
        if (posValue.toLowerCase() !== position.toLowerCase()) return false;
      }

      const ageYears = Number(getField(player, ["age_years", "age", "years"]) || 0);
      if (ageMin && ageYears < Number(ageMin)) return false;
      if (ageMax && ageYears > Number(ageMax)) return false;

      const minChecks = [
        ["gk", ["skill_gk", "gk", "goalkeeping"]],
        ["de", ["skill_defending", "skill_def", "defending", "def"]],
        ["pm", ["skill_playmaking", "skill_pm", "playmaking", "pm"]],
        ["wg", ["skill_winger", "skill_wing", "winger", "wing", "wg"]],
        ["ps", ["skill_passing", "skill_pass", "passing", "pass", "ps"]],
        ["sc", ["skill_scoring", "skill_scor", "scoring", "scor", "sc"]],
        ["sp", ["skill_set_pieces", "skill_sp", "set_pieces", "sp"]],
        ["stam", ["stamina", "skill_stamina"]],
        ["lead", ["leadership", "leader"]],
        ["exp", ["experience", "exp"]],
        ["tsi", ["tsi"]],
        ["htms", ["htms"]],
        ["htms28", ["htms28"]],
      ];

      for (const [key, fields] of minChecks) {
        if (!minSkills[key] && minSkills[key] !== 0) continue;
        const minVal = Number(minSkills[key]);
        if (!Number.isFinite(minVal)) continue;

        const currentVal = Number(getField(player, fields) || 0);
        if (currentVal < minVal) return false;
      }

      if (traits.specialty !== "any") {
        const spec = normalizeTrait(getField(player, ["speciality", "specialty", "spec"]));
        if (!spec || !spec.includes(traits.specialty.toLowerCase())) return false;
      }

      if (traits.agree !== "any") {
        const agree = normalizeTrait(getField(player, ["agreeability", "agree"]));
        if (!agree || !agree.includes(traits.agree)) return false;
      }

      if (traits.agg !== "any") {
        const agg = normalizeTrait(getField(player, ["aggressiveness", "agg"]));
        if (!agg || !agg.includes(traits.agg)) return false;
      }

      if (traits.hon !== "any") {
        const hon = normalizeTrait(getField(player, ["honesty", "hon"]));
        if (!hon || !hon.includes(traits.hon)) return false;
      }

      return true;
    });
  }, [
    players,
    search,
    position,
    ageMin,
    ageMax,
    minSkills,
    traits,
  ]);

  const tablePositions = useMemo(() => {
    if (positions.length > 0) return positions;
    const unique = new Set();
    players.forEach((player) => {
      const posValue = getField(player, ["position", "pos", "role"]);
      if (posValue) unique.add(String(posValue));
    });
    return Array.from(unique);
  }, [positions, players]);

  if (!team) return null;

  return (
    <AppLayout fullWidth>
      <div className="shell">
        <div className="sidebar">
          <TrackerSidebar />
        </div>

        <div className="main">
          <div className="header">
            <div>
              <h1>Igrači ({team.toUpperCase()})</h1>
              <div className="sub">
                Aktivni tim: {team} · Popis igrača ({filteredPlayers.length})
              </div>
            </div>
            <Link className="ghostBtn" href={`/team/${team}`}>← Natrag</Link>
          </div>

          <div className="card">
            <div className="cardTitle">Odabir zahtjeva</div>
            <div className="cardSub">
              Prvo odaberi zahtjev — prikazuju se samo igrači koji ga zadovoljavaju.
            </div>

            <div className="row">
              <select
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                disabled={requestLoading || teamLoading}
              >
                <option value="">Odaberi zahtjev…</option>
                {requests.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.name} ({req.status})
                  </option>
                ))}
              </select>

              <div className="hint">
                {requestLoading
                  ? "Učitavam zahtjeve…"
                  : requestId
                  ? "Zahtjev aktivan"
                  : "Bez zahtjeva nema igrača"}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Display data filter</div>
                <div className="cardSub">
                  Dodatni filteri rade nad već izlistanim igračima.
                </div>
              </div>
              <button
                className="ghostBtn"
                type="button"
                onClick={() => setDataFiltersOpen((v) => !v)}
              >
                {dataFiltersOpen ? "Sakrij" : "Prikaži"}
              </button>
            </div>

            {dataFiltersOpen ? (
              <>
                <div className="row">
                  <input
                    placeholder="Search: ime, HT ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="">Pozicija (sve)</option>
                    {tablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Age min"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                  />
                  <input
                    placeholder="Age max"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                  />
                </div>

                <div className="gridRow">
                  {[
                    ["GK", "gk"],
                    ["DEF", "de"],
                    ["PM", "pm"],
                    ["WING", "wg"],
                    ["PASS", "ps"],
                    ["SCOR", "sc"],
                    ["SP", "sp"],
                    ["STAM", "stam"],
                    ["LEAD", "lead"],
                    ["EXP", "exp"],
                    ["TSI", "tsi"],
                    ["HTMS", "htms"],
                    ["HTMS28", "htms28"],
                  ].map(([label, key]) => (
                    <label key={key} className="stacked">
                      <span>{label} ≥</span>
                      <select
                        value={minSkills[key]}
                        onChange={(e) =>
                          setMinSkills({ ...minSkills, [key]: e.target.value })
                        }
                      >
                        <option value="">—</option>
                        {SKILL_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level === 0 ? "non-existent" : level}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="row">
                  <select
                    value={traits.specialty}
                    onChange={(e) =>
                      setTraits({ ...traits, specialty: e.target.value })
                    }
                  >
                    <option value="any">Speciality (any)</option>
                    <option value="quick">Quick</option>
                    <option value="head">Head</option>
                    <option value="technical">Technical</option>
                    <option value="powerful">Powerful</option>
                    <option value="unpredictable">Unpredictable</option>
                    <option value="resilient">Resilient</option>
                  </select>

                  <select
                    value={traits.agree}
                    onChange={(e) => setTraits({ ...traits, agree: e.target.value })}
                  >
                    <option value="any">Agreeability</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={traits.agg}
                    onChange={(e) => setTraits({ ...traits, agg: e.target.value })}
                  >
                    <option value="any">Aggressiveness</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={traits.hon}
                    onChange={(e) => setTraits({ ...traits, hon: e.target.value })}
                  >
                    <option value="any">Honesty</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </>
            ) : null}
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Display column filter</div>
                <div className="cardSub">
                  Odaberi koje kolone želiš vidjeti u tablici.
                </div>
              </div>
              <button
                className="ghostBtn"
                type="button"
                onClick={() => setColumnFiltersOpen((v) => !v)}
              >
                {columnFiltersOpen ? "Sakrij" : "Prikaži"}
              </button>
            </div>

            {columnFiltersOpen ? (
              <div className="gridRow columns">
                {Object.keys(columns).map((key) => (
                  <label key={key} className="checkbox">
                    <input
                      type="checkbox"
                      checked={columns[key]}
                      onChange={() =>
                        setColumns({ ...columns, [key]: !columns[key] })
                      }
                    />
                    <span>{COLUMN_LABELS[key] || key.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="tableCard">
            <div className="tableHeader">
              <div className="cardTitle">Tablica igrača</div>
              <div className="cardSub">
                Klik na igrača otvara detalje (Portal-style).
              </div>
            </div>

            {error ? <div className="error">Greška: {error}</div> : null}

            {!requestId && (
              <div className="empty">Odaberi zahtjev kako bi se lista učitala.</div>
            )}

            {requestId && loading && <div className="empty">Učitavanje…</div>}

            {requestId && !loading && filteredPlayers.length === 0 && (
              <div className="empty">Nema igrača za ovaj zahtjev / filtere.</div>
            )}

            {requestId && !loading && filteredPlayers.length > 0 ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      {columns.name && <th>Ime</th>}
                      {columns.pos && <th>Poz</th>}
                      {columns.age && <th>Dob</th>}
                      {columns.htid && <th>HTID</th>}
                      {columns.spec && <th>Spec</th>}
                      {columns.tsi && <th>TSI</th>}
                      {columns.fo && <th>Fo</th>}
                      {columns.st && <th>St</th>}
                      {columns.tr && <th>TR</th>}
                      {columns.de && <th>DE</th>}
                      {columns.pm && <th>PM</th>}
                      {columns.wg && <th>WG</th>}
                      {columns.ps && <th>PS</th>}
                      {columns.sc && <th>SC</th>}
                      {columns.sp && <th>SP</th>}
                      {columns.htms && <th>HTMS</th>}
                      {columns.htms28 && <th>HTMS28</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => {
                      const playerId = player.id ?? player.player_id ?? player.ht_player_id;
                      const name = player.full_name || player.name || "—";
                      const ageYears = getField(player, ["age_years", "age", "years"]);
                      const ageDays = getField(player, ["age_days", "days"]);
                      const ageText =
                        typeof ageYears !== "undefined" && ageYears !== null
                          ? `${ageYears}${ageDays ? ` (${ageDays})` : ""}`
                          : "—";

                      return (
                        <tr key={playerId || name}>
                          {columns.name && (
                            <td>
                              {playerId ? (
                                <Link
                                  href={`/team/${team}/players/${playerId}`}
                                  className="playerLink"
                                >
                                  {name}
                                </Link>
                              ) : (
                                name
                              )}
                            </td>
                          )}
                          {columns.pos && (
                            <td>{getField(player, ["position", "pos", "role"]) || "—"}</td>
                          )}
                          {columns.age && <td>{ageText}</td>}
                          {columns.htid && (
                            <td>{getField(player, ["ht_player_id", "htid"]) || "—"}</td>
                          )}
                          {columns.spec && (
                            <td>{getField(player, ["speciality", "specialty", "spec"]) || "—"}</td>
                          )}
                          {columns.tsi && <td>{getField(player, ["tsi"]) || "—"}</td>}
                          {columns.fo && <td>{getField(player, ["form"]) || "—"}</td>}
                          {columns.st && (
                            <td>{formatSkillValue(getField(player, ["stamina"]))}</td>
                          )}
                          {columns.tr && (
                            <td>{getField(player, ["current_training", "training"]) || "—"}</td>
                          )}
                          {columns.de && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_defending", "skill_def", "defending", "def"])
                              )}
                            </td>
                          )}
                          {columns.pm && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_playmaking", "skill_pm", "playmaking", "pm"])
                              )}
                            </td>
                          )}
                          {columns.wg && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_winger", "skill_wing", "winger", "wing", "wg"])
                              )}
                            </td>
                          )}
                          {columns.ps && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_passing", "skill_pass", "passing", "pass", "ps"])
                              )}
                            </td>
                          )}
                          {columns.sc && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_scoring", "skill_scor", "scoring", "scor", "sc"])
                              )}
                            </td>
                          )}
                          {columns.sp && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_set_pieces", "skill_sp", "set_pieces", "sp"])
                              )}
                            </td>
                          )}
                          {columns.htms && <td>{getField(player, ["htms"]) || "—"}</td>}
                          {columns.htms28 && (
                            <td>{getField(player, ["htms28"]) || "—"}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: flex;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 12px 0;
        }
        .main {
          flex: 1;
          padding: 16px 18px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        h1 {
          margin: 0 0 4px 0;
        }
        .sub {
          opacity: 0.7;
        }
        .card,
        .tableCard {
          background: rgba(255, 255, 255, 0.85);
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
        }
        .tableCard {
          padding: 16px;
        }
        .cardTitle {
          font-weight: 900;
          font-size: 14px;
        }
        .cardSub {
          font-size: 12px;
          opacity: 0.65;
          margin-top: 4px;
        }
        .cardHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 10px;
        }
        .gridRow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .gridRow.columns {
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        }
        .stacked {
          display: grid;
          gap: 4px;
          font-size: 12px;
        }
        .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        input,
        select {
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.14);
          font-size: 13px;
          background: #fff;
        }
        .ghostBtn {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          text-decoration: none;
          font-weight: 700;
          background: #fff;
          color: #111;
        }
        .hint {
          font-size: 12px;
          opacity: 0.7;
        }
        .tableHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .tableWrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 900px;
        }
        th,
        td {
          padding: 8px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }
        th {
          background: rgba(0, 0, 0, 0.05);
          font-weight: 800;
        }
        .playerLink {
          color: #111;
          font-weight: 700;
          text-decoration: none;
        }
        .playerLink:hover {
          text-decoration: underline;
        }
        .empty {
          padding: 16px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.04);
          font-size: 13px;
          margin-top: 10px;
        }
        .error {
          margin-top: 10px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.2);
          font-size: 13px;
        }
      `}</style>
    </AppLayout>
  );
}
