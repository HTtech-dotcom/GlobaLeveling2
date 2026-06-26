import { rankBands } from "@/config/metrics";

export type RankCode = "E" | "D" | "C" | "B" | "A" | "S" | "SS";
export type RankTier = "minus" | "neutral" | "plus";

export type DisplayRank = {
  code: RankCode;
  tier: RankTier;
  label: string;
  min: number;
  max: number;
  score: number;
};

export type RankVisual = {
  code: RankCode;
  name: string;
  color: string;
  softColor: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
  chipGradient: string;
  effectClass: string;
  auraLabel: string;
};

export const rankVisuals: Record<RankCode, RankVisual> = {
  E: {
    code: "E",
    name: "Awakening",
    color: "#f8fafc",
    softColor: "rgba(248,250,252,0.12)",
    borderColor: "rgba(248,250,252,0.26)",
    glowColor: "rgba(248,250,252,0.18)",
    gradient: "linear-gradient(135deg, rgba(248,250,252,0.18), rgba(148,163,184,0.08))",
    chipGradient: "linear-gradient(135deg, rgba(248,250,252,0.18), rgba(148,163,184,0.08))",
    effectClass: "rank-effect-basic",
    auraLabel: "Basic aura"
  },
  D: {
    code: "D",
    name: "Growth",
    color: "#4ade80",
    softColor: "rgba(74,222,128,0.13)",
    borderColor: "rgba(74,222,128,0.34)",
    glowColor: "rgba(74,222,128,0.25)",
    gradient: "linear-gradient(135deg, rgba(74,222,128,0.20), rgba(22,163,74,0.07))",
    chipGradient: "linear-gradient(135deg, rgba(74,222,128,0.24), rgba(22,163,74,0.08))",
    effectClass: "rank-effect-basic",
    auraLabel: "Green aura"
  },
  C: {
    code: "C",
    name: "Disciplined",
    color: "#38bdf8",
    softColor: "rgba(56,189,248,0.14)",
    borderColor: "rgba(56,189,248,0.38)",
    glowColor: "rgba(56,189,248,0.26)",
    gradient: "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(37,99,235,0.08))",
    chipGradient: "linear-gradient(135deg, rgba(56,189,248,0.26), rgba(37,99,235,0.10))",
    effectClass: "rank-effect-basic",
    auraLabel: "Blue aura"
  },
  B: {
    code: "B",
    name: "Elite",
    color: "#a78bfa",
    softColor: "rgba(167,139,250,0.15)",
    borderColor: "rgba(167,139,250,0.42)",
    glowColor: "rgba(167,139,250,0.30)",
    gradient: "linear-gradient(135deg, rgba(167,139,250,0.24), rgba(126,34,206,0.10))",
    chipGradient: "linear-gradient(135deg, rgba(167,139,250,0.30), rgba(126,34,206,0.13))",
    effectClass: "rank-effect-basic",
    auraLabel: "Purple aura"
  },
  A: {
    code: "A",
    name: "Ascendant",
    color: "#facc15",
    softColor: "rgba(250,204,21,0.16)",
    borderColor: "rgba(250,204,21,0.48)",
    glowColor: "rgba(250,204,21,0.38)",
    gradient: "linear-gradient(135deg, rgba(250,204,21,0.30), rgba(245,158,11,0.12), rgba(255,255,255,0.08))",
    chipGradient: "linear-gradient(135deg, rgba(250,204,21,0.36), rgba(245,158,11,0.15))",
    effectClass: "rank-effect-gold",
    auraLabel: "Golden glow"
  },
  S: {
    code: "S",
    name: "Inferno",
    color: "#ff4d4d",
    softColor: "rgba(255,77,77,0.17)",
    borderColor: "rgba(255,77,77,0.54)",
    glowColor: "rgba(255,77,77,0.42)",
    gradient: "linear-gradient(135deg, rgba(255,77,77,0.34), rgba(249,115,22,0.13), rgba(127,29,29,0.16))",
    chipGradient: "linear-gradient(135deg, rgba(255,77,77,0.42), rgba(249,115,22,0.18))",
    effectClass: "rank-effect-fire",
    auraLabel: "Fire aura"
  },
  SS: {
    code: "SS",
    name: "Mythic",
    color: "#fb923c",
    softColor: "rgba(251,146,60,0.19)",
    borderColor: "rgba(251,146,60,0.60)",
    glowColor: "rgba(251,146,60,0.48)",
    gradient: "linear-gradient(135deg, rgba(251,146,60,0.42), rgba(253,186,116,0.18), rgba(255,255,255,0.10))",
    chipGradient: "linear-gradient(135deg, rgba(251,146,60,0.46), rgba(253,186,116,0.20), rgba(255,255,255,0.08))",
    effectClass: "rank-effect-mythic",
    auraLabel: "Mythic aura"
  }
};

function asRankCode(value: string | undefined | null): RankCode {
  return value === "D" || value === "C" || value === "B" || value === "A" || value === "S" || value === "SS" ? value : "E";
}

export function getRankVisualByCode(rankCode: string | undefined | null): RankVisual {
  return rankVisuals[asRankCode(rankCode)];
}

export function getDisplayRank(score: number): DisplayRank {
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const band = rankBands.find((item) => safeScore >= item.min && safeScore <= item.max) ?? rankBands[0];
  const code = asRankCode(band.code);
  const span = Math.max(0.01, band.max - band.min);
  const position = (safeScore - band.min) / span;
  const tier: RankTier = position < 1 / 3 ? "minus" : position < 2 / 3 ? "neutral" : "plus";
  const suffix = tier === "minus" ? "-" : tier === "plus" ? "+" : "";

  return {
    code,
    tier,
    label: `${code}${suffix}`,
    min: band.min,
    max: band.max,
    score: safeScore
  };
}

export function getRankVisualByScore(score: number): RankVisual {
  return getRankVisualByCode(getDisplayRank(score).code);
}

export function getTierOpacity(tier: RankTier) {
  if (tier === "minus") return 0.72;
  if (tier === "plus") return 1;
  return 0.86;
}

export function getNextRankTarget(score: number) {
  const display = getDisplayRank(score);
  const band = rankBands.find((item) => item.code === display.code) ?? rankBands[0];
  const span = Math.max(0.01, band.max - band.min);
  const nextTierTarget =
    display.tier === "minus"
      ? band.min + span / 3
      : display.tier === "neutral"
        ? band.min + (span * 2) / 3
        : band.max;

  return {
    current: display,
    targetScore: Math.min(100, nextTierTarget),
    percent: Math.max(0, Math.min(100, ((score - band.min) / span) * 100))
  };
}
