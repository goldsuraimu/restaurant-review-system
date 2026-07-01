/*
  Warnings:

  - You are about to drop the column `rating` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `ratingCount` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `ratingSum` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "rating",
DROP COLUMN "ratingCount",
DROP COLUMN "ratingSum",
DROP COLUMN "reviewCount";
