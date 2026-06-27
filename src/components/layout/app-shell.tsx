
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/measure", label: "Measure" },
  { href: "/stats", label: "Stats" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";
  const isAdmin = pathname.startsWith("/admin");
  const showNav = !isAuth && !isAdmin;
  const contentWidthClass = isAdmin ? "max-w-6xl" : "max-w-md";

  return (
    <div className={`mx-auto flex min-h-screen w-full ${contentWidthClass} flex-col px-4 pb-6 pt-5`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="app-brand">
          <img
            src="/effects/globaleveling-logo.png"
            alt="GlobaLeveling"
            className="app-brand-logo"
          />

          {isAdmin ? (
            <span className="app-brand-admin-label">ADMIN</span>
          ) : null}
        </div>
        <div className="badge">{isAdmin ? "GlobaLeveling" : "OpenBeta"}</div>
      </div>

      <main className="flex-1">{children}</main>

      {showNav ? (
        <nav className="bottom-nav mt-5 grid grid-cols-3 gap-2 rounded-2xl p-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`rounded-2xl px-3 py-3 text-center text-sm font-bold ${active ? "nav-active" : "text-muted"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
