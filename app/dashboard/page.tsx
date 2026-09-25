import Link from "next/link";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { formatDate } from "@/lib/format";

const actions = [
  {
    href: "/dashboard/notes",
    title: "Upload Notes",
    text: "Add a PDF from your class notes.",
  },
  {
    href: "/dashboard/summary",
    title: "AI Summary",
    text: "Generate a short revision summary.",
  },
  {
    href: "/dashboard/quiz",
    title: "AI Quiz",
    text: "Practice with questions from your notes.",
  },
  {
    href: "/dashboard/flashcards",
    title: "AI Flashcards",
    text: "Review terms and definitions.",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  let notes: { _id: ObjectId; filename: string; createdAt: Date }[] = [];
  let dbError = "";

  try {
    const db = await getDb();
    notes = (await db
      .collection("documents")
      .find({ userId: new ObjectId(session!.user.id) })
      .project({ filename: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()) as { _id: ObjectId; filename: string; createdAt: Date }[];
  } catch {
    dbError = "Could not load notes from the database.";
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {session?.user.name}
        </h1>
        <p className="text-slate-500 mt-1">
          Upload notes and use AI tools to study faster.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="card p-5">
            <h2 className="font-semibold text-brand-800">{action.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{action.text}</p>
          </Link>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">Recent Notes</h2>
          <Link href="/dashboard/notes" className="text-sm text-brand-700">
            View all
          </Link>
        </div>
        {dbError ? (
          <p className="mt-4 text-sm text-red-700">{dbError}</p>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No notes yet. Upload a PDF to get started.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {notes.map((note) => (
              <li
                key={note._id.toString()}
                className="py-3 flex items-center justify-between gap-4"
              >
                <span className="text-sm text-slate-700 truncate">
                  {note.filename}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {formatDate(note.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
