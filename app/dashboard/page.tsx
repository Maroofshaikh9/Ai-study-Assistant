import Link from "next/link";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { formatDate } from "@/lib/format";
import {
  FileText,
  Sparkles,
  BrainCircuit,
  Layers,
  MessageSquareCode,
  UploadCloud,
  ArrowRight,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const studyActions = [
  {
    href: "/dashboard/notes",
    title: "Upload & Notes",
    text: "Upload new lecture slides, handouts, and research PDFs.",
    badge: "Document Hub",
    icon: UploadCloud,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  {
    href: "/dashboard/summary",
    title: "AI Summary",
    text: "Synthesize 50-page notes into concise exam takeaways.",
    badge: "Quick Revision",
    icon: Sparkles,
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 text-teal-700 border-teal-200/60",
  },
  {
    href: "/dashboard/quiz",
    title: "AI Quiz Practice",
    text: "Generate instant multiple-choice quizzes with explanations.",
    badge: "Active Recall",
    icon: BrainCircuit,
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
  },
  {
    href: "/dashboard/flashcards",
    title: "3D Flashcards",
    text: "Master definitions, formulas, and terminology card by card.",
    badge: "Memory Drill",
    icon: Layers,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 text-violet-700 border-violet-200/60",
  },
  {
    href: "/dashboard/chat",
    title: "Study Doubt Chat",
    text: "Ask questions directly to your PDF with zero hallucination.",
    badge: "24/7 AI Tutor",
    icon: MessageSquareCode,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  let notes: { _id: ObjectId; filename: string; createdAt: Date }[] = [];
  let totalDocsCount = 0;
  let dbError = "";

  try {
    const db = await getDb();
    const userObjectId = new ObjectId(session!.user.id);

    totalDocsCount = await db
      .collection("documents")
      .countDocuments({ userId: userObjectId });

    notes = (await db
      .collection("documents")
      .find({ userId: userObjectId })
      .project({ filename: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()) as { _id: ObjectId; filename: string; createdAt: Date }[];
  } catch {
    dbError = "Could not load notes from the database.";
  }

  const firstName = session?.user.name ? session.user.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-emerald-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Study Workspace Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload your lecture slides or textbook PDFs to generate AI summaries, interactive quizzes, flashcards, or ask study doubts.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/notes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 shadow-md shadow-white/10 hover:-translate-y-0.5 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-brand-700" />
              <span>Upload New PDF</span>
            </Link>
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Ask Tutor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Notes</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalDocsCount}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Uploaded PDFs</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Modules</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <BrainCircuit className="w-4 h-4 text-cyan-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">4 Active</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Summary, Quiz, Cards, Chat</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">LLM Inference</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">Groq API</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">LLaMA 3.1 8B Instant</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">Student</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Verified &amp; Protected</p>
        </div>
      </div>

      {/* AI Study Tools Suite */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Study Tools &amp; Workspaces</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">Select any tool to begin</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {studyActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-3xl border border-slate-200/90 bg-white p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${action.gradient} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${action.bg}`}>
                      {action.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {action.text}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Uploaded Notes */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Study Materials</h2>
            <p className="text-xs text-slate-500 mt-0.5">PDF documents ready for AI analysis</p>
          </div>
          <Link
            href="/dashboard/notes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <span>View All Notes ({totalDocsCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dbError ? (
          <p className="mt-4 text-xs font-medium text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            {dbError}
          </p>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No study notes uploaded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your lecture slides or textbooks to start generating quizzes, summaries, and flashcards.
              </p>
            </div>
            <Link
              href="/dashboard/notes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Your First PDF</span>
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {notes.map((note) => (
              <div
                key={note._id.toString()}
                className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-700 transition-colors">
                      {note.filename}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/summary?doc=${note._id.toString()}`}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200/50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Summary
                  </Link>
                  <Link
                    href={`/dashboard/quiz?doc=${note._id.toString()}`}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200/50 transition-colors"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Quiz
                  </Link>
                  <Link
                    href="/dashboard/notes"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Manage file"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
