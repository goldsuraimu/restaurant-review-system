import { prisma } from '#/db/prisma'
import { Prisma } from '@prisma/client'

import type { DBClient } from '#/types/database'

export interface FindRestaurantListOptions {
  keywords: string[]
  page: number
  limit: number
}

export interface RestaurantWithScoreRow {
  uuid: string;
  name: string;
  nameEn: string | null;
  category: string;
  rating: number | null;
  ratingCount: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date | null;
  coverUuid: string | null;
  coverPublicId: string | null;
  coverSortOrder: number | null;
  score: number;
}

interface SearchResult {
  total: number;
  rows: RestaurantWithScoreRow[];
}

// 依照關聯性取得餐廳列表（因為有加權計算，所以用 raw SQL）
export async function findRestaurantListWithRelevance(
  { keywords, page, limit }: FindRestaurantListOptions,
  client: DBClient = prisma
): Promise<SearchResult> {
  const offset = (page - 1) * limit

  const uniqueKeywords = Array.from(new Set(keywords))

  // 建立用來存放 Prisma SQL 片段的陣列
  const whereConditions: Prisma.Sql[] = []
  const scoreExpressions: Prisma.Sql[] = []

  for (const kw of uniqueKeywords) {
    const pattern = `%${kw}%`

    whereConditions.push(Prisma.sql`
      (
        COALESCE(r."name", '') ILIKE ${pattern} 
        OR COALESCE(r."nameEn", '') ILIKE ${pattern} 
        OR COALESCE(r."category", '') ILIKE ${pattern} 
        OR COALESCE(r."location", '') ILIKE ${pattern} 
        OR COALESCE(r."description", '') ILIKE ${pattern}
      )
    `)

    // 建立該關鍵字的分數加權片段
    scoreExpressions.push(Prisma.sql`
      (
        CASE WHEN COALESCE(r."name", '') ILIKE ${pattern} OR COALESCE(r."nameEn", '') ILIKE ${pattern} THEN 3 ELSE 0 END + 
        CASE WHEN COALESCE(r."category", '') ILIKE ${pattern} THEN 2 ELSE 0 END + 
        CASE WHEN COALESCE(r."description", '') ILIKE ${pattern} THEN 1 ELSE 0 END
      )
    `)
  }

  // 使用 Prisma.join 將陣列組合成完整的 SQL 片段
  const finalWhereSql = Prisma.join(whereConditions, ' OR ')
  const finalScoreSql = Prisma.join(scoreExpressions, ' + ')

  // 執行總計查詢 
  const totalResult = await client.$queryRaw<{ count: string | bigint }[]>`
    SELECT COUNT(DISTINCT r."uuid") as count
    FROM "Restaurant" r
    WHERE ${finalWhereSql}
  `

  // 執行列表查詢
  const rows = await client.$queryRaw<RestaurantWithScoreRow[]>`
    WITH ranked_restaurants AS (
      SELECT
        r."uuid", r."name", r."nameEn", r."category", r."rating", r."ratingCount", r."reviewCount", r."createdAt",
        (${finalScoreSql}) AS "score",
        ( 
          (${finalScoreSql}) * 0.6 
          + COALESCE(r."rating", 0) * 0.3 
          + CASE WHEN COALESCE(r."reviewCount", 0) > 100 THEN 10 ELSE (COALESCE(r."reviewCount", 0) / 10.0) END * 0.1 
        ) AS "final_rank"
      FROM "Restaurant" r
      WHERE ${finalWhereSql}
      ORDER BY "final_rank" DESC
      LIMIT ${limit} OFFSET ${offset}
    )
    SELECT
      r."uuid", r."name", r."nameEn", r."category", r."rating", r."ratingCount", r."reviewCount", r."createdAt",
      r."score",
      img."uuid" AS "coverUuid",
      img."publicId" AS "coverPublicId",
      img."sortOrder" AS "coverSortOrder"
    FROM ranked_restaurants r
    LEFT JOIN "RestaurantImage" img
      ON img."restaurantUuid" = r."uuid" AND img."type" = 'cover'
    ORDER BY r."final_rank" DESC
  `

  return {
    total: totalResult?.[0]?.count ? Number(totalResult[0].count) : 0,
    rows,
  }
}
