import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import FlashcardsForm from "./FlashcardsForm";
import { Layers } from "lucide-react";

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  let notes: { id: string; filename: string }[] = [];

  try {
    if (session?.user?.id) {
      const db = await getDb();
      const docs = await db
        .collection("documents")
        .find({ userId: new ObjectId(session.user.id) })
        .project({ filename: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();

      notes = docs.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
      }));
    }
  } catch (error) {
    console.error("Failed to load notes for flashcards:", error);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-800 text-xs font-semibold tracking-wide uppercase mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-600" />
            Spaced Repetition
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Interactive AI Flashcards
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            Master core definitions, key equations, and conceptual questions with 3D flip cards generated from your notes.
          </p>
        </div>
      </div>

      <FlashcardsForm initialNotes={notes} />
    </div>
  );
}
