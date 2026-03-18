import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { TAGS } from "@/constants/tags";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userCountry = searchParams.get("country")?.toUpperCase();
    const globalKey = "global:stats";
    const marqueeKey = "marquee:logs";
    const trendingKey = "trending:tags";
    const now = Date.now();

    const [globalStats, marqueeRaw, trendingRaw, activeRaw, hourlySum, hourlyCount, topRaw] = await Promise.all([
      redis.hgetall(globalKey),
      redis.lrange(marqueeKey, 0, 19),
      redis.zrevrange(trendingKey, 0, 9, "WITHSCORES"),
      redis.zcount("active:activity", now - 10 * 60 * 1000, "+inf"), // Active in last 10m
      redis.hgetall("hourly:guilt:sum"),
      redis.hgetall("hourly:guilt:count"),
      redis.zrevrange("top:countries", 0, 2, "WITHSCORES"),
    ]);

    // Format marquee
    const marqueeLogs = marqueeRaw.map((raw) => JSON.parse(raw));

    // Format trending tags
    const trendingTags = [];
    for (let i = 0; i < trendingRaw.length; i += 2) {
      const tag = TAGS.find((t) => t.id === trendingRaw[i]);
      if (tag) trendingTags.push({ ...tag, count: parseInt(trendingRaw[i + 1]) });
    }

    // Top Countries formatting
    const topCountries = [];
    for (let i = 0; i < topRaw.length; i += 2) {
      topCountries.push({ code: topRaw[i], count: parseInt(topRaw[i + 1]) });
    }

    // Format hourly sparkline & Danger Hour
    const hourlyData = [];
    let dangerHour = "N/A";
    let maxAvg = 0;

    for (let i = 0; i < 24; i++) {
      const sum = parseInt(hourlySum[i.toString()] || "0");
      const cnt = parseInt(hourlyCount[i.toString()] || "0");
      const avg = cnt > 0 ? Math.round(sum / cnt) : 0;
      
      hourlyData.push(avg);
      if (avg > maxAvg) {
        maxAvg = avg;
        dangerHour = `${i}:00`;
      }
    }

    // Local Pulse
    let localStats = null;
    if (userCountry) {
      const countryKey = `country:${userCountry}:stats`;
      const countryRaw = await redis.hgetall(countryKey);
      if (countryRaw.pro_count) {
        localStats = {
          proCount: parseInt(countryRaw.pro_count || "0"),
          focusCount: parseInt(countryRaw.focus_count || "0"),
          totalGuilt: parseInt(countryRaw.total_guilt || "0"),
          avgGuilt: Math.round(parseInt(countryRaw.total_guilt || "0") / parseInt(countryRaw.pro_count || "1")),
        };
      }
    }

    return NextResponse.json({
      global: {
        totalLogs: parseInt(globalStats.total_logs || "0"),
        proCount: parseInt(globalStats.pro_count || "0"),
        focusCount: parseInt(globalStats.focus_count || "0"),
        totalGuilt: parseInt(globalStats.total_guilt || "0"),
        totalFocus: parseInt(globalStats.total_focus || "0"),
        activeDelayers: activeRaw,
        dangerHour,
        hourlySparkline: hourlyData,
      },
      local: localStats,
      marqueeLogs,
      trendingTags,
      topCountries,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
