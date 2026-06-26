import { prisma } from '#/db/prisma'

import type { DBClient } from '#/types/database'

import {
  isAdminRestaurantSortField,
} from '#/types/http'
import {
  RestaurantDraftStatus
} from '#/types/domain'


type FindPendingRestaurantsOptions = {
  page: number
  limit: number
  sortColumn: 'submittedAt'
  sortOrder: 'asc' | 'desc'
}

// #region 查詢 draft （依正式餐廳 uuid）
export async function findByRestaurantUuid(
  restaurantUuid: string,
  client: DBClient = prisma
) {
  return client.restaurantDraft.findUnique({
    where: {
      restaurantUuid,
    },
    include: {
      images: true,
    },
  })
}
// #endregion

// 取得待審核餐廳列表（審核用）
export async function findPendingRestaurants({
  page,
  limit,
  sortColumn,
  sortOrder
}: FindPendingRestaurantsOptions,
  client: DBClient = prisma
) {
  const safeSortColumn = isAdminRestaurantSortField(sortColumn) ? sortColumn : 'submittedAt'

  const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc'

  const where = { status: RestaurantDraftStatus.PENDING }

  const [total, rows] = await Promise.all([
    client.restaurantDraft.count({
      where,
    }),
    client.restaurantDraft.findMany({
      where,
      select: {
        uuid: true,
        name: true,
        category: true,
        location: true,
      },
      orderBy: {
        [safeSortColumn]: safeSortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return { total, rows }
}

// 待審核餐廳數量
export async function countPendingRestaurants(
  client: DBClient = prisma
) {

  return client.restaurantDraft.count({
    where: {
      status: RestaurantDraftStatus.PENDING,
    },
  })
}

// #region 查詢 draft（依 draft uuid）
export async function findByDraftUuid(
  uuid: string,
  client: DBClient = prisma
) {
  return client.restaurantDraft.findUnique({
    where: { uuid },
    include: {
      images: true,
    },
  })
}
// #endregion

// #region 建立 draft
export async function createDraft(
  data: {
    uuid: string
    ownerUuid: string
    restaurantUuid: string

    name: string
    nameEn?: string | null
    category: string
    location: string
    phone?: string  | null
    description?: string | null

    submittedAt: Date
  },
  client: DBClient = prisma
) {
  return client.restaurantDraft.create({
    data: {
      uuid: data.uuid,
      restaurantUuid: data.restaurantUuid,

      name: data.name,
      nameEn: data.nameEn,
      category: data.category,
      location: data.location,
      phone: data.phone,
      description: data.description,

      submittedAt: data.submittedAt,

      status: RestaurantDraftStatus.PENDING,
      owner: {
        connect: { uuid: data.ownerUuid }
      },
      newOwner: {
        connect: { uuid: data.ownerUuid }
      }
    },
  })
}
// #endregion


// #region 更新 draft
export async function updateDraft(
  params: {
    uuid: string
    data: Partial<{
      name: string
      nameEn: string | null
      category: string
      location: string
      phone: string | null
      description: string | null
      status: RestaurantDraftStatus
      rejectedAt: Date | null
      submittedAt: Date
      reviewNote: string | null
    }>
  },
  client: DBClient = prisma
) {
  return client.restaurantDraft.update({
    where: { uuid: params.uuid },
    data: params.data,
  })
}
// #endregion


// #region 刪除 draft
export async function deleteDraft(
  uuid: string,
  client: DBClient = prisma
) {
  return client.restaurantDraft.delete({
    where: {
      uuid,
    },
  })
}
// #endregion