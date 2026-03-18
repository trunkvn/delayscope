"use server";

import { prisma } from "@/lib/prisma";
import { updateStats, redis } from "@/lib/redis";
import { pusher } from "@/lib/pusher";
import { revalidatePath } from "next/cache";
import { TAGS } from "@/constants/tags";
import { headers } from "next/headers";

export async function logActivity({
  lat,
  lng,
  countryCode,
  tagId,
  score,
}: {
  lat: number;
  lng: number;
  countryCode: string;
  tagId: string;
  score: number;
}) {
  try {
    // 0. Anti-Spam: IP Rate Limiting
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    const cacheKey = `ratelimit:log:${ip.split(",")[0]}`;
    
    const existingLimit = await redis.get(cacheKey);
    if (existingLimit) {
      return { 
        success: false, 
        error: "Slow down! You can only log once every 2 minutes to prevent spam. 🕒" 
      };
    }

    const selectedTag = TAGS.find((t) => t.id === tagId);
    if (!selectedTag) throw new Error("Invalid Tag ID");

    // Pre-emptively set the rate limit
    await redis.set(cacheKey, "true", "EX", 120); // 2 minutes

    // 1. Fuzz location (basic)
    const fuzzedLat = lat + (Math.random() - 0.5) * 0.02;
    const fuzzedLng = lng + (Math.random() - 0.5) * 0.02;

    // 2. Save to Postgres
    const log = await prisma.log.create({
      data: {
        type: selectedTag.type as any,
        score,
        tagId,
        level: selectedTag.level,
        lat: fuzzedLat,
        lng: fuzzedLng,
        countryCode: countryCode.toUpperCase(),
      },
    });

    // 3. Update Redis (New Object Format)
    await updateStats({
      countryCode: countryCode.toUpperCase(),
      type: selectedTag.type as any,
      score,
      tagId,
      label: selectedTag.label,
      emoji: selectedTag.emoji,
      countryName: countryCode, // Fallback to code as name
    });

    // 4. Broadcast to Soketi
    await pusher.trigger("latermap-channel", "new-log", {
      id: log.id,
      type: log.type.toLowerCase(),
      score: log.score,
      lat: fuzzedLat,
      lng: fuzzedLng,
      country: countryCode,
      tagId: log.tagId,
      label: selectedTag.label,
      emoji: selectedTag.emoji,
      timestamp: log.createdAt,
    });

    revalidatePath("/");
    return { success: true, id: log.id };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Database error" };
  }
}
