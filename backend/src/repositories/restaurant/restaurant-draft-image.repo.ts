import { prisma } from '#/db/prisma'

import type { DBClient } from '#/types/database'

import { 
  RestaurantDraftImageSource,
  RestaurantImageType
} from '#/types/domain'

export interface InsertRestaurantDraftImageDto {
  uuid: string

  restaurantDraftUuid: string

  type: RestaurantImageType

  url: string

  publicId: string

  sourceType: RestaurantDraftImageSource

  sortOrder?: number
}


// #region 查詢 draft 圖片
export async function findByDraftUuid(
  restaurantDraftUuid: string,
  client: DBClient = prisma
) {
  const rows = await client.restaurantDraftImage.findMany({
    where: {
      restaurantDraftUuid,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  })

  return rows.map(row => ({
    ...row,
    type: row.type as RestaurantImageType,
    sourceType:
      row.sourceType as RestaurantDraftImageSource,
  }))
}
// #endregion


// #region 新增單張 draft 圖片
export async function insertImage(
  data: InsertRestaurantDraftImageDto,
  client: DBClient = prisma
) {
  return client.restaurantDraftImage.create({
    data: {
      ...data,
      sourceType: data.sourceType ?? 'DRAFT_UPLOAD',
    },
  })
}
// #endregion


// #region 新增多張 draft 圖片
export async function insertImages(
  data: InsertRestaurantDraftImageDto[],
  client: DBClient = prisma
) {
  return client.restaurantDraftImage.createMany({
    data: data.map(item => ({
      ...item,
      sourceType: item.sourceType ?? 'DRAFT_UPLOAD',
    })),
  })
}
// #endregion


// #region 刪除 draft 圖片
export async function deleteImagesByUuid(
  imageUuids: string[],
  client: DBClient = prisma
) {
  return client.restaurantDraftImage.deleteMany({
    where: {
      uuid: {
        in: imageUuids,
      },
    },
  })
}
// #endregion