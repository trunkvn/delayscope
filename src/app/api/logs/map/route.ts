import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch last 100 logs for the map
    const logs = await prisma.log.findMany({
      take: 100,
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
