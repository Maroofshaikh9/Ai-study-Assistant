import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminNotesClient from "./AdminNotesClient";
import { FileText } from "lucide-react";

export default async function AdminNotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

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
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/60 text-violet-800 text-xs font-semibold tracking-wide uppercase mb-2">
            <FileText className="w-3.5 h-3.5 text-violet-600" />
            Repository Audit
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Document Repository
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">
            Global catalog of all student-uploaded PDF lecture materials, file sizes, and owner attribution.
          </p>
        </div>
      </div>

      <AdminNotesClient initialNotes={notes} />
    </div>
  );
}
