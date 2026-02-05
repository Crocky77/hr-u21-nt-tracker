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

const COLUMN_DEFS = [
  { key: "player", label: "Igrač", shortLabel: "Igrač" },
  { key: "playingIn", label: "Igra u", shortLabel: "In" },
  { key: "owningTeam", label: "Klub", shortLabel: "Klub" },
  { key: "manager", label: "Korisnik", shortLabel: "Korisnik" },
  { key: "age", label: "Godine", shortLabel: "God" },
  { key: "salary", label: "Plaća", shortLabel: "Plaća" },
  { key: "tsi", label: "TSI", shortLabel: "TSI" },
  { key: "spec", label: "Specijalnost", shortLabel: "S" },
  { key: "agree", label: "Suglasnost", shortLabel: "Sug" },
  { key: "agg", label: "Agresivnost", shortLabel: "Agr" },
  { key: "hon", label: "Poštenje", shortLabel: "Poš" },
  { key: "fo", label: "Forma", shortLabel: "For" },
  { key: "st", label: "Izdržljivost", shortLabel: "Izd" },
  { key: "gk", label: "Na vratima", shortLabel: "Vra" },
  { key: "de", label: "Obrana", shortLabel: "Obr" },
  { key: "pm", label: "Kreiranje", shortLabel: "Kre" },
  { key: "wg", label: "Krilo", shortLabel: "Kr" },
  { key: "ps", label: "Proigravanje", shortLabel: "Pro" },
  { key: "sc", label: "Napad", shortLabel: "Nap" },
  { key: "sp", label: "Prekidi", shortLabel: "SU" },
  { key: "exp", label: "Iskustvo", shortLabel: "Isk" },
  { key: "lead", label: "Vodstvo", shortLabel: "Vod" },
  { key: "abilityHtms", label: "Trenutni HTMS", shortLabel: "HTMS" },
  { key: "potentialHtms", label: "Potencijalni HTMS", shortLabel: "HTMS28" },
  { key: "talent", label: "Talent", shortLabel: "Talent" },
  { key: "lastMatch", label: "Zadnja utakmica", shortLabel: "Utakmica" },
  { key: "position", label: "Pozicija", shortLabel: "Pos" },
  { key: "time", label: "Vrijeme", shortLabel: "Vrijeme" },
  { key: "rating", label: "Ocijena", shortLabel: "Rating" },
  { key: "tr", label: "Trenutni trenin", shortLabel: "TT" },
  { key: "lastTraining", label: "Posljednji trening", shortLabel: "PT" },
  { key: "staminaPart", label: "Udio stamine", shortLabel: "US*" },
  {
    key: "lastStaminaPart",
    label: "Posljednji udio izdržljivosti",
    shortLabel: "US,%",
  },
  { key: "trainerSkill", label: "Vještina trenera", shortLabel: "Trn" },
  { key: "trainerLeadership", label: "Vodstvo trenera", shortLabel: "VTr" },
  {
    key: "assistantCoach",
    label: "Razina pomoćnih trenera",
    shortLabel: "RPT",
  },
  { key: "formCoach", label: "Razina trenera forme", shortLabel: "RTF" },
  { key: "medic", label: "Razina doktora", shortLabel: "DOC" },
  { key: "lastMatchWcCc", label: "Zadnja utakmica SP/CC", shortLabel: "SP/CC" },
  { key: "updated", label: "Ažurirano", shortLabel: "Ažurirano" },
  { key: "updatedSkills", label: "Ažurirani skilovi", shortLabel: "Ažurirani skill" },
  {
    key: "updatedSubskills",
    label: "Ažurirani subskilovi",
    shortLabel: "Ažurirani subskilovi",
  },
  {
    key: "lastScoutNote",
    label: "Posljednja zabilješka skauta",
    shortLabel: "Zabilješka skauta",
  },
];

const COLUMN_LABELS = COLUMN_DEFS.reduce((acc, column) => {
  acc[column.key] = column.label;
  return acc;
}, {});

const DEFAULT_COLUMNS = Object.keys(COLUMN_LABELS).reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {});

