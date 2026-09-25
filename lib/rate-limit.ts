import { getDb } from "./mongodb";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Atomic MongoDB-backed rate limiter with TTL auto-cleanup.
 * Operates without external dependencies (no Redis) and prevents unbounded storage.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const db = await getDb();
    const now = new Date();
    const expiresAt = new Date(Date.now() + windowSeconds * 1000);

    const doc = await db.collection("rateLimits").findOneAndUpdate(
      { key, expiresAt: { $gt: now } },
      {
        $inc: { count: 1 },
        $setOnInsert: { key, expiresAt, createdAt: now },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    const currentCount = doc?.count || 1;
    const docExpiresAt = doc?.expiresAt ? new Date(doc.expiresAt) : expiresAt;
    const resetInSeconds = Math.max(
      1,
      Math.ceil((docExpiresAt.getTime() - Date.now()) / 1000)
    );

    if (currentCount > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - currentCount),
      resetInSeconds,
    };
  } catch (error) {
    console.error("Rate limiter evaluation failed:", error instanceof Error ? error.message : error);
    return {
      allowed: true,
      remaining: 1,
      resetInSeconds: windowSeconds,
    };
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first.slice(0, 45);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim().slice(0, 45);
  }
  return "127.0.0.1";
}
