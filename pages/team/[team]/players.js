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

const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS).reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {});

const TRAIT_LABELS = {
  agree: [
    "Opak tip",
    "Svadljiv čovjek",
    "Drag momak",
    "Simpatičan momak",
    "Popularan tip",
    "Obožavani član momčadi",
  ],
  hon: [
    "Na zlu glasu",
    "Nepošten",
    "Pošten",
    "Čestit",
    "Pravedan",
    "Kao svetac",
  ],
  agg: [
    "Miran",
    "Priseban",
    "Uravnotežen",
    "Nagao",
    "Vatren",
    "Nestabilan",
  ],
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
  if (value === null || typeof value === "undefined") return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const TRAIT_KEYWORDS = {
  agree: ["opak", "svadljiv", "drag", "simpatican", "popularan", "obozavani"],
  hon: ["na zlu glasu", "neposten", "posten", "cestit", "pravedan", "kao svetac"],
  agg: ["miran", "priseban", "uravnotezen", "nagao", "vatren", "nestabilan"],
};

function resolveTraitValue(raw, type) {
  if (raw === null || typeof raw === "undefined") return null;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return numeric;
  const normalized = normalizeTrait(raw);
  if (!normalized) return null;
  const labels = TRAIT_LABELS[type] || [];
  const normalizedLabels = labels.map((label) => normalizeTrait(label));
  let idx = normalizedLabels.findIndex((label) => label === normalized);
  if (idx >= 0) return idx;
  idx = normalizedLabels.findIndex(
    (label) => label && (normalized.includes(label) || label.includes(normalized))
  );
  if (idx >= 0) return idx;
  const keywords = TRAIT_KEYWORDS[type] || [];
  idx = keywords.findIndex((keyword) =>
    normalized.includes(normalizeTrait(keyword))
  );
  return idx >= 0 ? idx : null;
}

function formatTraitLabel(raw, type) {
  if (raw === null || typeof raw === "undefined" || raw === "") return "—";
  const idx = resolveTraitValue(raw, type);
  if (idx === null) return raw;
  return TRAIT_LABELS[type]?.[idx] || raw;
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
    exp: "",
    lead: "",
    stam: "",
    coach: "",
  });

  const [htmsInputs, setHtmsInputs] = useState({
    tsi: "",
    abilityHtms: "",
    potentialHtms: "2000",
  });

  const [traits, setTraits] = useState({
    specialty: "any",
    agree: "any",
    agg: "any",
    hon: "any",
  });

  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [dataFiltersOpen, setDataFiltersOpen] = useState(true);
  const [columnFiltersOpen, setColumnFiltersOpen] = useState(true);

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
    if (!team && !teamId) return;

    let mounted = true;

    async function loadRequests() {
      setRequestLoading(true);
      setError("");

      try {
        const tries = [
          { p_team_id: teamId },
          { team_id: teamId },
          { p_team_slug: team },
          { team_slug: team },
        ];

        let data = null;
        let lastError = null;

        for (const args of tries) {
          if (Object.values(args).every((v) => v === null || typeof v === "undefined")) {
            continue;
          }

          const res = await supabase.rpc("list_team_requirements", args);
          if (res?.error) {
            lastError = res.error;
            continue;
          }

          if (Array.isArray(res?.data)) {
            data = res.data;
            break;
          }
        }

        if (!data && lastError) throw lastError;

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
  }, [team, teamId]);

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
        const agreeValue = resolveTraitValue(
          getField(player, ["agreeability", "agree"]),
          "agree"
        );
        if (agreeValue === null || agreeValue !== Number(traits.agree)) return false;
      }

      if (traits.agg !== "any") {
        const aggValue = resolveTraitValue(
          getField(player, ["aggressiveness", "agg"]),
          "agg"
        );
        if (aggValue === null || aggValue !== Number(traits.agg)) return false;
      }

      if (traits.hon !== "any") {
        const honValue = resolveTraitValue(
          getField(player, ["honesty", "hon"]),
          "hon"
        );
        if (honValue === null || honValue !== Number(traits.hon)) return false;
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
                    {req.name}
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
                  <div className="rowTitle">Najmanje</div>
                  <select
                    value={ageMinYears}
                    onChange={(e) => setAgeMinYears(e.target.value)}
                  >
                    {Array.from({ length: 83 }, (_, i) => i + 17).map((y) => (
                      <option key={y} value={y}>
                        {y} god
                      </option>
                    ))}
                  </select>
                  <select
                    value={ageMinDays}
                    onChange={(e) => setAgeMinDays(e.target.value)}
                  >
                    {Array.from({ length: 112 }, (_, i) => i).map((d) => (
                      <option key={d} value={d}>
                        {d} dana
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Najviše</div>
                  <select
                    value={ageMaxYears}
                    onChange={(e) => setAgeMaxYears(e.target.value)}
                  >
                    {Array.from({ length: 83 }, (_, i) => i + 17).map((y) => (
                      <option key={y} value={y}>
                        {y} god
                      </option>
                    ))}
                  </select>
                  <select
                    value={ageMaxDays}
                    onChange={(e) => setAgeMaxDays(e.target.value)}
                  >
                    {Array.from({ length: 112 }, (_, i) => i).map((d) => (
                      <option key={d} value={d}>
                        {d} dana
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="rowTitle">Na golu ≥</div>
                  <select
                    value={minSkills.gk}
                    onChange={(e) => setMinSkills((p) => ({ ...p, gk: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Obrana ≥</div>
                  <select
                    value={minSkills.de}
                    onChange={(e) => setMinSkills((p) => ({ ...p, de: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Kreiranje ≥</div>
                  <select
                    value={minSkills.pm}
                    onChange={(e) => setMinSkills((p) => ({ ...p, pm: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Na krilu ≥</div>
                  <select
                    value={minSkills.wg}
                    onChange={(e) => setMinSkills((p) => ({ ...p, wg: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Dodavanje ≥</div>
                  <select
                    value={minSkills.ps}
                    onChange={(e) => setMinSkills((p) => ({ ...p, ps: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">U napadu ≥</div>
                  <select
                    value={minSkills.sc}
                    onChange={(e) => setMinSkills((p) => ({ ...p, sc: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Prekidi ≥</div>
                  <select
                    value={minSkills.sp}
                    onChange={(e) => setMinSkills((p) => ({ ...p, sp: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="rowTitle">Izdržljivost ≥</div>
                  <select
                    value={minSkills.stam}
                    onChange={(e) => setMinSkills((p) => ({ ...p, stam: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Iskustvo ≥</div>
                  <select
                    value={minSkills.exp}
                    onChange={(e) => setMinSkills((p) => ({ ...p, exp: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Vodstvo ≥</div>
                  <select
                    value={minSkills.lead}
                    onChange={(e) => setMinSkills((p) => ({ ...p, lead: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>

                  <div className="rowTitle">Trenerska vještina ≥</div>
                  <select
                    value={minSkills.coach}
                    onChange={(e) => setMinSkills((p) => ({ ...p, coach: e.target.value }))}
                  >
                    <option value="">—</option>
                    {SKILL_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {SKILL_LEVEL_LABELS[lvl]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="rowTitle">TSI ≥</div>
                  <input
                    value={htmsInputs.tsi}
                    onChange={(e) => setHtmsInputs((p) => ({ ...p, tsi: e.target.value }))}
                  />

                  <div className="rowTitle">Ability HTMS ≥</div>
                  <input
                    value={htmsInputs.abilityHtms}
                    onChange={(e) =>
                      setHtmsInputs((p) => ({ ...p, abilityHtms: e.target.value }))
                    }
                  />

                  <div className="rowTitle">Potential HTMS ≥</div>
                  <input
                    value={htmsInputs.potentialHtms}
                    onChange={(e) =>
                      setHtmsInputs((p) => ({ ...p, potentialHtms: e.target.value }))
                    }
                  />
                </div>

                <div className="row">
                  <select
                    value={traits.specialty}
                    onChange={(e) => setTraits((p) => ({ ...p, specialty: e.target.value }))}
                  >
                    <option value="any">Specijalnost (sve)</option>
                    <option value="Technical">Technical</option>
                    <option value="Quick">Quick</option>
                    <option value="Powerful">Powerful</option>
                    <option value="Unpredictable">Unpredictable</option>
                    <option value="Head">Head</option>
                    <option value="Resilient">Resilient</option>
                  </select>

                  <select
                    value={traits.agree}
                    onChange={(e) => setTraits((p) => ({ ...p, agree: e.target.value }))}
                  >
                    <option value="any">Suglasnost (sve)</option>
                    <option value="0">Opak tip</option>
                    <option value="1">Svadljiv čovjek</option>
                    <option value="2">Drag momak</option>
                    <option value="3">Simpatičan momak</option>
                    <option value="4">Popularan tip</option>
                    <option value="5">Obožavani član momčadi</option>
                  </select>

                  <select
                    value={traits.agg}
                    onChange={(e) => setTraits((p) => ({ ...p, agg: e.target.value }))}
                  >
                    <option value="any">Agresivnost (sve)</option>
                    <option value="0">Miran</option>
                    <option value="1">Priseban</option>
                    <option value="2">Uravnotežen</option>
                    <option value="3">Nagao</option>
                    <option value="4">Vatren</option>
                    <option value="5">Nestabilan</option>
                  </select>

                  <select
                    value={traits.hon}
                    onChange={(e) => setTraits((p) => ({ ...p, hon: e.target.value }))}
                  >
                    <option value="any">Poštenje (sve)</option>
                    <option value="0">Na zlu glasu</option>
                    <option value="1">Nepošten</option>
                    <option value="2">Pošten</option>
                    <option value="3">Čestit</option>
                    <option value="4">Pravedan</option>
                    <option value="5">Kao svetac</option>
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
              <div className="columnsGrid">
                {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={columns[key] || false}
                      onChange={(e) =>
                        setColumns((p) => ({ ...p, [key]: e.target.checked }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="card">
            <div className="cardHeader">
              <div className="cardTitle">Tablica igrača</div>
              <div className="cardSub">
                Klik na igrača otvara detalje (Portal-style).
              </div>
            </div>

            {error ? <div className="error">{error}</div> : null}

            {!requestId && (
              <div className="empty">Odaberi zahtjev kako bi se lista učitala.</div>
            )}

            {requestId && loading && <div className="empty">Učitavanje…</div>}

            {requestId && !loading && filteredPlayers.length === 0 && (
              <div className="empty">Nema igrača koji odgovaraju zahtjevu.</div>
            )}

            {requestId && !loading && filteredPlayers.length > 0 ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ime</th>
                      <th>Dob</th>
                      <th>Poz</th>
                      {Object.entries(COLUMN_LABELS).map(([key]) =>
                        columns[key] ? <th key={key}>{COLUMN_LABELS[key]}</th> : null
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.id || player.ht_player_id}>
                        <td>{player.full_name || player.name}</td>
                        <td>
                          {getField(player, ["age_years", "age", "years"])}y{" "}
                          {getField(player, ["age_days", "days"])}d
                        </td>
                        <td>{getField(player, ["position", "pos", "role"]) || "—"}</td>
                        {Object.entries(COLUMN_LABELS).map(([key]) =>
                          columns[key] ? (
                            <td key={key}>
                              {key === "spec"
                                ? getField(player, ["speciality", "specialty", "spec"]) ||
                                  "—"
                                : key === "agree"
                                ? formatTraitLabel(
                                    getField(player, ["agreeability", "agree"]),
                                    "agree"
                                  )
                                : key === "agg"
                                ? formatTraitLabel(
                                    getField(player, ["aggressiveness", "agg"]),
                                    "agg"
                                  )
                                : key === "hon"
                                ? formatTraitLabel(
                                    getField(player, ["honesty", "hon"]),
                                    "hon"
                                  )
                                : key === "gk"
                                ? formatSkillValue(
                                    getField(player, ["skill_gk", "gk", "goalkeeping"])
                                  )
                                : key === "de"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_defending",
                                      "skill_def",
                                      "defending",
                                      "def",
                                    ])
                                  )
                                : key === "pm"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_playmaking",
                                      "skill_pm",
                                      "playmaking",
                                      "pm",
                                    ])
                                  )
                                : key === "wg"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_winger",
                                      "skill_wing",
                                      "winger",
                                      "wing",
                                      "wg",
                                    ])
                                  )
                                : key === "ps"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_passing",
                                      "skill_pass",
                                      "passing",
                                      "pass",
                                      "ps",
                                    ])
                                  )
                                : key === "sc"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_scoring",
                                      "skill_scor",
                                      "scoring",
                                      "scor",
                                      "sc",
                                    ])
                                  )
                                : key === "sp"
                                ? formatSkillValue(
                                    getField(player, [
                                      "skill_set_pieces",
                                      "skill_sp",
                                      "set_pieces",
                                      "sp",
                                    ])
                                  )
                                : key === "st"
                                ? formatSkillValue(
                                    getField(player, ["stamina", "skill_stamina"])
                                  )
                                : key === "abilityHtms"
                                ? getField(player, ["ability_htms", "abilityHtms", "htms"]) ||
                                  "—"
                                : key === "potentialHtms"
                                ? getField(player, [
                                    "potential_htms",
                                    "potentialHtms",
                                    "htms28",
                                  ]) || "—"
                                : getField(player, [key]) || "—"}
                            </td>
                          ) : null
                        )}
                      </tr>
                    ))}
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
          width: 100%;
          min-height: calc(100vh - 60px);
        }
        .sidebar {
          padding: 14px 0 18px 0;
        }
        .main {
          flex: 1;
          padding: 14px 18px 24px 18px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .sub {
          font-size: 13px;
          opacity: 0.7;
        }
        .ghostBtn {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          padding: 6px 10px;
          font-weight: 600;
          background: transparent;
          cursor: pointer;
        }
        .card {
          background: #fff;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          margin-bottom: 14px;
        }
        .cardTitle {
          font-weight: 800;
          margin-bottom: 4px;
        }
        .cardSub {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 8px;
        }
        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .rowTitle {
          font-size: 12px;
          font-weight: 700;
          margin-right: 6px;
        }
        select,
        input {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 10px;
          padding: 6px 8px;
        }
        .hint {
          font-size: 12px;
          opacity: 0.7;
        }
        .columnsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 6px;
        }
        .columnsGrid label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .tableWrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th,
        td {
          padding: 8px 6px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          text-align: left;
          white-space: nowrap;
        }
        .empty {
          padding: 12px;
          font-size: 13px;
          opacity: 0.7;
        }
        .error {
          padding: 12px;
          border-radius: 8px;
          background: rgba(220, 38, 38, 0.08);
          color: rgb(220, 38, 38);
          font-weight: 700;
          margin-bottom: 8px;
        }
      `}</style>
    </AppLayout>
  );
}
