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
const DAYS_IN_YEAR = 112;

const SKILL_LEVEL_LABELS = [
  "nikakav",
  "katastrofalan",
  "očajan",
  "loš",
  "slab",
  "nedovoljan",
  "prolazan",
  "dobar",
  "odličan",
  "impresivan",
  "izvanredan",
  "sjajan",
  "veličanstven",
  "svjetski",
  "natprirodan",
  "titanski",
  "izvanzemaljski",
  "mitski",
  "čaroban",
  "utopijski",
  "božanski",
];

const DEFAULT_COLUMNS = {
  playingIn: true,
  owningTeam: true,
  manager: true,
  name: true,
  pos: true,
  age: true,
  htid: true,
  salary: true,
  tsi: true,
  spec: true,
  agree: true,
  agg: true,
  hon: true,
  fo: true,
  st: true,
  gk: true,
  de: true,
  pm: true,
  wg: true,
  ps: true,
  sc: true,
  sp: true,
  exp: true,
  lead: true,
  abilityHtms: true,
  potentialHtms: true,
  talent: true,
  lastMatch: true,
  position: true,
  time: true,
  rating: true,
  tr: true,
  lastTraining: true,
  staminaPart: true,
  lastStaminaPart: true,
  trainerSkill: true,
  trainerLeadership: true,
  assistantCoach: true,
  formCoach: true,
  medic: true,
  lastMatchWcCc: true,
  updated: true,
  updatedSkills: true,
  updatedSubskills: true,
  lastScoutNote: true,
  htms: true,
  htms28: true,
};

