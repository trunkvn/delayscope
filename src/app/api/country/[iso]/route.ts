import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { TAGS } from "@/constants/tags";

export async function GET(
  req: NextRequest,
  { params }: { params: { iso: string } }
) {
  try {
    // Resolve params properly (await requested for Next.js 15)
    const iso = (await (params as any)).iso.toUpperCase();

    // Read period from query params
    const { searchParams } = new URL(req.url);
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

    // Query Prisma for top 3 tags and totals in this country for the period
    const [topTags, countryStatsByType] = await Promise.all([
      prisma.log.groupBy({
        by: ['tagId'],
        where: {
          countryCode: iso,
          createdAt: { gt: startDate }
        },
        _count: {
          tagId: true
        },
        orderBy: {
          _count: {
            tagId: 'desc'
          }
        },
        take: 3
      }),
      prisma.log.groupBy({
        by: ['type'],
        where: {
          countryCode: iso,
          createdAt: { gt: startDate }
        },
        _count: {
          _all: true
        },
        _sum: {
          score: true
        }
      })
    ]);

    // Map tagIds to labels/emojis
    const formattedTags = topTags.map(item => {
      const tag = TAGS.find(t => t.id === item.tagId);
      return {
        label: tag?.label || item.tagId,
        emoji: tag?.emoji || "📝",
        count: item._count.tagId
      };
    });

    // Calculate Weighted Delay Index (avgGuilt)
    let totalLogs = 0;
    let proSum = 0;
    
    countryStatsByType.forEach(item => {
      totalLogs += item._count._all;
      if (item.type === "PROCRASTINATE") {
        proSum += item._sum.score || 0;
      }
    });

    const averageGuilt = Math.round(proSum / (totalLogs || 1));
    const missedDeadlines = Math.floor(proSum / 100); 

    return NextResponse.json({
      iso,
      count: totalLogs,
      topTags: formattedTags,
      averageGuilt,
      missedDeadlines: Math.max(0, missedDeadlines)
    });
  } catch (error) {
    console.error(`Country API Error [${params}]:`, error);
    return NextResponse.json({ error: "Failed to fetch country stats" }, { status: 500 });
  }
}
