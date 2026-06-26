
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { safeJson } from "@/lib/safe-json";
import { calculateRank, type RankSummary } from "@/features/rank";

export type MetricSummary = {
  metricCode: string;
  metricName: string;
  score: number;
  rankCode?: string;
  confidenceStatus?: string;
  rawValue?: Record<string, unknown> | null;
};

export type UserSummary = {
  id: string;
  email: string | null;
  name: string;
  role: string;
  userType: string;
  age: number;
  ageGroup: string;
  gender: string;
  occupation: string | null;
  occupationCategory?: string | null;
  regionCode: string;
  regionName: string;
  currentJobCode: string;
  currentRankCode: string;
  currentOverallScore: number;
  theme: string;
  currentPlanCode: string;
  trainingIntensity: string;
  hasCompletedInitialMeasurement: boolean;
};

export type BootstrapData = {
  authenticated: boolean;
  user: UserSummary | null;
  metrics: MetricSummary[];
  rank: RankSummary | null;
};

const emptyState: BootstrapData = {
  authenticated: false,
  user: null,
  metrics: [],
  rank: null
};

type AppDataContextValue = {
  data: BootstrapData;
  loading: boolean;
  hydrated: boolean;
  refresh: (force?: boolean) => Promise<BootstrapData>;
  reset: () => void;
  applyBootstrapPatch: (patch: Partial<BootstrapData>) => void;
  updateTaskRewardImpact: (metricCode: string, delta: number) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapData>(emptyState);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const lastFetchRef = useRef(0);
  const dataRef = useRef<BootstrapData>(emptyState);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const applyDocumentTheme = useCallback((theme: string | null | undefined) => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  }, []);

  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 400) {
      return dataRef.current;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bootstrap", { cache: "no-store" });
      const json = await safeJson<BootstrapData>(response);

      if (!response.ok || !json) {
        dataRef.current = emptyState;
        setData(emptyState);
        setLoading(false);
        setHydrated(true);
        applyDocumentTheme("dark");
        return emptyState;
      }

      dataRef.current = json;
      setData(json);
      setLoading(false);
      setHydrated(true);
      lastFetchRef.current = Date.now();
      applyDocumentTheme(json.user?.theme);
      return json;
    } catch {
      dataRef.current = emptyState;
      setData(emptyState);
      setLoading(false);
      setHydrated(true);
      applyDocumentTheme("dark");
      return emptyState;
    }
  }, [applyDocumentTheme]);

  const reset = useCallback(() => {
    dataRef.current = emptyState;
    setData(emptyState);
    setHydrated(true);
    applyDocumentTheme("dark");
  }, [applyDocumentTheme]);

  const applyBootstrapPatch = useCallback((patch: Partial<BootstrapData>) => {
    setData((current) => {
      const nextMetrics = patch.metrics ?? current.metrics;
      const nextRank = patch.rank ?? (nextMetrics.length ? calculateRank(nextMetrics) : null);
      const nextUser = patch.user === undefined
        ? current.user
        : patch.user
          ? {
              ...patch.user,
              ...(nextRank
                ? {
                    currentRankCode: nextRank.currentRankCode,
                    currentOverallScore: nextRank.overallScore
                  }
                : {})
            }
          : null;

      const next: BootstrapData = {
        authenticated: patch.authenticated ?? current.authenticated,
        user: nextUser,
        metrics: nextMetrics,
        rank: nextRank
      };

      dataRef.current = next;
      applyDocumentTheme(next.user?.theme);
      return next;
    });
  }, [applyDocumentTheme]);

  const updateTaskRewardImpact = useCallback((metricCode: string, delta: number) => {
    setData((current) => {
      const metrics = current.metrics.map((metric) =>
        metric.metricCode === metricCode
          ? { ...metric, score: Math.max(0, Math.min(100, Number((metric.score + delta).toFixed(3)))) }
          : metric
      );
      const rank = calculateRank(metrics);

      const next = {
        ...current,
        metrics,
        rank,
        user: current.user
          ? {
              ...current.user,
              currentRankCode: rank.currentRankCode,
              currentOverallScore: rank.overallScore
            }
          : null
      };
      dataRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    void refresh(true);
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, hydrated, refresh, reset, applyBootstrapPatch, updateTaskRewardImpact }),
    [data, loading, hydrated, refresh, reset, applyBootstrapPatch, updateTaskRewardImpact]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
