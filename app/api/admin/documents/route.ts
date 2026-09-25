import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const db = await getDb();
    const documents = await db
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

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size,
        createdAt: doc.createdAt,
        ownerName: doc.ownerName || "Unknown",
        ownerEmail: doc.ownerEmail || "",
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load notes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
