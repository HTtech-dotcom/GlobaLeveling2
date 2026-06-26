"use client";

import { useEffect } from "react";

export function CompletionToast({ toast, onClose }: { toast: { metricCode: string; reward: number } | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm">
      <div className="card p-4 shadow-[0_0_40px_rgba(55,183,255,0.22)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-black">Task Completed</div>
            <div className="mt-1 text-sm text-sky-100/90">{toast.metricCode} +{toast.reward.toFixed(2)} pts</div>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm" onClick={onClose} type="button">X</button>
        </div>
      </div>
    </div>
  );
}
