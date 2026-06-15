import { prisma } from '#/db/prisma';

import type { DBClient } from '#/types/database'

import {
  RestaurantImageType
} from '#/types/domain'

export interface InsertRestaurantImageDto {
  uuid: string

  restaurantUuid?: string

  type: RestaurantImageType

  url: string
  publicId: string

  sortOrder?: number
}


//  取得某餐廳的所有圖片
export async function findByRestaurantUuid(
  restaurantUuid: string,
  client: DBClient = prisma
) {
  return client.restaurantImage.findMany({
    where: {
      restaurantUuid,
    },
    select: {
      uuid: true,
      type: true,
      url: true,
      sortOrder: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });
}

// 新增圖片
export async function insertImage(
  data: InsertRestaurantImageDto,
  client: DBClient = prisma
) {
  return client.restaurantImage.create({ data })
}


// 新增圖片 (多張)
export async function insertImages(
  data: InsertRestaurantImageDto[],
  client: DBClient = prisma
) {
  return client.restaurantImage.createMany({
    data,
  })
}

// 刪除餐廳圖片 (多張)
export async function deleteImagesByUuid(
  imageUuids: string[],
  client: DBClient = prisma
) {
  return client.restaurantImage.deleteMany({
    where: { uuid: { in: imageUuids } },
  })
}
