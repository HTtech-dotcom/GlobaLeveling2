"use client";

import { useEffect } from "react";
import { getRankVisualByCode } from "@/config/rank-visual";

export type CompletionToastState = {
  metricCode: string;
  reward: number;
  eventType?: "task_reward" | "skill_rank_up" | "overall_rank_up";
  previousMetricRank?: string;
  nextMetricRank?: string;
  previousOverallRank?: string;
  nextOverallRank?: string;
};

type PromotionTheme = "gold" | "fire" | "mythic" | "standard";

function rankBase(rank: string | undefined | null) {
  const cleaned = String(rank ?? "").replace(/[+-]/g, "");
  return cleaned === "SS" || cleaned === "S" || cleaned === "A" || cleaned === "B" || cleaned === "C" || cleaned === "D" || cleaned === "E" ? cleaned : "C";
}

function getPromotionTheme(previousRank: string | undefined, nextRank: string | undefined): PromotionTheme {
  const previous = rankBase(previousRank);
  const next = rankBase(nextRank);
  if (previous === "B" && next === "A") return "gold";
  if (previous === "A" && next === "S") return "fire";
  if (previous === "S" && next === "SS") return "mythic";
  if (next === "A") return "gold";
  if (next === "S") return "fire";
  if (next === "SS") return "mythic";
  return "standard";
}

export function CompletionToast({ toast, onClose, gender = "male" }: { toast: CompletionToastState | null; onClose: () => void; gender?: string }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, toast.eventType === "overall_rank_up" ? 8200 : 4200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const nextRank = toast.eventType === "overall_rank_up" ? toast.nextOverallRank : toast.nextMetricRank;
  const rankCode = rankBase(nextRank);
  const visual = getRankVisualByCode(rankCode);
  const isOverall = toast.eventType === "overall_rank_up";
  const isSkillRankUp = toast.eventType === "skill_rank_up";
  const isFireRank = visual.code === "S";
  const silhouetteClass = gender === "female" ? "rank-silhouette-female" : "rank-silhouette-male";
  const formLabel = gender === "female" ? "FEMALE FORM" : "MALE FORM";
  const promotionTheme = getPromotionTheme(toast.previousOverallRank, toast.nextOverallRank);
  const useLivePromotion = isOverall && promotionTheme !== "standard";
  const particleSpans = Array.from({ length: 22 }, (_, index) => <span key={index} />);

  return (
    <div className={isOverall ? "fixed inset-0 z-50 grid place-items-center bg-black/64 px-4 backdrop-blur-md" : "fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-[24rem]"}>
      <div
        className={`reward-popup ${visual.effectClass} ${isOverall ? "reward-popup-overall" : ""} ${useLivePromotion ? `live-promotion-modal live-promotion-${promotionTheme}` : ""}`}
        style={{
          ["--rank-color" as string]: visual.color,
          ["--rank-glow" as string]: visual.glowColor,
          ["--rank-border" as string]: visual.borderColor,
          ["--rank-gradient" as string]: visual.gradient
        }}
      >
        <button className="reward-close" onClick={onClose} type="button" aria-label="Close reward popup">×</button>

        {useLivePromotion ? (
          <div className="live-promotion-scene" role="img" aria-label={`Rank promotion from ${toast.previousOverallRank} to ${toast.nextOverallRank}`}>
            <div className="live-promotion-runes" aria-hidden="true"><span /><span /><span /></div>
            <div className="live-promotion-particles" aria-hidden="true">{particleSpans}</div>
            <div className="live-promotion-header">
              <span>RANK PROMOTION</span>
            </div>

            <div className="live-rank-flow" aria-hidden="true">
              <span className="live-rank-old">{toast.previousOverallRank}</span>
              <span className="live-forge-core"><i /><b /><b /></span>
              <span className="live-rank-new" data-rank={toast.nextOverallRank}>{toast.nextOverallRank}</span>
            </div>

            <div className={`live-avatar ${silhouetteClass}`} aria-hidden="true">
              <span className="live-avatar-halo" />
              <span className="live-avatar-light" />
              <span className="live-avatar-asset" />
              <span className="live-avatar-head" />
              <span className="live-avatar-torso" />
              <span className="live-avatar-arm live-avatar-arm-left" />
              <span className="live-avatar-arm live-avatar-arm-right" />
              <span className="live-avatar-leg live-avatar-leg-left" />
              <span className="live-avatar-leg live-avatar-leg-right" />
              <span className="live-avatar-chest" data-rank={toast.nextOverallRank}>{rankBase(toast.nextOverallRank)}</span>
            </div>

            <div className="live-platform" aria-hidden="true"><span /><span /><span /></div>
          </div>
        ) : isOverall ? (
          <div className="overall-rankup-scene">
            <div className="rankup-burst" />
            <div className="rankup-ring rankup-ring-one" />
            <div className="rankup-ring rankup-ring-two" />
            <div className="rankup-particles" />

            <div className="rank-promotion-track" aria-hidden="true">
              <div className="promotion-rank promotion-rank-old">{toast.previousOverallRank}</div>
              <div className="promotion-forge">
                <span className="forge-core" />
                <span className="forge-wing forge-wing-left" />
                <span className="forge-wing forge-wing-right" />
              </div>
              <div className={`promotion-rank promotion-rank-new ${isFireRank ? "fire-rank-text" : ""}`} data-rank={toast.nextOverallRank} style={{ color: visual.color }}>{toast.nextOverallRank}</div>
            </div>

            <div className={`rank-silhouette ${silhouetteClass}`}>
              <span className="silhouette-aura" />
              <span className="silhouette-hair" />
              <span className="silhouette-head" />
              <span className="silhouette-body" />
              <span className="silhouette-arm silhouette-arm-left" />
              <span className="silhouette-arm silhouette-arm-right" />
              <span className={`rank-chest ${visual.effectClass} ${isFireRank ? "fire-rank-text" : ""}`} data-rank={toast.nextOverallRank} style={{ color: visual.color }}>{toast.nextOverallRank}</span>
            </div>
            <div className="text-center">
              <div className="reward-kicker">RANK PROMOTION</div>
              <div className={`reward-title reward-title-xl ${isFireRank ? "fire-rank-text" : ""}`} data-rank={`${toast.previousOverallRank} → ${toast.nextOverallRank}`} style={{ color: visual.color }}>
                {toast.previousOverallRank} → {toast.nextOverallRank}
              </div>
            </div>
          </div>
        ) : isSkillRankUp ? (
          <div className="flex items-center gap-4">
            <div className={`reward-icon ${visual.effectClass}`} style={{ color: visual.color }}>{toast.metricCode}</div>
            <div className="min-w-0 flex-1">
              <div className="reward-kicker">SKILL RANK UP</div>
              <div className={`reward-title ${isFireRank ? "fire-rank-text" : ""}`} data-rank={`${toast.previousMetricRank} → ${toast.nextMetricRank}`} style={{ color: visual.color }}>
                {toast.previousMetricRank} → {toast.nextMetricRank}
              </div>
              <div className="reward-subtitle">{toast.metricCode}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="reward-icon reward-icon-green">↗</div>
            <div className="min-w-0 flex-1">
              <div className="reward-kicker">TASK COMPLETED</div>
              <div className="reward-title reward-title-green">
                {toast.metricCode} +{toast.reward.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
