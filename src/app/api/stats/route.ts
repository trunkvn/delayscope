import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { TAGS } from "@/constants/tags";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userCountry = searchParams.get("country")?.toUpperCase();
    const period = searchParams.get("period") || "24h";
    
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "1h": startDate.setHours(now.getHours() - 1); break;
      case "6h": startDate.setHours(now.getHours() - 6); break;
      case "24h": startDate.setHours(now.getHours() - 24); break;
      case "7d": startDate.setDate(now.getDate() - 7); break;
      case "15d": startDate.setDate(now.getDate() - 15); break;
      default: startDate.setHours(now.getHours() - 24);
    }

    // Since we need historical stats for specific periods, we query Prisma
    // Redis mainly stores all-time or real-time counters.
    const [globalStats, trendingRaw, activeRaw, hourlyStats, topRaw] = await Promise.all([
      // Global stats for period
      prisma.log.aggregate({
        where: { createdAt: { gt: startDate } },
        _count: { _all: true },
        _sum: { score: true },
      }),
      // Trending tags for period
      prisma.log.groupBy({
        by: ["tagId"],
        where: { createdAt: { gt: startDate } },
        _count: { tagId: true },
        orderBy: { _count: { tagId: "desc" } },
        take: 3,
      }),
      // Active in last 10m (always live)
      redis.zcount("active:activity", Date.now() - 10 * 60 * 1000, "+inf"),
      // Hourly distribution for period
      prisma.$queryRaw`
        SELECT EXTRACT(HOUR FROM "createdAt") as hour, AVG(score) as avg_score
        FROM "Log"
        WHERE "createdAt" > ${startDate}
        GROUP BY hour
      ` as Promise<any[]>,
      // Top delayed countries for period
      prisma.log.groupBy({
        by: ["countryCode"],
        where: { createdAt: { gt: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 3,
      }),
    ]);

    // Format trending tags
    const trendingTags = trendingRaw.map(item => {
      const tag = TAGS.find(t => t.id === item.tagId);
      return { ...tag, count: item._count?.tagId || 0 };
    });

    // Top Countries formatting
    const topCountries = topRaw.map(item => ({
      code: item.countryCode,
      count: item._count?.id || 0
    }));

    // Format hourly sparkline & Danger Hour
    const hourlyData = Array(24).fill(0);
    let dangerHour = "N/A";
    let maxAvg = 0;

    hourlyStats.forEach((row: any) => {
      const h = parseInt(row.hour);
      const avg = Math.round(Number(row.avg_score) || 0);
      hourlyData[h] = avg;
      if (avg > maxAvg) {
        maxAvg = avg;
        dangerHour = `${h}:00`;
      }
    });

    // Local Pulse
    let localStats = null;
    if (userCountry) {
      const localData = await prisma.log.aggregate({
        where: { 
          countryCode: userCountry,
          createdAt: { gt: startDate }
        },
        _count: { _all: true },
        _sum: { score: true },
      });

      if (localData._count._all > 0) {
        localStats = {
          proCount: localData._count._all, // Simplified for now
          focusCount: 0, 
          totalGuilt: localData._sum.score || 0,
          avgGuilt: Math.round((localData._sum.score || 0) / localData._count._all),
        };
      }
    }

    return NextResponse.json({
      global: {
        totalLogs: globalStats._count._all,
        proCount: globalStats._count._all, // Simplified mapping
        focusCount: 0,
        totalGuilt: globalStats._sum.score || 0,
        totalFocus: 0,
        activeDelayers: activeRaw,
        dangerHour,
        hourlySparkline: hourlyData,
      },
      local: localStats,
      trendingTags,
      topCountries,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
