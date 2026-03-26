import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis, updateStats } from "@/lib/redis";
import { pusher } from "@/lib/pusher";
import { TAGS } from "@/constants/tags";
import { ActivityType } from "@prisma/client";

// Simple focus score / guilt index logic
function calculateScore(tagId: string) {
  const tag = TAGS.find((t) => t.id === tagId);
  if (!tag) return 50; // Default

  const base = tag.level === 1 ? 20 : tag.level === 2 ? 50 : 80;
  // Add some randomness (+/- 10)
  return Math.max(0, Math.min(100, base + Math.floor(Math.random() * 21) - 10));
}

// Location fuzzing logic
function fuzzCoordinate(coord: number) {
  // Add a random offset between -0.015 and +0.015 degrees (~1.5km)
  const offset = (Math.random() - 0.5) * 0.03;
  return parseFloat((coord + offset).toFixed(4));
}

export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting (IP-based, 1 log per 30s)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
    const rateLimitKey = `ratelimit:log:${ip}`;

    const isLimited = await redis.get(rateLimitKey);
    if (isLimited && process.env.NODE_ENV === "production") {
       return NextResponse.json({ 
         error: "Rate limit exceeded. Please wait 30s before logging again.",
         retryAfter: 30
       }, { status: 429 });
    }

    const body = await req.json();
    const { tagId, lat, lng, countryCode: clientCountryCode } = body;

    // 1. Validation
    const selectedTag = TAGS.find((t) => t.id === tagId);
    if (!selectedTag) {
      return NextResponse.json({ error: "Invalid Tag ID" }, { status: 400 });
    }

    // 2. Geo-Processing (IP-based fallback if GPS is missing)
    let finalLat = lat;
    let finalLng = lng;
    let finalCountryCode = clientCountryCode;

    if (!finalLat || !finalLng || !finalCountryCode) {
      // Get IP Address
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(/, /)[0] : "8.8.8.8"; // Default dev IP

      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          finalLat = finalLat || geoData.lat;
          finalLng = finalLng || geoData.lon;
          finalCountryCode = finalCountryCode || geoData.countryCode;
        }
      } catch (e) {
        console.error("Geo-IP Error:", e);
      }
    }

    // Default fallbacks if still missing
    finalLat = finalLat || 0;
    finalLng = finalLng || 0;
    finalCountryCode = finalCountryCode || "GLOBAL";

    // 3. Fuzzing & Score Calculation
    const fuzzedLat = fuzzCoordinate(finalLat);
    const fuzzedLng = fuzzCoordinate(finalLng);
    const score = calculateScore(tagId);

    // 4. Save to PostgreSQL
    const log = await prisma.log.create({
      data: {
        type: selectedTag.type as ActivityType,
        score,
        tagId,
        level: selectedTag.level,
        lat: fuzzedLat,
        lng: fuzzedLng,
        countryCode: finalCountryCode,
      },
    });

    // 5. Update Redis stats & Broadcast (Side effects should not crash the main thread)
    try {
      await updateStats({
        type: selectedTag.type as ActivityType,
        score,
        tagId,
        countryCode: finalCountryCode,
        label: selectedTag.label,
        emoji: selectedTag.emoji,
        countryName: finalCountryCode,
      });

      await pusher.trigger("latermap-channel", "new-log", {
        id: log.id,
        type: log.type.toLowerCase(),
        score: log.score,
        lat: fuzzedLat,
        lng: fuzzedLng,
        country: finalCountryCode,
        tagId: log.tagId,
        label: selectedTag.label,
        emoji: selectedTag.emoji,
        timestamp: log.createdAt,
      });

      if (process.env.NODE_ENV === "production") {
         const rateLimitKey = `ratelimit:log:${ip}`;
         await redis.set(rateLimitKey, "1", "EX", 30);
      }
    } catch (sideEffectError) {
      console.error("Side effect (Redis/Pusher) Error:", sideEffectError);
      // We purposefully DO NOT throw an error here to return a 200 OK to the client
    }

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        type: log.type,
        score: log.score,
        fuzzedLat,
        fuzzedLng,
      },
    });
  } catch (error) {
    console.error("Logging API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
