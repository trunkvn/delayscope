import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get average score and total logs per country
    const results = await prisma.log.groupBy({
      by: ["countryCode"],
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
