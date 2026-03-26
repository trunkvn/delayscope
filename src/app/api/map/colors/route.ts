import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "24h";

    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "1h":
        startDate.setHours(now.getHours() - 1);
        break;
      case "6h":
        startDate.setHours(now.getHours() - 6);
        break;
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "15d":
        startDate.setDate(now.getDate() - 15);
        break;
      default:
        startDate.setHours(now.getHours() - 24);
    }

    // Get sum and count per country and type for the specified period
    // Formula: DelayIndex = (Sum(Procrastinate Score) / Total Count)
    const results = await prisma.log.groupBy({
      by: ["countryCode", "type"],
      where: {
        createdAt: {
          gt: startDate,
        },
      },
      _sum: {
        score: true,
      },
      _count: {
        _all: true,
      },
    });

    const countrySums: Record<string, { proSum: number; totalCount: number }> = {};
    
    results.forEach((item) => {
      if (item.countryCode) {
        if (!countrySums[item.countryCode]) {
          countrySums[item.countryCode] = { proSum: 0, totalCount: 0 };
        }
        
        // Always add to total count
        countrySums[item.countryCode].totalCount += item._count._all;
        
        // Only add to sum if it's procrastination
        if (item.type === "PROCRASTINATE") {
          countrySums[item.countryCode].proSum += item._sum.score || 0;
        }
      }
    });

    const countryStats: Record<string, { averageGuilt: number; count: number }> = {};
    for (const [code, stats] of Object.entries(countrySums)) {
      countryStats[code] = {
        averageGuilt: Math.round(stats.proSum / (stats.totalCount || 1)),
        count: stats.totalCount,
      };
    }

    return NextResponse.json(countryStats);
  } catch (error: any) {
    console.error("Map Colors API Error:", error);
    return NextResponse.json({ error: "Failed to fetch map colors", details: error?.message || String(error) }, { status: 500 });
  }
}
