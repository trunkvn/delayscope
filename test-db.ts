import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import { redis } from './src/lib/redis';
async function test() {
  try {
    const res = await prisma.log.findFirst();
    console.log("Prisma Connected:", res);
  } catch(e) {
    console.error("Prisma Error:", e);
  }
  try {
    const r = await redis.ping();
    console.log("Redis Connected:", r);
  } catch(e) {
    console.error("Redis Error:", e);
  }
}
test();
