
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { safeJson } from "@/lib/safe-json";
import { useAppData } from "@/components/providers/app-data-provider";

type AuthResponse = {
  message?: string;
  nextPath?: string;
};

export function AuthPanel() {
  const router = useRouter();
  const { data, refresh, reset } = useAppData();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(path: string) {
    setBusy(true);
    setMessage("");

    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await safeJson<AuthResponse>(response);

    if (!response.ok) {
      setBusy(false);
      setMessage(payload?.message ?? "Request failed.");
      return;
    }

    reset();
    const bootstrap = await refresh(true);
    setBusy(false);

    const nextPath = payload?.nextPath ?? (bootstrap.user?.hasCompletedInitialMeasurement ? "/tasks" : "/measure");

    router.replace(nextPath);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.replace("/auth");
    router.refresh();
  }

  if (data.authenticated && data.user) {
    return (
      <div className="space-y-4">
        <section className="card p-4">
          <div className="section-title">Signed in</div>
          <div className="mt-1 text-sm text-muted">{data.user.email}</div>
        </section>
        <section className="card grid grid-cols-2 gap-3 p-4">
          <button
            className="action-btn"
            onClick={() => router.replace(data.user?.hasCompletedInitialMeasurement ? "/tasks" : "/measure")}
            type="button"
          >
            Continue
          </button>
          <button className="ghost-btn" onClick={logout} type="button">Logout</button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="badge">OpenBeta</div>
        <h2 className="mt-3 text-2xl font-black">Sign in</h2>
      </section>

      <section className="card space-y-3 p-4">
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <button className="action-btn" disabled={busy} onClick={() => void submit("/api/auth/login")} type="button">
            {busy ? "Working..." : "Login"}
          </button>
          <button className="ghost-btn" disabled={busy} onClick={() => void submit("/api/auth/register")} type="button">
            {busy ? "Working..." : "Register"}
          </button>
        </div>
        {message ? <div className="text-sm text-rose-300">{message}</div> : null}
      </section>
    </div>
  );
}
