-- CreateTable
CREATE TABLE "RestaurantStats" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantStats_restaurantId_key" ON "RestaurantStats"("restaurantId");

-- AddForeignKey
ALTER TABLE "RestaurantStats" ADD CONSTRAINT "RestaurantStats_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
