// backfill.js (精準對齊全新整數欄位版)
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 開始利用 UUID 舊資料，跨表精準修補所有正名後的 Int 欄位...')

  // 1. 修補 Restaurant 表的 userId (依據舊的 ownerUuid 尋找 User.id)
  console.log('⏳ 正在回填 Restaurant...')
  await prisma.$executeRaw`
    UPDATE "Restaurant" r
    SET "userId" = u.id
    FROM "User" u
    WHERE r."ownerUuid" = u.uuid;
  `;

  // 2. 修補 RestaurantDraft 表的 userId (依據舊的 ownerUuid 尋找 User.id)
  console.log('⏳ 正在回填 RestaurantDraft...')
  await prisma.$executeRaw`
    UPDATE "RestaurantDraft" d
    SET "userId" = u.id
    FROM "User" u
    WHERE d."ownerUuid" = u.uuid;
  `;

  // 3. 修補 RestaurantImage 表 (依據舊的 restaurantUuid 尋找 Restaurant.id)
  console.log('⏳ 正在回填 RestaurantImage...')
  await prisma.$executeRaw`
    UPDATE "RestaurantImage" i
    SET "restaurantId" = r.id
    FROM "Restaurant" r
    WHERE i."restaurantUuid" = r.uuid;
  `;

  // 4. 修補 RestaurantDraftImage 表 (依據舊的 restaurantDraftUuid 尋找 RestaurantDraft.id)
  console.log('⏳ 正在回填 RestaurantDraftImage...')
  await prisma.$executeRaw`
    UPDATE "RestaurantDraftImage" i
    SET "restaurantDraftId" = d.id
    FROM "RestaurantDraft" d
    WHERE i."restaurantDraftUuid" = d.uuid;
  `;

  // 5. 修補 Review 表 (跨表找出對應的 Restaurant.id 與 User.id)
  console.log('⏳ 正在回填 Review...')
  await prisma.$executeRaw`
    UPDATE "Review" rw
    SET "restaurantId" = r.id,
        "userId" = u.id
    FROM "Restaurant" r, "User" u
    WHERE rw."restaurantUuid" = r.uuid AND rw."userUuid" = u.uuid;
  `;

  // 6. 修補 ReviewImage 表 (依據舊的 reviewUuid 尋找 Review.id)
  console.log('⏳ 正在回填 ReviewImage...')
  await prisma.$executeRaw`
    UPDATE "ReviewImage" i
    SET "reviewId" = rw.id
    FROM "Review" rw
    WHERE i."reviewUuid" = rw.uuid;
  `;

  // 7. 修補 ReviewReply 表 (依據舊的 reviewUuid 尋找 Review.id)
  console.log('⏳ 正在回填 ReviewReply...')
  await prisma.$executeRaw`
    UPDATE "ReviewReply" p
    SET "reviewId" = rw.id
    FROM "Review" rw
    WHERE p."reviewUuid" = rw.uuid;
  `;

  // 8. 修補 RefreshToken 表 (依據舊的 userUuid 尋找 User.id)
  console.log('⏳ 正在回填 RefreshToken...')
  await prisma.$executeRaw`
    UPDATE "RefreshToken" t
    SET "userId" = u.id
    FROM "User" u
    WHERE t."userUuid" = u.uuid;
  `;

  console.log('✅ [完美成功] 所有舊資料已成功對應並補齊為正名後的整數欄位！')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
