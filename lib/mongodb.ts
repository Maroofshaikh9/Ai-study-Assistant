import { MongoClient, Db } from "mongodb";
import { ensureAdmin } from "./ensure-admin";

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoDbInitDone?: boolean;
};

let clientPromise: Promise<MongoClient> | null = null;
let dbInitDone = false;

import dns from "dns";

async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;
  try {
    const url = new URL(uri);
    const resolver = new dns.promises.Resolver();
    const servers = dns.getServers();
    if (servers && servers.length > 0 && servers.includes("127.0.0.1")) {
      resolver.setServers(["8.8.8.8", "1.1.1.1"]);
    }
    const records = await resolver.resolveSrv(`_mongodb._tcp.${url.hostname}`);
    if (records.length > 0) {
      const hosts = records.map((r) => `${r.name}:${r.port}`).join(",");
      const auth = url.username ? `${url.username}:${url.password}@` : "";
      let newUri = `mongodb://${auth}${hosts}${url.pathname}${url.search}`;
      newUri += (newUri.includes("?") ? "&" : "?") + "tls=true&authSource=admin";
      return newUri;
    }
  } catch (err) {
    console.warn("Manual SRV resolution failed, falling back to driver native SRV", err instanceof Error ? err.message : err);
  }
  return uri;
}

export async function getDb(): Promise<Db> {
  const envUri = process.env.MONGODB_URI;

  if (!envUri) {
    throw new Error("MongoDB is not configured. Please set MONGODB_URI in .env.local.");
  }

  const uri = await resolveMongoUri(envUri);

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
      globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
        globalWithMongo._mongoClientPromise = undefined;
        // Safely log error details without exposing credentials
        const errInfo = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
        console.error("MongoDB Dev Connection Error:", errInfo);
        
        throw new Error(`MongoDB Connection Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
      clientPromise = client.connect().catch((error) => {
        clientPromise = null;
        console.error("MongoDB Prod Connection Error:", error instanceof Error ? error.message : "Unknown error");
        throw new Error("Failed to connect to the database.");
      });
    }
  }

  const connectedClient = await clientPromise;
  const db = connectedClient.db();

  const initDone = isDev ? globalWithMongo._mongoDbInitDone : dbInitDone;

  if (!initDone) {
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("documents").createIndex({ userId: 1, createdAt: -1 });
      // SEC-09: Add compound indexes matching actual query and sort patterns
      await db.collection("quizAttempts").createIndex({ userId: 1, createdAt: -1 });
      await db.collection("flashcardHistory").createIndex({ userId: 1, createdAt: -1 });
      await db.collection("summaryHistory").createIndex({ userId: 1, createdAt: -1 });
      await db.collection("chatHistory").createIndex({ userId: 1, updatedAt: -1 });
      // Rate limits TTL auto-expiration index
      await db.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await db.collection("rateLimits").createIndex({ key: 1, expiresAt: 1 });
      await ensureAdmin(db);
      
      if (isDev) {
        globalWithMongo._mongoDbInitDone = true;
      } else {
        dbInitDone = true;
      }
    } catch (error) {
      const errInfo = error instanceof Error ? { name: error.name, message: error.message } : error;
      console.error("MongoDB Initialization Error (indexes/admin):", errInfo);
      
      // If index creation fails because it already exists with different options, 
      // or ensureAdmin fails due to duplicate key, we should let it pass or fail?
      // For safety, we'll log it. If it's a critical auth issue, it might mean the DB is unreachable, 
      // but in that case client.connect() or db.collection() would have failed earlier.
      // We will throw the error so it doesn't silently swallow critical issues, 
      // but we won't crash if it's just an IndexKeySpecsConflict.
      if (error instanceof Error && error.message.includes("IndexKeySpecsConflict")) {
        console.warn("Index conflict detected, proceeding anyway.");
        if (isDev) globalWithMongo._mongoDbInitDone = true;
        else dbInitDone = true;
      } else {
        throw new Error(`Database Initialization Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }

  return db;
}
