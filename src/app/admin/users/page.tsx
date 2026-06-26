
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/page-auth";
import { AdminNav } from "@/components/account/admin-nav";

export default async function AdminUsersPage() {
  await requireAdminPage();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      status: true,
      ageSnapshot: true,
      ageGroup: true,
      occupation: true,
      regionName: true,
      currentOverallScore: true,
      currentRankCode: true,
      lastActiveAt: true
    }
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[220px,1fr]">
      <AdminNav />
      <div className="card overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="section-title">Users</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-muted">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Occupation</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-xs text-muted">{user.email ?? user.id}</div>
                  </td>
                  <td className="px-4 py-3">{user.userType}</td>
                  <td className="px-4 py-3">{user.ageSnapshot ?? "-"}</td>
                  <td className="px-4 py-3">{user.occupation ?? "-"}</td>
                  <td className="px-4 py-3">{user.regionName}</td>
                  <td className="px-4 py-3">{user.currentOverallScore.toFixed(2)}</td>
                  <td className="px-4 py-3">{user.currentRankCode}</td>
                  <td className="px-4 py-3">
                    <Link className="ghost-btn" href={`/admin/users/${user.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
