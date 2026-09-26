import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import Link from "next/link";
import { Users, ShieldCheck, FileText, ArrowRight, Activity, ArrowUpRight } from "lucide-react";

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

  const statCards = [
    {
      title: "Registered Students",
      value: users,
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      description: "Active student learner accounts",
      link: "/admin/users",
    },
    {
      title: "Platform Admins",
      value: admins,
      icon: ShieldCheck,
      gradient: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
      description: "Full system administrators",
      link: "/admin/users",
    },
    {
      title: "Uploaded Documents",
      value: notes,
      icon: FileText,
      gradient: "from-violet-500 to-indigo-600",
      bgLight: "bg-violet-50 text-violet-700 border-violet-200/60",
      description: "Total indexed lecture PDFs",
      link: "/admin/notes",
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide uppercase mb-2">
            <Activity className="w-3.5 h-3.5 text-brand-400" />
            System Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Administrator Console
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            Real-time telemetry, user account control, and repository management.
          </p>
        </div>
      </div>

      {dbError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {dbError}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.link}
              className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bgLight} shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Management Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500">Inspect registered students and role assignments.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Review all registered student accounts, verify email timestamps, document upload activity, or revoke student access.
          </p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800"
          >
            Open User Directory
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Document Repository</h3>
              <p className="text-xs text-slate-500">Monitor and moderate uploaded PDF notes.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Browse all PDF lecture notes uploaded across student accounts, inspect metadata, and purge orphaned or inappropriate files.
          </p>
          <Link
            href="/admin/notes"
            className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 hover:text-violet-800"
          >
            Inspect All Notes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
