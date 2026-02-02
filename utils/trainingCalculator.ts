/* =========================================================
 * HR Training Calculator – Core Engine (v1)
 * Standalone, stateless, deterministic
 * ---------------------------------------------------------
 * - NO UI
 * - NO NT/U21 logic
 * - NO TES
 * - NO persistence
 * ========================================================= */

export type TrainingInput = {
  ageYears: number;            // e.g. 18
  ageDays: number;             // 0–111

  primarySkillLevel: number;   // e.g. 11.35
  staminaLevel: number;        // 1.0 – 9.4

  trainingType: 'GK' | 'DEF' | 'PM' | 'WING' | 'PASS' | 'SCORE' | 'SP';
  trainingIntensity: number;   // 90–100
  staminaShare: number;        // 5–20

  coachLevel: 'solid' | 'excellent';
  assistants: number;          // 0–10

  weeklyMinutes: number;       // 0–90

  targetSkillLevel?: number;   // optional
  cutoffAge?: {                // optional
    years: number;
    days: number;
  };
};

export type TimelinePoint = {
  week: number;
  skillLevel: number;
};

export type TrainingOutput = {
  weeklyGain: number;

  etaNextLevelWeeks: number;
  etaTargetWeeks?: number;

  ageAtTarget?: {
    years: number;
    days: number;
  };

  timeline: TimelinePoint[];
};

/* =========================================================
 * PUBLIC API
 * ========================================================= */

export function calculateTraining(input: TrainingInput): TrainingOutput {
  const weeklyGain = calculateWeeklyGain(input);

  const etaNextLevelWeeks = calculateEtaToNextLevel(
    input.primarySkillLevel,
    weeklyGain
  );

  let etaTargetWeeks: number | undefined;
  let ageAtTarget: { years: number; days: number } | undefined;
  let timeline: TimelinePoint[] = [];

  if (typeof input.targetSkillLevel === 'number') {
    const sim = simulateToTarget(input, weeklyGain);
    etaTargetWeeks = sim.etaWeeks;
    ageAtTarget = sim.ageAtTarget;
    timeline = buildTimeline(sim.rawTimeline);
  } else {
    timeline = buildTimeline([
      { week: 0, skillLevel: input.primarySkillLevel },
      {
        week: etaNextLevelWeeks,
        skillLevel: Math.floor(input.primarySkillLevel) + 1,
      },
    ]);
  }

  return {
    weeklyGain,
    etaNextLevelWeeks,
    etaTargetWeeks,
    ageAtTarget,
    timeline,
  };
}

/* =========================================================
 * CORE CALCULATIONS
 * ========================================================= */

export function calculateWeeklyGain(input: TrainingInput): number {
  const fLevel = levelSpeedFactor(input.primarySkillLevel);
  const kCoach = coachFactor(input.coachLevel);
  const kAssist = assistantFactor(input.assistants);
  const kIntensity = input.trainingIntensity / 100;
  const kStamina = staminaFactor(input.staminaShare);
  const kTrain = trainingTypeFactor(input.trainingType);
  const kAge = ageFactor(input.ageYears, input.ageDays);
  const kTime = minutesFactor(input.weeklyMinutes);

  let gain =
    fLevel *
    kCoach *
    kAssist *
    kIntensity *
    kStamina *
    kTrain *
    kAge *
    kTime;

  // Hard cap according to training formula 2.0
  if (gain > 1.0) gain = 1.0;
  if (gain < 0) gain = 0;

  return round(gain, 4);
}

export function calculateEtaToNextLevel(
  currentLevel: number,
  weeklyGain: number
): number {
  if (weeklyGain <= 0) return Infinity;

  const nextLevel = Math.floor(currentLevel) + 1;
  const remaining = nextLevel - currentLevel;

  return Math.ceil(remaining / weeklyGain);
}

function simulateToTarget(
  input: TrainingInput,
  weeklyGain: number
): {
  etaWeeks: number;
  ageAtTarget: { years: number; days: number };
  rawTimeline: TimelinePoint[];
} {
  let level = input.primarySkillLevel;
  let weeks = 0;

  const rawTimeline: TimelinePoint[] = [
    { week: 0, skillLevel: round(level, 3) },
  ];

  const cutoffDays = input.cutoffAge
    ? ageToDays(input.cutoffAge.years, input.cutoffAge.days)
    : Infinity;

  let currentAgeDays = ageToDays(input.ageYears, input.ageDays);

  while (level < (input.targetSkillLevel as number)) {
    level += weeklyGain;
    weeks += 1;
    currentAgeDays += 7;

    rawTimeline.push({
      week: weeks,
      skillLevel: round(level, 3),
    });

    if (currentAgeDays > cutoffDays) break;
    if (weeks > 1000) break; // safety guard
  }

  return {
    etaWeeks: weeks,
    ageAtTarget: daysToAge(currentAgeDays),
    rawTimeline,
  };
}

/* =========================================================
 * TIMELINE
 * ========================================================= */

export function buildTimeline(
  raw: TimelinePoint[]
): TimelinePoint[] {
  if (raw.length <= 5) return raw;

  const result: TimelinePoint[] = [];
  const step = Math.ceil(raw.length / 5);

  for (let i = 0; i < raw.length; i += step) {
    result.push(raw[i]);
  }

  const last = raw[raw.length - 1];
  if (result[result.length - 1].week !== last.week) {
    result.push(last);
  }

  return result;
}

/* =========================================================
 * INTERNAL FACTORS (HELPERS)
 * ========================================================= */

function levelSpeedFactor(level: number): number {
  // Simplified piecewise curve (HT-aligned, deterministic)
  if (level < 9) return 0.28;
  if (level < 12) return 0.22;
  if (level < 15) return 0.17;
  return 0.12;
}

function coachFactor(level: 'solid' | 'excellent'): number {
  return level === 'excellent' ? 1.0375 : 1.0;
}

function assistantFactor(count: number): number {
  return 1 + Math.min(Math.max(count, 0), 10) * 0.035;
}

function staminaFactor(staminaShare: number): number {
  return 1 - staminaShare / 100;
}

function trainingTypeFactor(type: TrainingInput['trainingType']): number {
  switch (type) {
    case 'GK':
      return 1.0;
    case 'DEF':
    case 'PM':
    case 'WING':
    case 'PASS':
    case 'SCORE':
      return 0.9;
    case 'SP':
      return 0.7;
    default:
      return 0.9;
  }
}

function ageFactor(years: number, days: number): number {
  const age = years + days / 112;
  return 54 / (age + 37);
}

function minutesFactor(minutes: number): number {
  if (minutes <= 0) return 0;
  return Math.min(minutes / 90, 1);
}

/* =========================================================
 * AGE / ROUNDING HELPERS
 * ========================================================= */

function ageToDays(years: number, days: number): number {
  return years * 112 + days;
}

function daysToAge(totalDays: number): { years: number; days: number } {
  return {
    years: Math.floor(totalDays / 112),
    days: totalDays % 112,
  };
}

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}
