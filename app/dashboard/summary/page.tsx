import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import SummaryForm from "./SummaryForm";

export default async function SummaryPage() {
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
    console.error("Failed to load notes for summary:", error);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          AI Document Summary
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Synthesize long PDF lecture notes into structured, high-retention revision summaries.
        </p>
      </div>

      <SummaryForm initialNotes={notes} />
    </div>
  );
}
