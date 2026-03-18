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

    // 1. Get stats from Redis (for quick global context if needed)
    // 2. Query Prisma for top 3 tags in this country in the last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [topTags, countryCount] = await Promise.all([
      prisma.log.groupBy({
        by: ['tagId'],
        where: {
          countryCode: iso,
          createdAt: { gte: twentyFourHoursAgo }
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
      prisma.log.count({
        where: {
          countryCode: iso,
          createdAt: { gte: twentyFourHoursAgo }
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

    // Derived metric: Missed Deadlines (Flavor text)
    // Logic: Total logs in country * (Avg Guilt Index of country / 100)
    const avgScore = await prisma.log.aggregate({
      where: { countryCode: iso },
      _avg: { score: true }
    });

    const averageGuilt = Math.round(avgScore._avg.score || 0);
    const missedDeadlines = Math.floor(countryCount * (averageGuilt / 40)); 

    return NextResponse.json({
      iso,
      count: countryCount,
      topTags: formattedTags,
      averageGuilt,
      missedDeadlines: Math.max(0, missedDeadlines)
    });
  } catch (error) {
    console.error(`Country API Error [${params}]:`, error);
    return NextResponse.json({ error: "Failed to fetch country stats" }, { status: 500 });
  }
}
