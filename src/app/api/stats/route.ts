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
    const [globalStats, trendingRaw, activeRaw, hourlyStats, topRaw] = await Promise.all([
      // Global stats grouped by type
      prisma.log.groupBy({
        by: ["type"],
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
      // Hourly distribution for period (Weighted Formula)
      prisma.$queryRaw`
        SELECT 
           EXTRACT(HOUR FROM "createdAt") as hour, 
           SUM(CASE WHEN "type" = 'PROCRASTINATE' THEN "score" ELSE 0 END) as delay_sum,
           COUNT(*) as total_count
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

    // Process global stats based on formula
    let totalLogs = 0;
    let totalGuilt = 0;
    let totalFocusScore = 0;
    let proCount = 0;
    let focusCount = 0;

    globalStats.forEach(item => {
      totalLogs += item._count._all;
      if (item.type === "PROCRASTINATE") {
        totalGuilt += item._sum.score || 0;
        proCount = item._count._all;
      } else {
        totalFocusScore += item._sum.score || 0;
        focusCount = item._count._all;
      }
    });

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

    // Format hourly sparkline
    const hourlyData = Array(24).fill(0);
    let dangerHour = "N/A";
    let maxAvg = 0;

    hourlyStats.forEach((row: any) => {
      const h = parseInt(row.hour);
      const avg = Math.round(Number(row.delay_sum) / (Number(row.total_count) || 1));
      hourlyData[h] = avg;
      if (avg > maxAvg) {
        maxAvg = avg;
        dangerHour = `${h}:00`;
      }
    });

    // Local Pulse
    let localStats = null;
    if (userCountry) {
      const localData = await prisma.log.groupBy({
        by: ["type"],
        where: { 
          countryCode: userCountry,
          createdAt: { gt: startDate }
        },
        _count: { _all: true },
        _sum: { score: true },
      });

      if (localData.length > 0) {
        let localTotal = 0;
        let localProSum = 0;
        let localFocusSum = 0;
        let localProCount = 0;
        let localFocusCount = 0;

        localData.forEach(item => {
          localTotal += item._count._all;
          if (item.type === "PROCRASTINATE") {
            localProSum += item._sum.score || 0;
            localProCount = item._count._all;
          } else {
            localFocusSum += item._sum.score || 0;
            localFocusCount = item._count._all;
          }
        });

        localStats = {
          proCount: localProCount,
          focusCount: localFocusCount, 
          totalGuilt: localProSum,
          avgGuilt: Math.round(localProSum / (localTotal || 1)),
          avgFocus: Math.round(localFocusSum / (localFocusCount || 1)),
        };
      }
    }

    return NextResponse.json({
      global: {
        totalLogs,
        proCount,
        focusCount,
        totalGuilt,
        totalFocus: totalFocusScore,
        avgGuilt: Math.round(totalGuilt / (totalLogs || 1)),
        avgFocus: Math.round(totalFocusScore / (focusCount || 1)),
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
