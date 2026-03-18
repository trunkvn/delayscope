import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import Redis from "ioredis";
import { TAGS } from "../src/constants/tags";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const countries = [
  { code: "VN", name: "Vietnam", latRange: [10, 20], lngRange: [105, 108] },
  { code: "US", name: "USA", latRange: [30, 45], lngRange: [-120, -80] },
  { code: "JP", name: "Japan", latRange: [34, 40], lngRange: [135, 140] },
  { code: "GB", name: "UK", latRange: [51, 55], lngRange: [-2, 1] },
  { code: "DE", name: "Germany", latRange: [48, 52], lngRange: [7, 13] },
  { code: "BR", name: "Brazil", latRange: [-25, -5], lngRange: [-60, -40] },
  { code: "IN", name: "India", latRange: [10, 30], lngRange: [70, 90] },
  { code: "FR", name: "France", latRange: [43, 48], lngRange: [0, 5] },
  { code: "CA", name: "Canada", latRange: [45, 55], lngRange: [-110, -70] },
  { code: "AU", name: "Australia", latRange: [-35, -20], lngRange: [120, 150] },
  { code: "ID", name: "Indonesia", latRange: [-8, 2], lngRange: [100, 120] },
];

async function seed() {
  console.log("🚀 Starting to seed 300+ global activity logs...");

  // Clear existing logs for a fresh start (optional, maybe just add more)
  // await prisma.log.deleteMany(); 

  for (let i = 0; i < 350; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const tag = TAGS[Math.floor(Math.random() * TAGS.length)];
    
    const lat = country.latRange[0] + Math.random() * (country.latRange[1] - country.latRange[0]);
    const lng = country.lngRange[0] + Math.random() * (country.lngRange[1] - country.lngRange[0]);
    
    let score = 0;
    if (tag.type === "PROCRASTINATE") {
      if (tag.level === 1) score = Math.floor(Math.random() * 21) + 10;
      else if (tag.level === 2) score = Math.floor(Math.random() * 31) + 40;
      else score = Math.floor(Math.random() * 26) + 75;
    } else {
      score = Math.floor(Math.random() * 20) + 80;
    }

    // Historical timestamp (randomized over last 24h)
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

    const log = await prisma.log.create({
      data: {
        type: tag.type,
        score,
        tagId: tag.id,
        level: tag.level,
        lat,
        lng,
        countryCode: country.code,
        createdAt: timestamp,
      },
    });

    // Update Redis for global stats consistency
    const pipeline = redis.pipeline();
    const globalKey = "global:stats";
    const countryKey = `country:${country.code.toUpperCase()}:stats`;
    const hour = timestamp.getHours().toString();

    pipeline.hincrby(globalKey, "total_logs", 1);
    pipeline.hincrby(countryKey, "total_logs", 1);

    if (tag.type === "PROCRASTINATE") {
      pipeline.hincrby(globalKey, "pro_count", 1);
      pipeline.hincrby(globalKey, "total_guilt", score);
      pipeline.hincrby(countryKey, "pro_count", 1);
      pipeline.hincrby(countryKey, "total_guilt", score);
      pipeline.hincrby("hourly:guilt:sum", hour, score);
      pipeline.hincrby("hourly:guilt:count", hour, 1);
    } else {
      pipeline.hincrby(globalKey, "focus_count", 1);
      pipeline.hincrby(globalKey, "total_focus", score);
      pipeline.hincrby(countryKey, "focus_count", 1);
      pipeline.hincrby(countryKey, "total_focus", score);
    }

    // Add to marquee stream
    const logItem = JSON.stringify({
      id: log.id,
      type: tag.type,
      score,
      label: tag.label,
      emoji: tag.emoji,
      country: country.name,
      timestamp: timestamp.toISOString()
    });
    pipeline.lpush("marquee:logs", logItem);
    pipeline.ltrim("marquee:logs", 0, 49);

    // Active delayers (simulated as active now if timestamp is recent)
    if (Date.now() - timestamp.getTime() < 30 * 60 * 1000) {
      pipeline.zadd("active:activity", timestamp.getTime(), `${timestamp.getTime()}-${Math.random()}`);
    }

    await pipeline.exec();

    if (i % 50 === 0) console.log(`✅ Seeded ${i} logs...`);
  }

  console.log("✨ Seeding completed successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
