import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import NotesClient from "./NotesClient";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  let notes: { id: string; filename: string; size: number; createdAt: string }[] = [];

  try {
    if (session?.user?.id) {
      const db = await getDb();
      const docs = await db
        .collection("documents")
        .find({ userId: new ObjectId(session.user.id) })
        .project({ filename: 1, size: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .toArray();
      
      notes = docs.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size || 0,
        createdAt: doc.createdAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Failed to load notes:", error);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          My Study Materials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and organize your course PDFs, lecture slides, and notes for AI analysis.
        </p>
      </div>

      <NotesClient initialNotes={notes} />
    </div>
  );
}
