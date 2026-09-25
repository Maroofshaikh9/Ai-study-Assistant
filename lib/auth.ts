import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Please enter a valid email address, such as name@gmail.com.");
        }

        const db = await getDb();
        const user = await db.collection("users").findOne({ email });

        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
          throw new Error("Too many incorrect attempts. Please try again in 1:00.");
        }

        const passwordOk = await bcrypt.compare(credentials.password, user.password);

        if (!passwordOk) {
          const attempts = (user.failedLoginAttempts || 0) + 1;
          if (attempts >= 6) {
            await db.collection("users").updateOne(
              { _id: user._id },
              {
                $set: {
                  lockedUntil: new Date(Date.now() + 60000), // 1 minute
                  failedLoginAttempts: 0,
                },
              }
            );
            throw new Error("Too many incorrect attempts. Please try again in 1:00.");
          } else {
            await db.collection("users").updateOne(
              { _id: user._id },
              { $set: { failedLoginAttempts: attempts } }
            );
            throw new Error(`Invalid email or password. ${6 - attempts} attempts remaining.`);
          }
        }

        if (user.isVerified === false) {
          throw new Error("Please verify your email address before logging in.");
        }

        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { failedLoginAttempts: 0 }, $unset: { lockedUntil: "" } }
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        const db = await getDb();
        const email = user.email.trim().toLowerCase();
        const existing = await db.collection("users").findOne({ email });

        if (!existing) {
          const result = await db.collection("users").insertOne({
            name: user.name,
            email,
            isVerified: true,
            role: "student",
            createdAt: new Date(),
          });
          user.id = result.insertedId.toString();
        } else {
          // If a user exists but doesn't have isVerified flag set
          if (!existing.isVerified) {
             await db.collection("users").updateOne({ _id: existing._id }, { $set: { isVerified: true } });
          }
          user.id = existing._id.toString();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any).role = existing.role;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      if (token.id) {
        try {
          const db = await getDb();
          const { ObjectId } = await import("mongodb");
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(token.id as string) });
          if (dbUser) {
            token.role = dbUser.role || "student";
          }
        } catch {
          // fallback
          token.role = token.role || "student";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
