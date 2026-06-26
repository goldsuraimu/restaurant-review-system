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
      newRestaurantDraft: { uuid: restaurantDraftUuid },
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

  const { restaurantDraftUuid, ...rest } = data;

  return client.restaurantDraftImage.create({
    data: {
      ...rest,
      sourceType: data.sourceType ?? 'DRAFT_UPLOAD',
      restaurantDraft: {
        connect: { uuid: restaurantDraftUuid }
      },
      newRestaurantDraft: {
        connect: { uuid: restaurantDraftUuid }
      },
    },
  })
}
// #endregion


// #region 新增多張 draft 圖片
export async function insertImages(
  data: InsertRestaurantDraftImageDto[],
  client: DBClient = prisma
) {
  const promises = data.map(item => insertImage(item, client));
  return Promise.all(promises);
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