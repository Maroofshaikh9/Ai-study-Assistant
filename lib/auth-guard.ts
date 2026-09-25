import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions } from "./auth";
import { getDb } from "./mongodb";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      ),
    };
  }

  try {
    const db = await getDb();
    const dbUser = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
    if (!dbUser) {
      return {
        error: NextResponse.json(
          { error: "Account no longer exists." },
          { status: 401 }
        ),
      };
    }
    // Override session role with the freshest DB role
    session.user.role = dbUser.role || "student";
  } catch {
    return {
      error: NextResponse.json(
        { error: "Internal server error during authorization." },
        { status: 500 }
      ),
    };
  }

  return { session };
}

export async function requireStudent() {
  const result = await requireUser();
  if ("error" in result) {
    return result;
  }

  if (result.session.user.role !== "student") {
    return {
      error: NextResponse.json(
        { error: "Student access only." },
        { status: 403 }
      ),
    };
  }

  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if ("error" in result) {
    return result;
  }

  if (result.session.user.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Admin access only." },
        { status: 403 }
      ),
    };
  }

  return result;
}

// Students can only read documents they uploaded.
export async function getOwnedDocument(userId: string, documentId: string) {
  if (!ObjectId.isValid(documentId)) {
    return { error: "Document not found." };
  }

  const db = await getDb();
  const document = await db.collection("documents").findOne({
    _id: new ObjectId(documentId),
    userId: new ObjectId(userId),
  });

  if (!document) {
    return { error: "Document not found." };
  }

  return { document };
}
