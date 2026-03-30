import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { TAGS } from "@/constants/tags";

// Cache TTLs per period
const CACHE_TTL: Record<string, number> = {
  "1h": 30,    // 30s — nearly realtime
  "6h": 60,    // 1 min
  "24h": 60,   // 1 min
  "7d": 300,   // 5 min
  "15d": 600,  // 10 min
};

const VALID_PERIODS = new Set(["1h", "6h", "24h", "7d", "15d"]);

// --- Redis-first path for short periods (1h/6h/24h) ---
async function getStatsFromRedis(period: string, userCountry?: string) {
  const pipeline = redis.pipeline();

  // Global counters & scores
  pipeline.hgetall("global:stats");
  // Hourly guilt for sparkline & danger hour
  pipeline.hgetall("hourly:guilt:sum");
  pipeline.hgetall("hourly:guilt:count");
  // Trending tags (top 10)
  pipeline.zrevrange("trending:tags", 0, 9, "WITHSCORES");
  // Top procrastinating countries (top 10)
  pipeline.zrevrange("top:countries", 0, 9, "WITHSCORES");
  // Active users in last 10 min
  pipeline.zcount("active:activity", Date.now() - 10 * 60 * 1000, "+inf");
  // Local country stats (if available)
  if (userCountry) {
    pipeline.hgetall(`country:${userCountry}:stats`);
  }

  const results = await pipeline.exec();
  if (!results) return null;

  const globalRaw = (results[0][1] || {}) as Record<string, string>;
  const guiltySum = (results[1][1] || {}) as Record<string, string>;
  const guiltyCount = (results[2][1] || {}) as Record<string, string>;
  const trendingRaw = (results[3][1] || []) as string[];
  const topCountriesRaw = (results[4][1] || []) as string[];
  const activeRaw = (results[5][1] as number) || 0;
  const localRaw = userCountry ? ((results[6]?.[1] || {}) as Record<string, string>) : null;

  // Parse global stats
  const totalLogs = parseInt(globalRaw.total_logs || "0");
  const proCount = parseInt(globalRaw.pro_count || "0");
  const focusCount = parseInt(globalRaw.focus_count || "0");
  const totalGuilt = parseInt(globalRaw.total_guilt || "0");
  const totalFocusScore = parseInt(globalRaw.total_focus || "0");

  // Build hourly sparkline
  const hourlyData = Array(24).fill(0);
  let dangerHour = "N/A";
  let maxAvg = 0;

  for (let h = 0; h < 24; h++) {
    const sum = parseInt(guiltySum[h.toString()] || "0");
    const count = parseInt(guiltyCount[h.toString()] || "0");
    if (count > 0) {
      const avg = Math.round(sum / count);
      hourlyData[h] = avg;
      if (avg > maxAvg) {
        maxAvg = avg;
        dangerHour = `${h}:00`;
      }
    }
  }

  // Parse trending tags (WITHSCORES returns [tag, score, tag, score, ...])
  const trendingTags: any[] = [];
  for (let i = 0; i < trendingRaw.length; i += 2) {
    const tagId = trendingRaw[i];
    const count = parseInt(trendingRaw[i + 1] || "0");
    const tag = TAGS.find(t => t.id === tagId);
    if (tag) trendingTags.push({ ...tag, count });
  }

  // Parse top delay countries
  const delayLeaders: { code: string; count: number }[] = [];
  for (let i = 0; i < topCountriesRaw.length; i += 2) {
    delayLeaders.push({
      code: topCountriesRaw[i],
      count: parseInt(topCountriesRaw[i + 1] || "0"),
    });
  }

  // Parse local stats
  let localStats = null;
  if (localRaw && Object.keys(localRaw).length > 0) {
    const lProCount = parseInt(localRaw.pro_count || "0");
    const lFocusCount = parseInt(localRaw.focus_count || "0");
    const lTotalGuilt = parseInt(localRaw.total_guilt || "0");
    const lTotalFocus = parseInt(localRaw.total_focus || "0");
    const lTotal = lProCount + lFocusCount;
    localStats = {
      proCount: lProCount,
      focusCount: lFocusCount,
      totalGuilt: lTotalGuilt,
      avgGuilt: Math.round(lTotalGuilt / (lTotal || 1)),
      avgFocus: Math.round(lTotalFocus / (lFocusCount || 1)),
    };
  }

  return {
    global: {
      totalLogs,
      proCount,
      focusCount,
      totalGuilt,
      totalFocus: totalFocusScore,
      avgGuilt: Math.round(totalGuilt / (totalLogs || 1)),
      avgFocus: Math.round(totalFocusScore / (totalLogs || 1)),
      activeDelayers: activeRaw,
      dangerHour,
      hourlySparkline: hourlyData,
    },
    local: localStats,
    trendingTags,
    delayLeaders,
    focusLeaders: [], // not tracked separately in Redis — skip or add later
  };
}

