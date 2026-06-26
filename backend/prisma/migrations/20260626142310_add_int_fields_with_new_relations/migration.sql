/*
  Warnings:

  - A unique constraint covering the columns `[reviewId]` on the table `ReviewReply` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "RestaurantDraft" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "RestaurantDraftImage" ADD COLUMN     "restaurantDraftId" INTEGER;

-- AlterTable
ALTER TABLE "RestaurantImage" ADD COLUMN     "restaurantId" INTEGER;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "restaurantId" INTEGER,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "ReviewImage" ADD COLUMN     "reviewId" INTEGER;

-- AlterTable
ALTER TABLE "ReviewReply" ADD COLUMN     "reviewId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReply_reviewId_key" ON "ReviewReply"("reviewId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraft" ADD CONSTRAINT "RestaurantDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantImage" ADD CONSTRAINT "RestaurantImage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraftImage" ADD CONSTRAINT "RestaurantDraftImage_restaurantDraftId_fkey" FOREIGN KEY ("restaurantDraftId") REFERENCES "RestaurantDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
