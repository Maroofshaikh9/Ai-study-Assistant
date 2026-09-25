import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminNotesClient from "./AdminNotesClient";

export default async function AdminNotesPage() {
  const session = await getServerSession(authOptions);
  let notes: { id: string; filename: string; size: number; createdAt: string; ownerName: string; ownerEmail: string }[] = [];

  try {
    if (session?.user?.role === "admin") {
      const db = await getDb();
      const docs = await db
        .collection("documents")
        .aggregate([
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $project: {
              filename: 1,
              size: 1,
              createdAt: 1,
              ownerName: { $arrayElemAt: ["$owner.name", 0] },
              ownerEmail: { $arrayElemAt: ["$owner.email", 0] },
            },
          },
        ])
        .toArray();

      notes = docs.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size || 0,
        createdAt: doc.createdAt.toISOString(),
        ownerName: doc.ownerName || "Unknown",
        ownerEmail: doc.ownerEmail || "",
      }));
    }
  } catch (error) {
    console.error("Failed to load admin notes:", error);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Notes</h1>
        <p className="text-slate-500 mt-1">View and remove uploaded student PDFs.</p>
      </div>
      
      <AdminNotesClient initialNotes={notes} />
    </div>
  );
}