const DEFAULT_VISIBLE_COLUMNS = {
  player: true,
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

const COLUMN_FILTER_KEYS = COLUMN_DEFS.map((column) => column.key);

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
    if (!team || requestId === "") {
      setPlayers([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadPlayers = async () => {
      if (!team || !teamId) return;

      setLoading(true);

      try {
        let playersData = [];

        if (requestId === "all" || !requestId) {
          // Fallback: svi igrači za tim
          const { data, error } = await supabase
            .from("players")
            .select("*")
            .eq("team_id", teamId);

          if (error) throw error;
          playersData = data;
        } else {
          // Dohvati samo one koji zadovoljavaju requirement
          const matchTries = [
            { team_id: teamId },
            { team_type: team?.toUpperCase?.() },
            {},
          ];
          let matchData = null;
          let lastMatchError = null;

          for (const matchArgs of matchTries) {
            const entries = Object.entries(matchArgs).filter(
              ([, value]) => value !== null && typeof value !== "undefined"
            );
            let matchQuery = supabase
              .from("player_requirement_matches")
              .select("player_id")
              .eq("requirement_id", requestId);

            entries.forEach(([key, value]) => {
              matchQuery = matchQuery.eq(key, value);
            });

            const { data, error } = await matchQuery;
            if (error) {
              lastMatchError = error;
              continue;
            }

            if (Array.isArray(data)) {
              matchData = data;
              break;
            }
          }

          if (!matchData && lastMatchError) throw lastMatchError;

          const playerIds = (matchData || []).map((m) => m.player_id);

          if (playerIds.length === 0) {
            playersData = [];
          } else {
            // Ima match-eva → učitaj ih
            const { data, error } = await supabase
              .from("players")
              .select("*")
              .in("id", playerIds);

            if (error) throw error;
            playersData = data;
          }
        }

        setPlayers(playersData);
      } catch (error) {
        console.error("Greška pri dohvaćanju igrača:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();

    return () => {
      mounted = false;
    };
  }, [team, teamId, requestId]);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
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
  }, [
    players,
    filtersApplied,
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

  function renderCell(columnKey, player, ageText, name, playerId) {
    switch (columnKey) {
      case "player":
        if (!playerId) return name;
        return (
          <Link className="playerLink" href={`/team/${team}/players/${playerId}`}>
            {name}
          </Link>
        );
      case "playingIn":
        return getField(player, ["playing_in", "playingIn"]) || "—";
      case "owningTeam":
        return getField(player, ["owning_team", "owningTeam", "club_name"]) || "—";
      case "manager":
        return getField(player, ["manager", "manager_name"]) || "—";
      case "age":
        return ageText;
      case "salary":
        return getField(player, ["salary", "wage"]) || "—";
      case "tsi":
        return getField(player, ["tsi"]) || "—";
      case "spec":
        return getField(player, ["speciality", "specialty", "spec"]) || "—";
      case "agree":
        return formatTraitLabel(getField(player, ["agreeability", "agree"]), "agree");
      case "agg":
        return formatTraitLabel(getField(player, ["aggressiveness", "agg"]), "agg");
      case "hon":
        return formatTraitLabel(getField(player, ["honesty", "hon"]), "hon");
      case "fo":
        return getField(player, ["form"]) || "—";
      case "gk":
        return formatSkillValue(
          getField(player, ["skill_gk", "gk", "goalkeeping"])
        );
      case "de":
        return formatSkillValue(
          getField(player, ["skill_defending", "skill_def", "defending", "def"])
        );
      case "pm":
        return formatSkillValue(
          getField(player, ["skill_playmaking", "skill_pm", "playmaking", "pm"])
        );
      case "wg":
        return formatSkillValue(
          getField(player, ["skill_winger", "skill_wing", "winger", "wing", "wg"])
        );
      case "ps":
        return formatSkillValue(
          getField(player, ["skill_passing", "skill_pass", "passing", "pass", "ps"])
        );
      case "sc":
        return formatSkillValue(
          getField(player, ["skill_scoring", "skill_scor", "scoring", "scor", "sc"])
        );
      case "sp":
        return formatSkillValue(
          getField(player, ["skill_set_pieces", "skill_sp", "set_pieces", "sp"])
        );
      case "st":
        return formatSkillValue(getField(player, ["stamina"]));
      case "exp":
        return formatSkillValue(getField(player, ["experience", "exp"]));
      case "lead":
        return formatSkillValue(getField(player, ["leadership", "leader"]));
      case "abilityHtms":
        return getField(player, ["ability_htms", "abilityHtms"]) || "—";
      case "potentialHtms":
        return getField(player, ["potential_htms", "potentialHtms"]) || "—";
      case "talent":
        return getField(player, ["talent"]) || "—";
      case "lastMatch":
        return getField(player, ["last_match", "lastMatch"]) || "—";
      case "position":
        return getField(player, ["position", "pos", "role"]) || "—";
      case "time":
        return getField(player, ["time", "played_time"]) || "—";
      case "rating":
        return getField(player, ["rating", "match_rating"]) || "—";
      case "tr":
        return getField(player, ["current_training", "training"]) || "—";
      case "lastTraining":
        return getField(player, ["last_training", "lastTraining"]) || "—";
      case "staminaPart":
        return getField(player, ["stamina_part", "staminaPart"]) || "—";
      case "lastStaminaPart":
        return getField(player, ["last_stamina_part", "lastStaminaPart"]) || "—";
      case "trainerSkill":
        return getField(player, ["trainer_skill", "trainerSkill"]) || "—";
      case "trainerLeadership":
        return getField(player, ["trainer_leadership", "trainerLeadership"]) || "—";
      case "assistantCoach":
        return (
          getField(player, ["assistant_coach_level", "assistantCoachLevel"]) || "—"
        );
      case "formCoach":
        return getField(player, ["form_coach_level", "formCoachLevel"]) || "—";
      case "medic":
        return getField(player, ["medic_level", "medicLevel"]) || "—";
      case "lastMatchWcCc":
        return getField(player, ["last_match_wc_cc", "lastMatchWcCc"]) || "—";
      case "updated":
        return getField(player, ["updated", "updated_at"]) || "—";
      case "updatedSkills":
        return getField(player, ["updated_skills", "updatedSkills"]) || "—";
      case "updatedSubskills":
        return getField(player, ["updated_subskills", "updatedSubskills"]) || "—";
      case "lastScoutNote":
        return getField(player, ["last_scout_note", "lastScoutNote"]) || "—";
      default:
        return "—";
    }
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
                    <option value="any">Suglasnost (sve)</option>
                    {TRAIT_LABELS.agree.map((label, idx) => (
                      <option key={label} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={traits.agg}
                    onChange={(e) => setTraits({ ...traits, agg: e.target.value })}
                  >
                    <option value="any">Agresivnost (sve)</option>
                    {TRAIT_LABELS.agg.map((label, idx) => (
                      <option key={label} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={traits.hon}
                    onChange={(e) => setTraits({ ...traits, hon: e.target.value })}
                  >
                    <option value="any">Poštenje (sve)</option>
                    {TRAIT_LABELS.hon.map((label, idx) => (
                      <option key={label} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <button className="ghostBtn" type="button" onClick={applyFilters}>
                    Potvrdi filtre
                  </button>
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
                {COLUMN_FILTER_KEYS.map((key) => (
                  <label key={key} className="checkbox">
                    <input
                      type="checkbox"
                      checked={columnsDraft[key]}
                      onChange={() =>
                        setColumnsDraft({
                          ...columnsDraft,
                          [key]: !columnsDraft[key],
                        })
                      }
                    />
                    <span>{COLUMN_LABELS[key] || key.toUpperCase()}</span>
                  </label>
                ))}
                <div className="applyRow">
                  <button className="ghostBtn" type="button" onClick={applyColumns}>
                    Potvrdi stupce
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="tableCard">
            <div className="tableHeader">
              <div className="cardTitle">Tablica igrača</div>
              <div className="cardSub">
                Prikaz tablice prati odabrane filtre i stupce.
              </div>
            </div>

            {error ? <div className="error">Greška: {error}</div> : null}

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
                      {COLUMN_DEFS.filter((column) => columnsApplied[column.key]).map(
                        (column) => (
                          <th key={column.key} title={column.label}>
                            {column.shortLabel}
                          </th>
                        )
                      )}
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
                          {COLUMN_DEFS.filter((column) => columnsApplied[column.key]).map(
                            (column) => (
                              <td key={column.key}>
                                {renderCell(column.key, player, ageText, name, playerId)}
                              </td>
                            )
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
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .gridRow.columns {
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 6px;
        }
        .applyRow {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
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
          gap: 6px;
          font-weight: 600;
          font-size: 12px;
        }
        input,
        select {
          padding: 6px 8px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.14);
          font-size: 12px;
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
          font-size: 12px;
          min-width: 1080px;
        }
        th,
        td {
          padding: 6px 8px;
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
