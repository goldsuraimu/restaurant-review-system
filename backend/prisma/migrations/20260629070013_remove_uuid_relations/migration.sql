/*
  Warnings:

  - You are about to drop the column `userUuid` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `ownerUuid` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerUuid` on the `RestaurantDraft` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantDraftUuid` on the `RestaurantDraftImage` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantUuid` on the `RestaurantImage` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantUuid` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userUuid` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reviewUuid` on the `ReviewImage` table. All the data in the column will be lost.
  - You are about to drop the column `reviewUuid` on the `ReviewReply` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[restaurantId,userId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `RestaurantDraft` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restaurantDraftId` on table `RestaurantDraftImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restaurantId` on table `RestaurantImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restaurantId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reviewId` on table `ReviewImage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reviewId` on table `ReviewReply` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userUuid_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_ownerUuid_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_userId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantDraft" DROP CONSTRAINT "RestaurantDraft_ownerUuid_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantDraft" DROP CONSTRAINT "RestaurantDraft_userId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantDraftImage" DROP CONSTRAINT "RestaurantDraftImage_restaurantDraftId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantDraftImage" DROP CONSTRAINT "RestaurantDraftImage_restaurantDraftUuid_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantImage" DROP CONSTRAINT "RestaurantImage_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantImage" DROP CONSTRAINT "RestaurantImage_restaurantUuid_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_restaurantUuid_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userUuid_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewImage" DROP CONSTRAINT "ReviewImage_reviewUuid_fkey";

-- DropForeignKey
ALTER TABLE "ReviewReply" DROP CONSTRAINT "ReviewReply_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewReply" DROP CONSTRAINT "ReviewReply_reviewUuid_fkey";

-- DropIndex
DROP INDEX "Review_restaurantUuid_userUuid_key";

-- DropIndex
DROP INDEX "ReviewReply_reviewUuid_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "userUuid",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "ownerUuid",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantDraft" DROP COLUMN "ownerUuid",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantDraftImage" DROP COLUMN "restaurantDraftUuid",
ALTER COLUMN "restaurantDraftId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantImage" DROP COLUMN "restaurantUuid",
ALTER COLUMN "restaurantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "restaurantUuid",
DROP COLUMN "userUuid",
ALTER COLUMN "restaurantId" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReviewImage" DROP COLUMN "reviewUuid",
ALTER COLUMN "reviewId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReviewReply" DROP COLUMN "reviewUuid",
ALTER COLUMN "reviewId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_restaurantId_userId_key" ON "Review"("restaurantId", "userId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraft" ADD CONSTRAINT "RestaurantDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantImage" ADD CONSTRAINT "RestaurantImage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraftImage" ADD CONSTRAINT "RestaurantDraftImage_restaurantDraftId_fkey" FOREIGN KEY ("restaurantDraftId") REFERENCES "RestaurantDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
