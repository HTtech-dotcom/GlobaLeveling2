"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/providers/app-data-provider";
import { safeJson } from "@/lib/safe-json";
import { normalizeProfessionCode, professionOptions } from "@/config/job-taxonomy";

const regionOptions = [
  { value: "VN-HN", label: "Hanoi" },
  { value: "VN-HCM", label: "Ho Chi Minh City" },
  { value: "VN-DN", label: "Da Nang" },
  { value: "SG-SG", label: "Singapore" },
  { value: "OTHER", label: "Other" }
];

export function AccountPanel() {
  const router = useRouter();
  const { data, applyBootstrapPatch, reset } = useAppData();
  const [profile, setProfile] = useState({
    name: "",
    age: "25",
    occupation: "general_professional",
    regionCode: "VN-HCM",
    currentPlanCode: "balanced",
    trainingIntensity: "balanced",
    theme: "dark"
  });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const hydratedAccountUserIdRef = useRef<string | null>(null);
  const [isProfileDirty, setIsProfileDirty] = useState(false);

  useEffect(() => {
    const nextUserId = data.user?.id ?? null;

    if (!nextUserId) return;
    if (hydratedAccountUserIdRef.current === nextUserId && isProfileDirty) return;

    setProfile({
      name: data.user?.name ?? "",
      age: String(data.user?.age ?? 25),
      occupation: normalizeProfessionCode(data.user?.occupation),
      regionCode: data.user?.regionCode ?? "VN-HCM",
      currentPlanCode: data.user?.currentPlanCode ?? "balanced",
      trainingIntensity: data.user?.trainingIntensity ?? "balanced",
      theme: data.user?.theme ?? "dark"
    });

    hydratedAccountUserIdRef.current = nextUserId;
  }, [data.user, isProfileDirty]);

  function updateProfile(patch: Partial<typeof profile>) {
    setIsProfileDirty(true);
    setProfile((current) => ({ ...current, ...patch }));
  }

  async function saveProfile() {
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, age: Number(profile.age) })
    });
    const payload = await safeJson<{ message?: string; user?: typeof data.user }>(response);
    setMessage(payload?.message ?? "Saved.");

    if (response.ok && payload?.user) {
      applyBootstrapPatch({ user: payload.user });

      setProfile({
        name: payload.user?.name ?? "",
        age: String(payload.user?.age ?? 25),
        occupation: normalizeProfessionCode(payload.user?.occupation),
        regionCode: payload.user?.regionCode ?? "VN-HCM",
        currentPlanCode: payload.user?.currentPlanCode ?? "balanced",
        trainingIntensity: payload.user?.trainingIntensity ?? "balanced",
        theme: payload.user?.theme ?? "dark"
      });

      hydratedAccountUserIdRef.current = payload.user.id;
      setIsProfileDirty(false);
    }
  }

  async function changePassword() {
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(password)
    });
    const payload = await safeJson<{ message?: string }>(response);
    setMessage(payload?.message ?? "Updated.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="section-title">Account</div>
        <div className="mt-1 text-sm text-muted">{data.user?.email}</div>
      </section>

      <section className="card space-y-3 p-4">
        <div className="section-title">Profile</div>
        <input className="input" placeholder="Display name" value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} />
        <input className="input" type="number" placeholder="Age" value={profile.age} onChange={(event) => updateProfile({ age: event.target.value })} />
        <select className="input" value={profile.occupation} onChange={(event) => updateProfile({ occupation: event.target.value })}>
          {professionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="input" value={profile.regionCode} onChange={(event) => updateProfile({ regionCode: event.target.value })}>
          {regionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="input" value={profile.currentPlanCode} onChange={(event) => updateProfile({ currentPlanCode: event.target.value })}>
          <option value="balanced">Balanced</option>
          <option value="custom">Custom</option>
          <option value="physique_oriented">Focus on physique</option>
          <option value="intelligent_oriented">Focus on int</option>
        </select>
        <select className="input" value={profile.trainingIntensity} onChange={(event) => updateProfile({ trainingIntensity: event.target.value })}>
          <option value="balanced">Balanced</option>
          <option value="slow">Slow</option>
          <option value="fast">Fast</option>
        </select>
        <select className="input" value={profile.theme} onChange={(event) => updateProfile({ theme: event.target.value })}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <button className="action-btn w-full" onClick={() => void saveProfile()} type="button">Save account</button>
      </section>

      <section className="card space-y-3 p-4">
        <div className="section-title">Change password</div>
        <input className="input" type="password" placeholder="Current password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} />
        <input className="input" type="password" placeholder="New password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} />
        <button className="action-btn w-full" onClick={() => void changePassword()} type="button">Update password</button>
      </section>

      <section className="card p-4">
        <button className="ghost-btn w-full" onClick={() => void logout()} type="button">Logout</button>
        {message ? <div className="mt-3 text-sm text-sky-200">{message}</div> : null}
      </section>
    </div>
  );
}
