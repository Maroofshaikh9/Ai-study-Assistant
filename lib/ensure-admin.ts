import bcrypt from "bcryptjs";
import { Db } from "mongodb";

export async function ensureAdmin(db: Db) {
  const email = (process.env.ADMIN_EMAIL || "admin@studymate.local")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection("users").insertOne({
    name: "Admin",
    email,
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
  });
}
