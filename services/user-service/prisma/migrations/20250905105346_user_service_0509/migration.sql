/*
  Warnings:

  - You are about to drop the column `github` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "github",
DROP COLUMN "isActive",
DROP COLUMN "twitter",
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "public"."UserGoal" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "goalBooks" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBadge" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_year_key" ON "public"."UserGoal"("userId", "year");

-- AddForeignKey
ALTER TABLE "public"."UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
