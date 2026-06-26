
import Link from "next/link";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/results", label: "Results" },
  { href: "/admin/logic", label: "Logic" },
  { href: "/admin/export", label: "Export" }
];

export function AdminNav() {
  return (
    <aside className="card h-fit p-4">
      <div className="section-title">GlobaLeveling</div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <Link key={item.href} className="ghost-btn text-center" href={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
