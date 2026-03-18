-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROCRASTINATE', 'FOCUS');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "score" INTEGER NOT NULL,
    "tagId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "countryCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_countryCode_idx" ON "Log"("countryCode");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");