const COLUMN_LABELS = {
  playingIn: "Igra u",
  owningTeam: "Klub",
  manager: "Manager",
  name: "Ime",
  pos: "Poz",
  age: "Dob",
  htid: "HTID",
  salary: "Plaća",
  tsi: "TSI",
  spec: "Specijalnost",
  agree: "Suglasnost",
  agg: "Agresivnost",
  hon: "Poštenje",
  fo: "Forma",
  st: "Stamina",
  gk: "GK",
  de: "Obrana",
  pm: "Kreiranje",
  wg: "Krilo",
  ps: "Dodavanje",
  sc: "Napad",
  sp: "Prekidi",
  exp: "Iskustvo",
  lead: "Vodstvo",
  abilityHtms: "Ability HTMS",
  potentialHtms: "Potential HTMS",
  talent: "Talent",
  lastMatch: "Zadnja utakmica",
  position: "Pozicija",
  time: "Vrijeme",
  rating: "Ocjena",
  tr: "Trening",
  lastTraining: "Zadnji trening",
  staminaPart: "Stamina part",
  lastStaminaPart: "Zadnja stamina part",
  trainerSkill: "Trenerska vještina",
  trainerLeadership: "Trenersko vodstvo",
  assistantCoach: "Pomoćni trener lvl",
  formCoach: "Forma coach lvl",
  medic: "Medic lvl",
  lastMatchWcCc: "Zadnja utakmica WC/CC",
  updated: "Ažurirano",
  updatedSkills: "Ažurirani skillovi",
  updatedSubskills: "Ažurirani subskillovi",
  lastScoutNote: "Zadnja bilješka skauta",
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
  const [ageMinYears, setAgeMinYears] = useState("17");
  const [ageMinDays, setAgeMinDays] = useState("0");
  const [ageMaxYears, setAgeMaxYears] = useState("99");
  const [ageMaxDays, setAgeMaxDays] = useState("111");

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
    coach: "",
    tsi: "",
    htms: "",
    htms28: "",
  });

  const [htmsInputs, setHtmsInputs] = useState({
    tsi: "",
    abilityHtms: "",
    potentialHtms: "",
  });

  const [traits, setTraits] = useState({
    specialty: "any",
    agree: "any",
    agg: "any",
    hon: "any",
  });

  const [dataFiltersOpen, setDataFiltersOpen] = useState(false);
  const [columnFiltersOpen, setColumnFiltersOpen] = useState(false);

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
      const ageDays = Number(getField(player, ["age_days", "days"]) || 0);
      const playerAge = ageYears * DAYS_IN_YEAR + ageDays;
      const minAge =
        Number(ageMinYears || 0) * DAYS_IN_YEAR + Number(ageMinDays || 0);
      const maxAge =
        Number(ageMaxYears || 99) * DAYS_IN_YEAR + Number(ageMaxDays || 111);
      if (playerAge < minAge) return false;
      if (playerAge > maxAge) return false;

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
        ["coach", ["coach_skill", "trainer_skill", "trainerSkill"]],
      ];

      for (const [key, fields] of minChecks) {
        if (minSkills[key] === "") continue;
        const minVal = Number(minSkills[key]);
        if (!Number.isFinite(minVal)) continue;

        const currentVal = Number(getField(player, fields) || 0);
        if (currentVal < minVal) return false;
      }

      if (htmsInputs.tsi) {
        const tsi = Number(getField(player, ["tsi"]) || 0);
        if (tsi < Number(htmsInputs.tsi)) return false;
      }

      if (htmsInputs.abilityHtms) {
        const ability = Number(getField(player, ["ability_htms", "abilityHtms", "htms"]) || 0);
        if (ability < Number(htmsInputs.abilityHtms)) return false;
      }

      if (htmsInputs.potentialHtms) {
        const potential = Number(
          getField(player, ["potential_htms", "potentialHtms", "htms28"]) || 0
        );
        if (potential < Number(htmsInputs.potentialHtms)) return false;
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
    ageMinYears,
    ageMinDays,
    ageMaxYears,
    ageMaxDays,
    minSkills,
    htmsInputs,
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
                <div className="cardTitle">Filter podataka</div>
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
                    placeholder="Pretraga: ime, HT ID…"
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
                </div>

                <div className="row">
                  <div className="ageGroup">
                    <span>Najmanje</span>
                    <select
                      value={ageMinYears}
                      onChange={(e) => setAgeMinYears(e.target.value)}
                    >
                      {Array.from({ length: 83 }, (_, i) => i + 17).map((year) => (
                        <option key={year} value={year}>
                          {year} god
                        </option>
                      ))}
                    </select>
                    <select
                      value={ageMinDays}
                      onChange={(e) => setAgeMinDays(e.target.value)}
                    >
                      {Array.from({ length: 112 }, (_, i) => i).map((day) => (
                        <option key={day} value={day}>
                          {day} dana
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ageGroup">
                    <span>Najviše</span>
                    <select
                      value={ageMaxYears}
                      onChange={(e) => setAgeMaxYears(e.target.value)}
                    >
                      {Array.from({ length: 83 }, (_, i) => i + 17).map((year) => (
                        <option key={year} value={year}>
                          {year} god
                        </option>
                      ))}
                    </select>
                    <select
                      value={ageMaxDays}
                      onChange={(e) => setAgeMaxDays(e.target.value)}
                    >
                      {Array.from({ length: 112 }, (_, i) => i).map((day) => (
                        <option key={day} value={day}>
                          {day} dana
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="gridRow">
                  {[
                    ["Na golu", "gk"],
                    ["Obrana", "de"],
                    ["Kreiranje", "pm"],
                    ["Na krilu", "wg"],
                    ["Dodavanje", "ps"],
                    ["U napadu", "sc"],
                    ["Prekidi", "sp"],
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
                            {SKILL_LEVEL_LABELS[level]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="gridRow">
                  <label className="stacked">
                    <span>Izdržljivost ≥</span>
                    <select
                      value={minSkills.stam}
                      onChange={(e) =>
                        setMinSkills({ ...minSkills, stam: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {Array.from({ length: 10 }, (_, i) => i).map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Iskustvo ≥</span>
                    <select
                      value={minSkills.exp}
                      onChange={(e) =>
                        setMinSkills({ ...minSkills, exp: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {SKILL_LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Vodstvo ≥</span>
                    <select
                      value={minSkills.lead}
                      onChange={(e) =>
                        setMinSkills({ ...minSkills, lead: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {Array.from({ length: 8 }, (_, i) => i).map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Trenerska vještina ≥</span>
                    <select
                      value={minSkills.coach}
                      onChange={(e) =>
                        setMinSkills({ ...minSkills, coach: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {Array.from({ length: 9 }, (_, i) => i).map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="gridRow">
                  <label className="stacked">
                    <span>TSI ≥</span>
                    <input
                      value={htmsInputs.tsi}
                      onChange={(e) =>
                        setHtmsInputs({ ...htmsInputs, tsi: e.target.value })
                      }
                      placeholder="0"
                    />
                  </label>
                  <label className="stacked">
                    <span>Ability HTMS ≥</span>
                    <input
                      value={htmsInputs.abilityHtms}
                      onChange={(e) =>
                        setHtmsInputs({
                          ...htmsInputs,
                          abilityHtms: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </label>
                  <label className="stacked">
                    <span>Potential HTMS ≥</span>
                    <input
                      value={htmsInputs.potentialHtms}
                      onChange={(e) =>
                        setHtmsInputs({
                          ...htmsInputs,
                          potentialHtms: e.target.value,
                        })
                      }
                      placeholder="2000"
                    />
                  </label>
                </div>

                <div className="row">
                  <select
                    value={traits.specialty}
                    onChange={(e) =>
                      setTraits({ ...traits, specialty: e.target.value })
                    }
                  >
                    <option value="any">Specijalnost (sve)</option>
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
                    <option value="any">Suglasnost</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={traits.agg}
                    onChange={(e) => setTraits({ ...traits, agg: e.target.value })}
                  >
                    <option value="any">Agresivnost</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>

                  <select
                    value={traits.hon}
                    onChange={(e) => setTraits({ ...traits, hon: e.target.value })}
                  >
                    <option value="any">Poštenje</option>
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
                <div className="cardTitle">Filter kolona</div>
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
                      {columns.playingIn && <th>Igra u</th>}
                      {columns.owningTeam && <th>Klub</th>}
                      {columns.manager && <th>Manager</th>}
                      {columns.name && <th>Ime</th>}
                      {columns.pos && <th>Poz</th>}
                      {columns.age && <th>Dob</th>}
                      {columns.htid && <th>HTID</th>}
                      {columns.salary && <th>Plaća</th>}
                      {columns.tsi && <th>TSI</th>}
                      {columns.spec && <th>Spec</th>}
                      {columns.agree && <th>Suglasnost</th>}
                      {columns.agg && <th>Agresivnost</th>}
                      {columns.hon && <th>Poštenje</th>}
                      {columns.fo && <th>Forma</th>}
                      {columns.st && <th>Stamina</th>}
                      {columns.gk && <th>GK</th>}
                      {columns.de && <th>Obrana</th>}
                      {columns.pm && <th>Kreiranje</th>}
                      {columns.wg && <th>Krilo</th>}
                      {columns.ps && <th>Dodavanje</th>}
                      {columns.sc && <th>Napad</th>}
                      {columns.sp && <th>Prekidi</th>}
                      {columns.exp && <th>Iskustvo</th>}
                      {columns.lead && <th>Vodstvo</th>}
                      {columns.abilityHtms && <th>Ability HTMS</th>}
                      {columns.potentialHtms && <th>Potential HTMS</th>}
                      {columns.talent && <th>Talent</th>}
                      {columns.lastMatch && <th>Zadnja utakmica</th>}
                      {columns.position && <th>Pozicija</th>}
                      {columns.time && <th>Vrijeme</th>}
                      {columns.rating && <th>Ocjena</th>}
                      {columns.tr && <th>Trening</th>}
                      {columns.lastTraining && <th>Zadnji trening</th>}
                      {columns.staminaPart && <th>Stamina part</th>}
                      {columns.lastStaminaPart && <th>Zadnja stamina part</th>}
                      {columns.trainerSkill && <th>Trenerska vještina</th>}
                      {columns.trainerLeadership && <th>Trenersko vodstvo</th>}
                      {columns.assistantCoach && <th>Pomoćni trener lvl</th>}
                      {columns.formCoach && <th>Forma coach lvl</th>}
                      {columns.medic && <th>Medic lvl</th>}
                      {columns.lastMatchWcCc && <th>Zadnja utakmica WC/CC</th>}
                      {columns.updated && <th>Ažurirano</th>}
                      {columns.updatedSkills && <th>Ažurirani skillovi</th>}
                      {columns.updatedSubskills && <th>Ažurirani subskillovi</th>}
                      {columns.lastScoutNote && <th>Zadnja bilješka skauta</th>}
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
                          {columns.playingIn && (
                            <td>{getField(player, ["playing_in", "playingIn"]) || "—"}</td>
                          )}
                          {columns.owningTeam && (
                            <td>{getField(player, ["owning_team", "owningTeam", "club_name"]) || "—"}</td>
                          )}
                          {columns.manager && (
                            <td>{getField(player, ["manager", "manager_name"]) || "—"}</td>
                          )}
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
                          {columns.salary && (
                            <td>{getField(player, ["salary", "wage"]) || "—"}</td>
                          )}
                          {columns.spec && (
                            <td>{getField(player, ["speciality", "specialty", "spec"]) || "—"}</td>
                          )}
                          {columns.agree && (
                            <td>{getField(player, ["agreeability", "agree"]) || "—"}</td>
                          )}
                          {columns.agg && (
                            <td>{getField(player, ["aggressiveness", "agg"]) || "—"}</td>
                          )}
                          {columns.hon && (
                            <td>{getField(player, ["honesty", "hon"]) || "—"}</td>
                          )}
                          {columns.tsi && <td>{getField(player, ["tsi"]) || "—"}</td>}
                          {columns.fo && <td>{getField(player, ["form"]) || "—"}</td>}
                          {columns.st && (
                            <td>{formatSkillValue(getField(player, ["stamina"]))}</td>
                          )}
                          {columns.gk && (
                            <td>
                              {formatSkillValue(
                                getField(player, ["skill_gk", "gk", "goalkeeping"])
                              )}
                            </td>
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
                          {columns.exp && (
                            <td>{formatSkillValue(getField(player, ["experience", "exp"]))}</td>
                          )}
                          {columns.lead && (
                            <td>{formatSkillValue(getField(player, ["leadership", "leader"]))}</td>
                          )}
                          {columns.abilityHtms && (
                            <td>{getField(player, ["ability_htms", "abilityHtms"]) || "—"}</td>
                          )}
                          {columns.potentialHtms && (
                            <td>{getField(player, ["potential_htms", "potentialHtms"]) || "—"}</td>
                          )}
                          {columns.talent && (
                            <td>{getField(player, ["talent"]) || "—"}</td>
                          )}
                          {columns.lastMatch && (
                            <td>{getField(player, ["last_match", "lastMatch"]) || "—"}</td>
                          )}
                          {columns.position && (
                            <td>{getField(player, ["position", "pos", "role"]) || "—"}</td>
                          )}
                          {columns.time && (
                            <td>{getField(player, ["time", "played_time"]) || "—"}</td>
                          )}
                          {columns.rating && (
                            <td>{getField(player, ["rating", "match_rating"]) || "—"}</td>
                          )}
                          {columns.lastTraining && (
                            <td>{getField(player, ["last_training", "lastTraining"]) || "—"}</td>
                          )}
                          {columns.staminaPart && (
                            <td>{getField(player, ["stamina_part", "staminaPart"]) || "—"}</td>
                          )}
                          {columns.lastStaminaPart && (
                            <td>{getField(player, ["last_stamina_part", "lastStaminaPart"]) || "—"}</td>
                          )}
                          {columns.trainerSkill && (
                            <td>{getField(player, ["trainer_skill", "trainerSkill"]) || "—"}</td>
                          )}
                          {columns.trainerLeadership && (
                            <td>{getField(player, ["trainer_leadership", "trainerLeadership"]) || "—"}</td>
                          )}
                          {columns.assistantCoach && (
                            <td>{getField(player, ["assistant_coach_level", "assistantCoachLevel"]) || "—"}</td>
                          )}
                          {columns.formCoach && (
                            <td>{getField(player, ["form_coach_level", "formCoachLevel"]) || "—"}</td>
                          )}
                          {columns.medic && (
                            <td>{getField(player, ["medic_level", "medicLevel"]) || "—"}</td>
                          )}
                          {columns.lastMatchWcCc && (
                            <td>{getField(player, ["last_match_wc_cc", "lastMatchWcCc"]) || "—"}</td>
                          )}
                          {columns.updated && (
                            <td>{getField(player, ["updated", "updated_at"]) || "—"}</td>
                          )}
                          {columns.updatedSkills && (
                            <td>{getField(player, ["updated_skills", "updatedSkills"]) || "—"}</td>
                          )}
                          {columns.updatedSubskills && (
                            <td>{getField(player, ["updated_subskills", "updatedSubskills"]) || "—"}</td>
                          )}
                          {columns.lastScoutNote && (
                            <td>{getField(player, ["last_scout_note", "lastScoutNote"]) || "—"}</td>
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
          width: 100%;
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
        .ageGroup {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
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
          min-width: 1400px;
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
