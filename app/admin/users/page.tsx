import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import UsersClient from "./UsersClient";

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
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 mt-1">Manage registered students and admins.</p>
      </div>
      
      <UsersClient initialUsers={users} />
    </div>
  );
}
