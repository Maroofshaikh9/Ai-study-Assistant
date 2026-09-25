import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import QuizForm from "./QuizForm";

export default async function QuizPage() {
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
      
      notes = docs.map(doc => ({
        id: doc._id.toString(),
        filename: doc.filename
      }));
    }
  } catch (error) {
    console.error("Failed to load notes for quiz:", error);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI Quiz</h1>
        <p className="text-slate-500 mt-1">
          Answer multiple-choice questions generated from your notes.
        </p>
      </div>

      <QuizForm initialNotes={notes} />
    </div>
  );
}
