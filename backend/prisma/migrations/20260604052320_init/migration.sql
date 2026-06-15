-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "realName" TEXT,
    "nickname" TEXT,
    "gender" TEXT,
    "birthday" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "ownerUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "location" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantDraft" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "ownerUuid" TEXT NOT NULL,
    "restaurantUuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "RestaurantDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantImage" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "restaurantUuid" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantDraftImage" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "restaurantDraftUuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'DRAFT_UPLOAD',
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantDraftImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "restaurantUuid" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "reviewUuid" TEXT NOT NULL,
    "url" TEXT,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "reviewUuid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "revokedAt" INTEGER,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_uuid_key" ON "Restaurant"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantDraft_uuid_key" ON "RestaurantDraft"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantDraft_restaurantUuid_key" ON "RestaurantDraft"("restaurantUuid");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantImage_uuid_key" ON "RestaurantImage"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantDraftImage_uuid_key" ON "RestaurantDraftImage"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Review_uuid_key" ON "Review"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Review_restaurantUuid_userUuid_key" ON "Review"("restaurantUuid", "userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewImage_uuid_key" ON "ReviewImage"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReply_uuid_key" ON "ReviewReply"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReply_reviewUuid_key" ON "ReviewReply"("reviewUuid");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraft" ADD CONSTRAINT "RestaurantDraft_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantImage" ADD CONSTRAINT "RestaurantImage_restaurantUuid_fkey" FOREIGN KEY ("restaurantUuid") REFERENCES "Restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantDraftImage" ADD CONSTRAINT "RestaurantDraftImage_restaurantDraftUuid_fkey" FOREIGN KEY ("restaurantDraftUuid") REFERENCES "RestaurantDraft"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantUuid_fkey" FOREIGN KEY ("restaurantUuid") REFERENCES "Restaurant"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_reviewUuid_fkey" FOREIGN KEY ("reviewUuid") REFERENCES "Review"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewUuid_fkey" FOREIGN KEY ("reviewUuid") REFERENCES "Review"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