// --- Prisma path for long periods (7d / 15d) — ONE single raw SQL query ---
async function getStatsFromDB(startDate: Date, userCountry?: string) {
  // Single query fetching all aggregates at once
  const [rows, activeRaw] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT
        type,
        "countryCode",
        "tagId",
        EXTRACT(HOUR FROM "createdAt") AS hour,
        SUM(score)           AS score_sum,
        COUNT(*)             AS cnt
      FROM "Log"
      WHERE "createdAt" > ${startDate}
      GROUP BY type, "countryCode", "tagId", hour
    `,
    redis.zcount("active:activity", Date.now() - 10 * 60 * 1000, "+inf").catch(() => 0),
  ]);

  // Aggregate in JS — single pass
  let totalLogs = 0;
  let proCount = 0;
  let focusCount = 0;
  let totalGuilt = 0;
  let totalFocusScore = 0;

  const hourlySum: Record<number, number> = {};
  const hourlyCount: Record<number, number> = {};
  const tagCounts: Record<string, number> = {};
  const delayCountries: Record<string, number> = {};
  const focusCountries: Record<string, number> = {};
  let localProCount = 0, localFocusCount = 0, localProSum = 0, localFocusSum = 0;

  for (const row of rows) {
    const cnt = Number(row.cnt);
    const scoreSum = Number(row.score_sum);
    const hour = parseInt(row.hour);
    const type = row.type as string;
    const countryCode = row.countryCode as string;
    const tagId = row.tagId as string;

    totalLogs += cnt;

    if (type === "PROCRASTINATE") {
      proCount += cnt;
      totalGuilt += scoreSum;
      hourlySum[hour] = (hourlySum[hour] || 0) + scoreSum;
      hourlyCount[hour] = (hourlyCount[hour] || 0) + cnt;
      delayCountries[countryCode] = (delayCountries[countryCode] || 0) + cnt;
    } else {
      focusCount += cnt;
      totalFocusScore += scoreSum;
      focusCountries[countryCode] = (focusCountries[countryCode] || 0) + cnt;
    }

    tagCounts[tagId] = (tagCounts[tagId] || 0) + cnt;

    if (userCountry && countryCode === userCountry) {
      if (type === "PROCRASTINATE") {
        localProCount += cnt;
        localProSum += scoreSum;
      } else {
        localFocusCount += cnt;
        localFocusSum += scoreSum;
      }
    }
  }

  // Build sparkline & danger hour
  const hourlyData = Array(24).fill(0);
  let dangerHour = "N/A";
  let maxAvg = 0;
  for (let h = 0; h < 24; h++) {
    if (hourlyCount[h]) {
      const avg = Math.round(hourlySum[h] / hourlyCount[h]);
      hourlyData[h] = avg;
      if (avg > maxAvg) { maxAvg = avg; dangerHour = `${h}:00`; }
    }
  }

  // Top 10 trending tags
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tagId, count]) => {
      const tag = TAGS.find(t => t.id === tagId);
      return { ...tag, count };
    });

  // Top 10 delay leaders
  const delayLeaders = Object.entries(delayCountries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  // Top 10 focus leaders
  const focusLeaders = Object.entries(focusCountries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  const localStats =
    userCountry && (localProCount + localFocusCount) > 0
      ? {
          proCount: localProCount,
          focusCount: localFocusCount,
          totalGuilt: localProSum,
          avgGuilt: Math.round(localProSum / ((localProCount + localFocusCount) || 1)),
          avgFocus: Math.round(localFocusSum / (localFocusCount || 1)),
        }
      : null;

  return {
    global: {
      totalLogs,
      proCount,
      focusCount,
      totalGuilt,
      totalFocus: totalFocusScore,
      avgGuilt: Math.round(totalGuilt / (totalLogs || 1)),
      avgFocus: Math.round(totalFocusScore / (totalLogs || 1)),
      activeDelayers: activeRaw,
      dangerHour,
      hourlySparkline: hourlyData,
    },
    local: localStats,
    trendingTags,
    delayLeaders,
    focusLeaders,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userCountry = searchParams.get("country")?.toUpperCase();
    const period = VALID_PERIODS.has(searchParams.get("period") || "")
      ? (searchParams.get("period") as string)
      : "24h";

    // Check response cache
    const cacheKey = `stats:cache:${period}:${userCountry || "global"}`;
    const ttl = CACHE_TTL[period];

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached), {
          headers: { "X-Cache": "HIT", "Cache-Control": `s-maxage=${ttl}, stale-while-revalidate` },
        });
      }
    } catch {
      // Redis unavailable — proceed without cache
    }

    let data: any;

    if (period === "1h" || period === "6h" || period === "24h") {
      // Fast path: Redis realtime data (sub-millisecond)
      data = await getStatsFromRedis(period, userCountry);
      if (!data) throw new Error("Redis stats unavailable");
    } else {
      // DB path for 7d / 15d
      const now = new Date();
      const startDate = new Date();
      if (period === "7d") startDate.setDate(now.getDate() - 7);
      else startDate.setDate(now.getDate() - 15);

      data = await getStatsFromDB(startDate, userCountry);
    }

    // Store in cache
    try {
      await redis.set(cacheKey, JSON.stringify(data), "EX", ttl);
    } catch {
      // Cache write failed — non-fatal
    }

    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS", "Cache-Control": `s-maxage=${ttl}, stale-while-revalidate` },
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
