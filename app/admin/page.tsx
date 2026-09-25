import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  let users = 0;
  let admins = 0;
  let notes = 0;
  let dbError = "";

  try {
    const db = await getDb();
    users = await db.collection("users").countDocuments({ role: "student" });
    admins = await db.collection("users").countDocuments({ role: "admin" });
    notes = await db.collection("documents").countDocuments();
  } catch {
    dbError = "Could not load statistics from the database.";
  }

  const cards = [
    { title: "Students", value: users },
    { title: "Admins", value: admins },
    { title: "Uploaded Notes", value: notes },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of users and uploaded notes.</p>
      </div>
      {dbError && <p className="text-sm text-red-700">{dbError}</p>}
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="card p-5">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-brand-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
