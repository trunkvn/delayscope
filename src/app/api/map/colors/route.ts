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

    // Get average score and total logs per country for the specified period
    const results = await prisma.log.groupBy({
      by: ["countryCode"],
      where: {
        createdAt: {
          gt: startDate,
        },
      },
      _avg: {
        score: true,
      },
      _count: {
        _all: true,
      },
    });

    const countryStats: Record<string, { averageGuilt: number; count: number }> = {};
    
    results.forEach((item) => {
      if (item.countryCode) {
        countryStats[item.countryCode] = {
          averageGuilt: Math.round(item._avg.score || 0),
          count: item._count._all,
        };
      }
    });

    return NextResponse.json(countryStats);
  } catch (error) {
    console.error("Map Colors API Error:", error);
    return NextResponse.json({ error: "Failed to fetch map colors" }, { status: 500 });
  }
}
