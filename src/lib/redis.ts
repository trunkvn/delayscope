import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = global as unknown as { redis: Redis };

function createRedis() {
  const client = new Redis(redisUrl, {
    connectTimeout: 3000,       // 3s to establish TCP connection
    commandTimeout: 3000,       // 3s per command before error
    maxRetriesPerRequest: 1,    // fail fast — no retry loops on Vercel serverless
    retryStrategy: () => null,  // disable auto-reconnect (new instance per cold start)
    enableOfflineQueue: false,  // reject commands immediately if disconnected
  });
  client.on("error", (e) => {
    if (!e.message?.includes("ECONNREFUSED")) {
      console.warn("[Redis]", e.message);
    }
  });
  return client;
}

export const redis = globalForRedis.redis || createRedis();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Helper to update stats atomically
export async function updateStats({
  countryCode,
  type,
  score,
  tagId,
  label,
  emoji,
  countryName
}: {
  countryCode: string;
  type: "PROCRASTINATE" | "FOCUS";
  score: number;
  tagId: string;
  label: string;
  emoji: string;
  countryName: string;
}) {
  const pipeline = redis.pipeline();

  const globalKey = "global:stats";
  const countryKey = `country:${countryCode.toUpperCase()}:stats`;

  // Increment total logs
  pipeline.hincrby(globalKey, "total_logs", 1);
  pipeline.hincrby(countryKey, "total_logs", 1);

  if (type === "PROCRASTINATE") {
    pipeline.hincrby(globalKey, "pro_count", 1);
    pipeline.hincrby(globalKey, "total_guilt", score);
    pipeline.hincrby(countryKey, "pro_count", 1);
    pipeline.hincrby(countryKey, "total_guilt", score);
  } else {
    pipeline.hincrby(globalKey, "focus_count", 1);
    pipeline.hincrby(globalKey, "total_focus", score);
    pipeline.hincrby(countryKey, "focus_count", 1);
    pipeline.hincrby(countryKey, "total_focus", score);
  }

  // Update Trending & Activity
  const now = Date.now();
  pipeline.zincrby("trending:tags", 1, tagId);
  pipeline.zadd("active:activity", now, `${now}-${Math.random()}`);
  pipeline.zremrangebyscore("active:activity", 0, now - 30 * 60 * 1000); // Keep last 30m

  // Hourly stats for "Danger Hour" & Sparklines
  const currentHour = new Date().getHours().toString();
  if (type === "PROCRASTINATE") {
    pipeline.hincrby("hourly:guilt:sum", currentHour, score);
    pipeline.hincrby("hourly:guilt:count", currentHour, 1);
    // Track top procrastinating countries
    pipeline.zincrby("top:countries", 1, countryCode.toUpperCase());
  }

  // Marquee Stream
  const marqueeKey = "marquee:logs";
  const logItem = JSON.stringify({
    id: Math.random().toString(36).substring(7),
    type,
    score,
    label,
    emoji,
    country: countryName,
    timestamp: new Date().toISOString()
  });

  pipeline.lpush(marqueeKey, logItem);
  pipeline.ltrim(marqueeKey, 0, 49);

  try {
    await pipeline.exec();
  } catch (e) {
    console.error("🔴 Fatal Redis Stats Error:", e instanceof Error ? e.message : e);
  }
}
