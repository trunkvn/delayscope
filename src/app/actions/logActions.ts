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
    
    try {
      const existingLimit = await redis.get(cacheKey);
      if (existingLimit) {
        return { 
          success: false, 
          error: "Slow down! You can only log once every 2 minutes to prevent spam. 🕒" 
        };
      }
      // Pre-emptively set the rate limit
      await redis.set(cacheKey, "true", "EX", 120); // 2 minutes
    } catch (redisError) {
      console.warn("⚠️ Redis Rate Limit Check Failed:", redisError);
      // Continue without rate limiting if Redis is down
    }

    const selectedTag = TAGS.find((t) => t.id === tagId);
    if (!selectedTag) throw new Error("Invalid Tag ID");

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

    // 3. Update Redis (New Object Format) - Fail Silent
    try {
      await updateStats({
        countryCode: countryCode.toUpperCase(),
        type: selectedTag.type as any,
        score,
        tagId,
        label: selectedTag.label,
        emoji: selectedTag.emoji,
        countryName: countryCode, // Fallback to code as name
      });
    } catch (redisError) {
      console.error("🔴 Redis Update Stats Failed:", redisError);
    }

     // 4. Broadcast to Soketi (Now with separate try-catch)
    try {
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
    } catch (pusherError) {
      console.error("🔴 Pusher Trigger Failed:", pusherError);
      // We don't return false here because the data is already saved to Postgres & Redis
      // But we can add a flag or just let it pass
    }

    revalidatePath("/");
    return { success: true, id: log.id };
  } catch (error) {
    console.error("🔴 Failed to log activity:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Database error" 
    };
  }
}
