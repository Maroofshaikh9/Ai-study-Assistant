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
      
      notes = docs.map(doc => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size || 0,
        createdAt: doc.createdAt.toISOString()
      }));
    }
  } catch (error) {
    console.error("Failed to load notes:", error);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Notes</h1>
        <p className="text-slate-500 mt-1">Upload PDF notes. Maximum size is 5 MB.</p>
      </div>

      <NotesClient initialNotes={notes} />
    </div>
  );
}
