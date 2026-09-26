import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import UsersClient from "./UsersClient";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  let users: { id: string; name: string; email: string; role: string; createdAt: string; notes: number }[] = [];

  try {
    if (session?.user?.role === "admin") {
      const db = await getDb();
      const docs = await db
        .collection("users")
        .find({})
        .project({ password: 0 })
        .sort({ createdAt: -1 })
        .toArray();

      const counts = await db
        .collection("documents")
        .aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }])
        .toArray();

      const countMap = new Map(
        counts.map((item) => [item._id.toString(), item.count])
      );

      users = docs.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        notes: countMap.get(user._id.toString()) || 0,
      }));
    }
  } catch (error) {
    console.error("Failed to load users:", error);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-brand-600" />
            User Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            User Accounts & Roles
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            Browse registered student and administrator accounts, inspect upload volume, and administer access.
          </p>
        </div>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  );
}
