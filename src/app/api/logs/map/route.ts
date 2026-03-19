import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
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

    // Fetch logs for the specified period
    const logs = await prisma.log.findMany({
      where: {
        createdAt: {
          gt: startDate,
        },
      },
      take: period.includes("d") ? 500 : 200, // Show more pins for longer periods
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        score: true,
        lat: true,
        lng: true,
        countryCode: true,
        tagId: true,
        createdAt: true
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Map Logs API Error:", error);
    return NextResponse.json({ error: "Failed to fetch map logs" }, { status: 500 });
  }
}
