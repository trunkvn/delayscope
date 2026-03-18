import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TAGS } from "@/constants/tags";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await (params as any)).id;

    const log = await prisma.log.findUnique({
      where: { id }
    });

    if (!log) {
      return NextResponse.json({ error: "Pin not found" }, { status: 404 });
    }

    const tag = TAGS.find(t => t.id === log.tagId);

    // Dynamic Title/Status based on score
    const title = log.type === "FOCUS" 
      ? (log.score > 80 ? "Unstoppable Force 🚀" : "Deep Work Focused")
      : (log.score > 80 ? "Master of Delay 🏆" : "Slightly Distracted");

    return NextResponse.json({
      id: log.id,
      title,
      activity: tag?.label || "Unknown Activity",
      emoji: tag?.emoji || "📝",
      score: log.score,
      type: log.type,
      time: log.createdAt,
      country: log.countryCode
    });
  } catch (error) {
    console.error(`Pin API Error [${params}]:`, error);
    return NextResponse.json({ error: "Failed to fetch pin details" }, { status: 500 });
  }
}
