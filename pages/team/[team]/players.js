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
  age: "Dob",
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
};

const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS).reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {});

const DEFAULT_VISIBLE_COLUMNS = {
  age: true,
  salary: true,
  tsi: true,
  spec: true,
  agree: true,
  agg: true,
  hon: true,
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
  position: true,
};

const COLUMN_FILTER_KEYS = [
  "playingIn",
  "owningTeam",
  "manager",
  "age",
  "salary",
  "tsi",
  "spec",
  "agree",
  "agg",
  "hon",
  "fo",
  "st",
  "gk",
  "de",
  "pm",
  "wg",
  "ps",
  "sc",
  "sp",
  "exp",
  "lead",
  "abilityHtms",
  "potentialHtms",
  "talent",
  "lastMatch",
  "position",
  "time",
  "rating",
  "tr",
  "lastTraining",
  "staminaPart",
  "lastStaminaPart",
  "trainerSkill",
  "trainerLeadership",
  "assistantCoach",
  "formCoach",
  "medic",
  "lastMatchWcCc",
  "updated",
  "updatedSkills",
  "updatedSubskills",
  "lastScoutNote",
];

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
  agg: ["Miran", "Priseban", "Uravnotežen", "Nagao", "Vatren", "Nestabilan"],
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

function dedupePlayers(rows) {
  const map = new Map();
  rows.forEach((row, index) => {
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
  const [requestId, setRequestId] = useState("all");
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

  const [filtersApplied, setFiltersApplied] = useState({
    search: "",
    position: "",
    ageMinYears: "17",
    ageMinDays: "0",
    ageMaxYears: "99",
    ageMaxDays: "111",
    minSkills: {
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
    },
    htmsInputs: {
      tsi: "",
      abilityHtms: "",
      potentialHtms: "",
    },
    traits: {
      specialty: "any",
      agree: "any",
      agg: "any",
      hon: "any",
    },
  });

  const [columnsDraft, setColumnsDraft] = useState({
    ...DEFAULT_COLUMNS,
    ...DEFAULT_VISIBLE_COLUMNS,
  });
  const [columnsApplied, setColumnsApplied] = useState({
    ...DEFAULT_COLUMNS,
    ...DEFAULT_VISIBLE_COLUMNS,
  });

  // **Novo stanje za pravila zahtjeva**
  const [rules, setRules] = useState([]);

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

  // **Učitavanje pravila za odabrani zahtjev**
  useEffect(() => {
    if (!requestId || requestId === "" || requestId === "all") {
      // Ako nije odabran konkretan zahtjev, očisti pravila
      setRules([]);
      return;
    }
    let mounted = true;
    async function loadRules() {
      try {
        const reqIdNum = Number(requestId);
        if (!reqIdNum) {
          setRules([]);
          return;
        }
        const { data, error: rulesError } = await supabase
          .from("requirement_rules")
          .select("*")
          .eq("requirement_id", reqIdNum);
        if (rulesError) throw rulesError;
        if (!mounted) return;
        const fetchedRules = Array.isArray(data) ? data : [];
        // Parsiraj pravila (posebno za dob i vještine) za lakšu primjenu
        fetchedRules.forEach((rule) => {
          if (rule.rule_type === "age" && rule.json_value) {
            try {
              const ageObj = JSON.parse(rule.json_value);
              const minYears = Number.isFinite(rule.int_min) ? rule.int_min : 0;
              const maxYears = Number.isFinite(rule.int_max) ? rule.int_max : 99;
              const minDays = Number(ageObj.min_days || 0);
              const maxDays = Number(ageObj.max_days || 0);
              rule.minAgeTotalDays = minYears * DAYS_IN_YEAR + minDays;
              rule.maxAgeTotalDays = maxYears * DAYS_IN_YEAR + maxDays;
            } catch {
              rule.minAgeTotalDays = 0;
              rule.maxAgeTotalDays = 99 * DAYS_IN_YEAR + 111;
            }
          }
          if (rule.rule_type === "skill" && rule.text_value) {
            // Mapiraj naziv vještine na ključ koji se koristi u podacima igrača
            const skillMap = {
              keeper: "gk",
              defending: "de",
              playmaking: "pm",
              winger: "wg",
              passing: "ps",
              scoring: "sc",
              set_pieces: "sp",
              stamina: "stam",
            };
            rule.skillKey = skillMap[rule.text_value] || rule.text_value;
          }
        });
        setRules(fetchedRules);
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Greška kod učitavanja pravila zahtjeva.");
          setRules([]); // u slučaju greške, postavi prazno da nijedan igrač ne prođe
        }
      }
    }
    loadRules();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  useEffect(() => {
    if (!team || requestId === "") {
      // Nema odabranog zahtjeva - lista igrača se ne učitava dok ga korisnik ne odabere
      setPlayers([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadPlayers() {
      setLoading(true);
      setError("");

      try {
        // Dohvati sve igrače za zadani tim (NT ili U21)
        const { data: compactData, error: compactError } = await supabase
          .from("players_compact")
          .select(
            "id, full_name, ht_player_id, team_type, age_years, age_days, nationality, position, tsi, salary, spec, status, notes, created_at, updated_at"
          )
          .eq("team_type", team.toUpperCase());

        if (compactError) throw compactError;
        let allPlayers = compactData || [];
        // Ukloni eventualne duplikate
        allPlayers = dedupePlayers(allPlayers);

        // **Filtriraj igrače prema pravilima odabranog zahtjeva ako je odabran konkretan zahtjev**
        if (requestId !== "all" && requestId !== "" && Array.isArray(allPlayers)) {
          // Primijeni sva pravila iz stanja `rules` nad listom igrača
          allPlayers = allPlayers.filter((player) => {
            // Prođi kroz sva pravila zahtjeva; igrač mora zadovoljiti sva da bi ostao u listi
            for (const rule of rules) {
              switch (rule.rule_type) {
                case "age": {
                  // Izračunaj starost igrača u danima
                  const ageYears = Number(getField(player, ["age_years", "age"])) || 0;
                  const ageDays = Number(getField(player, ["age_days", "days"])) || 0;
                  const playerAgeTotal = ageYears * DAYS_IN_YEAR + ageDays;
                  // Granice dobi (već izračunate u rule.minAgeTotalDays i max)
                  const minAge = rule.minAgeTotalDays ?? 0;
                  const maxAge = rule.maxAgeTotalDays ?? 99 * DAYS_IN_YEAR + 111;
                  if (playerAgeTotal < minAge || playerAgeTotal > maxAge) {
                    return false;
                  }
                  break;
                }
                case "skill": {
                  const skillKey = rule.skillKey || rule.text_value;
                  // Probaj dohvatiti vrijednost vještine iz objekta igrača
                  const skillVal = getField(player, [
                    `skill_${skillKey}`,
                    skillKey,
                    // dodatni ključevi za moguće nazive polja
                    skillKey === "gk" ? "goalkeeping" : "",
                    skillKey === "de" ? "defending" : "",
                    skillKey === "pm" ? "playmaking" : "",
                    skillKey === "wg" ? "winger" : "",
                    skillKey === "ps" ? "passing" : "",
                    skillKey === "sc" ? "scoring" : "",
                    skillKey === "sp" ? "set_pieces" : "",
                    skillKey === "stam" ? "stamina" : "",
                  ]);
                  if (skillVal === null || typeof skillVal === "undefined") {
                    // Ako nemamo podatak o toj vještini, smatramo da igrač ne ispunjava uvjet
                    return false;
                  }
                  const numericVal = Number(skillVal);
                  if (!Number.isFinite(numericVal) || numericVal < rule.int_min) {
                    return false;
                  }
                  break;
                }
                case "htms": {
                  // Minimalni Ability HTMS
                  const ability = getField(player, ["ability_htms", "abilityHtms", "htms"]);
                  if (ability === null || typeof ability === "undefined") {
                    return false;
                  }
                  if (Number(ability) < rule.int_min) {
                    return false;
                  }
                  break;
                }
                case "htms28": {
                  // Minimalni Potential HTMS (HTMS za 28 dana treniranja)
                  const potential = getField(player, ["potential_htms", "potentialHtms", "htms28"]);
                  if (potential === null || typeof potential === "undefined") {
                    return false;
                  }
                  if (Number(potential) < rule.int_min) {
                    return false;
                  }
                  break;
                }
                case "spec": {
                  // Specijalnost - tekstualna usporedba (case-insensitive)
                  const specVal = normalizeTrait(getField(player, ["speciality", "specialty", "spec"]));
                  if (!specVal) {
                    return false;
                  }
                  if (!specVal.includes(String(rule.text_value).toLowerCase())) {
                    return false;
                  }
                  break;
                }
                default:
                  // Ostali tipovi pravila (ako ih bude) se preskaču
                  break;
              }
            }
            // Ako je prošao sva pravila, igrač ostaje u listi
            return true;
          });
        }

        if (mounted) {
          setPlayers(allPlayers);
        }
      } catch (e) {
        if (mounted) {
          setError(e?.message || "Greška kod dohvaćanja igrača.");
          setPlayers([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPlayers();

    return () => {
      mounted = false;
    };
  }, [team, teamId, requestId, rules]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Primijeni dodatne filtere (pretraga, pozicija, dob, minimalne vještine, HTMS, osobine)
      if (filtersApplied.search) {
        const s = filtersApplied.search.toLowerCase();
        const name = String(player.full_name || player.name || "").toLowerCase();
        const htId = String(player.ht_player_id || player.htid || "");
        if (!name.includes(s) && !htId.includes(s)) return false;
      }

      if (filtersApplied.position) {
        const posValue = String(getField(player, ["position", "pos", "role"]) || "");
        if (posValue.toLowerCase() !== filtersApplied.position.toLowerCase()) {
          return false;
        }
      }

      const rawAgeYears = getField(player, ["age_years", "age", "years"]);
      const rawAgeDays = getField(player, ["age_days", "days"]);
      if (rawAgeYears !== null && rawAgeDays !== null) {
        const ageYears = Number(rawAgeYears);
        const ageDays = Number(rawAgeDays);
        const playerAge = ageYears * DAYS_IN_YEAR + ageDays;
        const minAge =
          Number(filtersApplied.ageMinYears || 0) * DAYS_IN_YEAR +
          Number(filtersApplied.ageMinDays || 0);
        const maxAge =
          Number(filtersApplied.ageMaxYears || 99) * DAYS_IN_YEAR +
          Number(filtersApplied.ageMaxDays || 111);
        if (playerAge < minAge) return false;
        if (playerAge > maxAge) return false;
      }

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
        if (filtersApplied.minSkills[key] === "") continue;
        const minVal = Number(filtersApplied.minSkills[key]);
        if (!Number.isFinite(minVal)) continue;

        const rawVal = getField(player, fields);
        if (rawVal === null || typeof rawVal === "undefined") continue;
        const currentVal = Number(rawVal);
        if (currentVal < minVal) return false;
      }

      if (filtersApplied.htmsInputs.tsi) {
        const tsi = Number(getField(player, ["tsi"]) || 0);
        if (tsi < Number(filtersApplied.htmsInputs.tsi)) return false;
      }

      if (filtersApplied.htmsInputs.abilityHtms) {
        const ability = Number(
          getField(player, ["ability_htms", "abilityHtms", "htms"]) || 0
        );
        if (ability < Number(filtersApplied.htmsInputs.abilityHtms)) return false;
      }

      if (filtersApplied.htmsInputs.potentialHtms) {
        const potential = Number(
          getField(player, ["potential_htms", "potentialHtms", "htms28"]) || 0
        );
        if (potential < Number(filtersApplied.htmsInputs.potentialHtms)) return false;
      }

      if (filtersApplied.traits.specialty !== "any") {
        const spec = normalizeTrait(getField(player, ["speciality", "specialty", "spec"]));
        if (!spec || !spec.includes(filtersApplied.traits.specialty.toLowerCase())) {
          return false;
        }
      }

      if (filtersApplied.traits.agree !== "any") {
        const agreeValue = resolveTraitValue(
          getField(player, ["agreeability", "agree"]),
          "agree"
        );
        if (agreeValue === null || agreeValue !== Number(filtersApplied.traits.agree)) {
          return false;
        }
      }

      if (filtersApplied.traits.agg !== "any") {
        const aggValue = resolveTraitValue(
          getField(player, ["aggressiveness", "agg"]),
          "agg"
        );
        if (aggValue === null || aggValue !== Number(filtersApplied.traits.agg)) {
          return false;
        }
      }

      if (filtersApplied.traits.hon !== "any") {
        const honValue = resolveTraitValue(
          getField(player, ["honesty", "hon"]),
          "hon"
        );
        if (honValue === null || honValue !== Number(filtersApplied.traits.hon)) {
          return false;
        }
      }

      return true;
    });
  }, [players, filtersApplied]);

  // Funkcija za mapiranje vrijednosti osobina na indeks (0-5) radi usporedbe
  function resolveTraitValue(value, traitKey) {
    if (value === null || typeof value === "undefined") return null;
    const norm = normalizeTrait(value);
    const keywords = TRAIT_KEYWORDS[traitKey] || [];
    const index = keywords.findIndex((kw) => norm === kw);
    return index >= 0 ? index : null;
  }

  const tablePositions = useMemo(() => {
    if (positions.length > 0) return positions;
    const unique = new Set();
    players.forEach((player) => {
      const posValue = getField(player, ["position", "pos", "role"]);
      if (posValue) unique.add(String(posValue));
    });
    return Array.from(unique);
  }, [positions, players]);

  function applyFilters() {
    setFiltersApplied({
      search,
      position,
      ageMinYears,
      ageMinDays,
      ageMaxYears,
      ageMaxDays,
      minSkills: { ...minSkills },
      htmsInputs: { ...htmsInputs },
      traits: { ...traits },
    });
  }

  function applyColumns() {
    setColumnsApplied({ ...columnsDraft });
  }

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
                <option value="all">Sve</option>
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
                  : requestId === "all"
                  ? "Prikaz svih igrača"
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
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {SKILL_LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="gridRow">
                  <label className="stacked">
                    <span>Trenerska vješt. ≥</span>
                    <select
                      value={minSkills.coach}
                      onChange={(e) =>
                        setMinSkills({ ...minSkills, coach: e.target.value })
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
                    <span>TSI ≥</span>
                    <input
                      type="number"
                      value={htmsInputs.tsi}
                      onChange={(e) =>
                        setHtmsInputs({ ...htmsInputs, tsi: e.target.value })
                      }
                    />
                  </label>

                  <label className="stacked">
                    <span>Ability HTMS ≥</span>
                    <input
                      type="number"
                      value={htmsInputs.abilityHtms}
                      onChange={(e) =>
                        setHtmsInputs({ ...htmsInputs, abilityHtms: e.target.value })
                      }
                    />
                  </label>

                  <label className="stacked">
                    <span>Potential HTMS ≥</span>
                    <input
                      type="number"
                      value={htmsInputs.potentialHtms}
                      onChange={(e) =>
                        setHtmsInputs({ ...htmsInputs, potentialHtms: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="gridRow">
                  <label className="stacked">
                    <span>Specijalnost</span>
                    <select
                      value={traits.specialty}
                      onChange={(e) =>
                        setTraits({ ...traits, specialty: e.target.value })
                      }
                    >
                      <option value="any">Sve</option>
                      <option value="Technical">Technical</option>
                      <option value="Quick">Quick</option>
                      <option value="Powerful">Powerful</option>
                      <option value="Unpredictable">Unpredictable</option>
                      <option value="Head">Head</option>
                      <option value="Resilient">Resilient</option>
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Agresivnost</span>
                    <select
                      value={traits.agg}
                      onChange={(e) =>
                        setTraits({ ...traits, agg: e.target.value })
                      }
                    >
                      <option value="any">Sve</option>
                      {TRAIT_LABELS.agg.map((label, idx) => (
                        <option key={idx} value={idx}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Poštenje</span>
                    <select
                      value={traits.hon}
                      onChange={(e) =>
                        setTraits({ ...traits, hon: e.target.value })
                      }
                    >
                      <option value="any">Sve</option>
                      {TRAIT_LABELS.hon.map((label, idx) => (
                        <option key={idx} value={idx}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stacked">
                    <span>Suglasnost</span>
                    <select
                      value={traits.agree}
                      onChange={(e) =>
                        setTraits({ ...traits, agree: e.target.value })
                      }
                    >
                      <option value="any">Sve</option>
                      {TRAIT_LABELS.agree.map((label, idx) => (
                        <option key={idx} value={idx}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="row" style={{ justifyContent: "flex-end", marginTop: 6 }}>
                  <button className="ghostBtn" type="button" onClick={applyFilters}>
                    Primijeni filtere
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Prikaz kolona</div>
                <div className="cardSub">Odaberi koje kolone prikazati u tablici.</div>
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
              <>
                <div className="gridRow">
                  {COLUMN_FILTER_KEYS.map((key) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={columnsDraft[key] || false}
                        onChange={(e) =>
                          setColumnsDraft({ ...columnsDraft, [key]: e.target.checked })
                        }
                      />
                      <span>{COLUMN_LABELS[key] || key}</span>
                    </label>
                  ))}
                </div>
                <div className="row" style={{ justifyContent: "flex-end", marginTop: 6 }}>
                  <button className="ghostBtn" type="button" onClick={applyColumns}>
                    Primijeni kolone
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div className="listCard">
            {requestId === "" && (
              <div className="empty">Odaberi zahtjev kako bi se lista učitala.</div>
            )}

            {requestId !== "" && loading && <div className="empty">Učitavanje…</div>}

            {requestId !== "" && !loading && filteredPlayers.length === 0 && (
              <div className="empty">Nema igrača za ovaj zahtjev / filtere.</div>
            )}

            {requestId !== "" && !loading && filteredPlayers.length > 0 ? (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Ime i prezime</th>
                      {columnsApplied.playingIn && <th>Igra u</th>}
                      {columnsApplied.owningTeam && <th>Klub</th>}
                      {columnsApplied.manager && <th>Manager</th>}
                      {columnsApplied.age && <th>Dob</th>}
                      {columnsApplied.salary && <th>Plaća</th>}
                      {columnsApplied.tsi && <th>TSI</th>}
                      {columnsApplied.spec && <th>Spec</th>}
                      {columnsApplied.agree && <th>Sug</th>}
                      {columnsApplied.agg && <th>Agr</th>}
                      {columnsApplied.hon && <th>Poš</th>}
                      {columnsApplied.fo && <th>Fo</th>}
                      {columnsApplied.st && <th>Izdr</th>}
                      {columnsApplied.gk && <th>GK</th>}
                      {columnsApplied.de && <th>Obr</th>}
                      {columnsApplied.pm && <th>Kre</th>}
                      {columnsApplied.wg && <th>Krilo</th>}
                      {columnsApplied.ps && <th>Dod</th>}
                      {columnsApplied.sc && <th>Nap</th>}
                      {columnsApplied.sp && <th>Prek</th>}
                      {columnsApplied.exp && <th>Isk</th>}
                      {columnsApplied.lead && <th>Vods</th>}
                      {columnsApplied.abilityHtms && <th>Ability</th>}
                      {columnsApplied.potentialHtms && <th>Potential</th>}
                      {columnsApplied.talent && <th>Talent</th>}
                      {columnsApplied.lastMatch && <th>Zadnja ut.</th>}
                      {columnsApplied.position && <th>Poz</th>}
                      {columnsApplied.time && <th>Vrijeme</th>}
                      {columnsApplied.rating && <th>Ocjena</th>}
                      {columnsApplied.tr && <th>Trening</th>}
                      {columnsApplied.lastTraining && <th>Zadnji tr.</th>}
                      {columnsApplied.staminaPart && <th>Stamina part</th>}
                      {columnsApplied.lastStaminaPart && <th>Zadnja stamina</th>}
                      {columnsApplied.trainerSkill && <th>Trener vješt.</th>}
                      {columnsApplied.trainerLeadership && <th>Trener vod.</th>}
                      {columnsApplied.assistantCoach && <th>Pomoćni trener</th>}
                      {columnsApplied.formCoach && <th>Trener forme</th>}
                      {columnsApplied.medic && <th>Medic</th>}
                      {columnsApplied.lastMatchWcCc && <th>Zadnja WC/CC</th>}
                      {columnsApplied.updated && <th>Ažurirano</th>}
                      {columnsApplied.updatedSkills && <th>Ažur. skil.</th>}
                      {columnsApplied.updatedSubskills && <th>Ažur. sub.</th>}
                      {columnsApplied.lastScoutNote && <th>Zadnja bilješka</th>}
                      <th>Status</th>
                      <th>Bilješka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => {
                      const ageYears = player.age_years ?? player.age ?? 0;
                      const ageDays = player.age_days ?? player.days ?? 0;
                      const ageStr = `${ageYears}g ${ageDays}d`;
                      return (
                        <tr key={player.id}>
                          <td style={{ fontWeight: 600 }}>
                            {player.full_name || player.name}{" "}
                            {player.nationality ? (
                              <span style={{ opacity: 0.8 }}>
                                ({player.nationality})
                              </span>
                            ) : (
                              ""
                            )}
                          </td>
                          {columnsApplied.playingIn && (
                            <td>{player.playingIn || "—"}</td>
                          )}
                          {columnsApplied.owningTeam && (
                            <td>{player.owningTeam || "—"}</td>
                          )}
                          {columnsApplied.manager && <td>{player.manager || "—"}</td>}
                          {columnsApplied.age && <td>{ageStr}</td>}
                          {columnsApplied.salary && (
                            <td>{player.salary ? player.salary.toLocaleString() : "—"}</td>
                          )}
                          {columnsApplied.tsi && (
                            <td>{player.tsi ? player.tsi.toLocaleString() : "—"}</td>
                          )}
                          {columnsApplied.spec && <td>{player.spec || "—"}</td>}
                          {columnsApplied.agree && (
                            <td>{player.agree ?? player.agreeability ?? "—"}</td>
                          )}
                          {columnsApplied.agg && (
                            <td>{player.agg ?? player.aggressiveness ?? "—"}</td>
                          )}
                          {columnsApplied.hon && (
                            <td>{player.hon ?? player.honesty ?? "—"}</td>
                          )}
                          {columnsApplied.fo && <td>{player.fo ?? player.form ?? "—"}</td>}
                          {columnsApplied.st && <td>{player.st ?? player.stamina ?? "—"}</td>}
                          {columnsApplied.gk && (
                            <td>{formatSkillValue(player.gk ?? player.skill_gk)}</td>
                          )}
                          {columnsApplied.de && (
                            <td>{formatSkillValue(player.de ?? player.skill_defending)}</td>
                          )}
                          {columnsApplied.pm && (
                            <td>{formatSkillValue(player.pm ?? player.skill_playmaking)}</td>
                          )}
                          {columnsApplied.wg && (
                            <td>{formatSkillValue(player.wg ?? player.skill_winger)}</td>
                          )}
                          {columnsApplied.ps && (
                            <td>{formatSkillValue(player.ps ?? player.skill_passing)}</td>
                          )}
                          {columnsApplied.sc && (
                            <td>{formatSkillValue(player.sc ?? player.skill_scoring)}</td>
                          )}
                          {columnsApplied.sp && (
                            <td>{formatSkillValue(player.sp ?? player.skill_set_pieces)}</td>
                          )}
                          {columnsApplied.exp && (
                            <td>{formatSkillValue(player.exp ?? player.experience)}</td>
                          )}
                          {columnsApplied.lead && (
                            <td>{formatSkillValue(player.lead ?? player.leadership)}</td>
                          )}
                          {columnsApplied.abilityHtms && (
                            <td>
                              {player.ability_htms ?? player.abilityHtms ?? player.htms ?? "—"}
                            </td>
                          )}
                          {columnsApplied.potentialHtms && (
                            <td>
                              {player.potential_htms ??
                                player.potentialHtms ??
                                player.htms28 ??
                                "—"}
                            </td>
                          )}
                          {columnsApplied.talent && <td>{player.talent || "—"}</td>}
                          {columnsApplied.lastMatch && <td>{player.lastMatch || "—"}</td>}
                          {columnsApplied.position && <td>{player.position || player.pos || "—"}</td>}
                          {columnsApplied.time && <td>{player.time || "—"}</td>}
                          {columnsApplied.rating && <td>{player.rating || "—"}</td>}
                          {columnsApplied.tr && <td>{player.tr || player.training || "—"}</td>}
                          {columnsApplied.lastTraining && (
                            <td>{player.lastTraining || player.last_trained || "—"}</td>
                          )}
                          {columnsApplied.staminaPart && (
                            <td>{player.staminaPart ?? player.stamina_part ?? "—"}</td>
                          )}
                          {columnsApplied.lastStaminaPart && (
                            <td>{player.lastStaminaPart ?? player.last_stamina_part ?? "—"}</td>
                          )}
                          {columnsApplied.trainerSkill && (
                            <td>{player.trainerSkill ?? player.coach_skill ?? "—"}</td>
                          )}
                          {columnsApplied.trainerLeadership && (
                            <td>{player.trainerLeadership ?? player.trainer_leadership ?? "—"}</td>
                          )}
                          {columnsApplied.assistantCoach && (
                            <td>{player.assistantCoach ?? player.assistant_coach ?? "—"}</td>
                          )}
                          {columnsApplied.formCoach && (
                            <td>{player.formCoach ?? player.form_coach ?? "—"}</td>
                          )}
                          {columnsApplied.medic && (
                            <td>{player.medic ?? player.medic_level ?? "—"}</td>
                          )}
                          {columnsApplied.lastMatchWcCc && (
                            <td>{player.lastMatchWcCc ?? player.last_wc_cc ?? "—"}</td>
                          )}
                          {columnsApplied.updated && (
                            <td>
                              {player.updated
                                ? String(player.updated).slice(0, 16).replace("T", " ")
                                : "—"}
                            </td>
                          )}
                          {columnsApplied.updatedSkills && (
                            <td>
                              {player.updatedSkills ??
                                player.updated_skills ??
                                (player.updated
                                  ? String(player.updated).slice(0, 16).replace("T", " ")
                                  : "—")}
                            </td>
                          )}
                          {columnsApplied.updatedSubskills && (
                            <td>
                              {player.updatedSubskills ??
                                player.updated_subskills ??
                                (player.updated
                                  ? String(player.updated).slice(0, 16).replace("T", " ")
                                  : "—")}
                            </td>
                          )}
                          {columnsApplied.lastScoutNote && (
                            <td>{player.lastScoutNote ?? player.last_scout_note ?? "—"}</td>
                          )}
                          <td>{player.status || "—"}</td>
                          <td style={{ whiteSpace: "pre" }}>{player.notes || "—"}</td>
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
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-bottom: 14px;
        }
        .header .sub {
          opacity: 0.8;
          margin-top: 4px;
          font-size: 14px;
        }
        .card,
        .listCard {
          margin-bottom: 18px;
          padding: 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.75);
        }
        .cardTitle {
          font-weight: 900;
          margin-bottom: 4px;
        }
        .cardSub {
          font-size: 12px;
          opacity: 0.8;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-top: 12px;
        }
        .ageGroup {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ageGroup > span {
          font-size: 12px;
          font-weight: 600;
          margin-right: 4px;
        }
        .stacked {
          display: flex;
          flex-direction: column;
        }
        .stacked > span {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .gridRow {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px 14px;
          margin-top: 12px;
        }
        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ghostBtn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          background: #fff;
          cursor: pointer;
          font-weight: 600;
        }
        .ghostBtn:hover {
          background: #f9fafb;
        }
        .hint {
          font-size: 12px;
          opacity: 0.8;
        }
        .empty {
          padding: 18px;
          text-align: center;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.8);
        }
        .tableWrap {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          position: sticky;
          top: 0;
          background: #f3f4f6;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        td {
          font-size: 13px;
          padding: 6px 8px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
      `}</style>
    </AppLayout>
  );
}
