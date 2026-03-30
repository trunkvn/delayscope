// scripts/flush_all.ts
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

async function flush() {
  console.log("🌊 Preparing to flush ALL data...");

  try {
    // 1. Clear Postgres
    console.log("📦 Clearing PostgreSQL tables (Log, Contact)...");
    await prisma.log.deleteMany({});
    await prisma.contact.deleteMany({});
    console.log("✅ Postgres tables cleared.");

    // 2. Clear Redis
    console.log("⚡ Flushing ALL Redis keys...");
    await redis.flushall();
    console.log("✅ Redis database flushed.");

    console.log("\n✨ System is now FRESH and CLEAN.");
  } catch (error) {
    console.error("❌ Flush failed:", error);
  } finally {
    await prisma.$disconnect();
    await redis.disconnect();
    process.exit();
  }
}

flush();
