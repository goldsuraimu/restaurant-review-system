import { prisma } from '#/db/prisma';

import type { DBClient } from '#/types/database'

import {
  RestaurantImageType
} from '#/types/domain'

export interface InsertRestaurantImageDto {
  uuid: string

  restaurantId: number

  type: RestaurantImageType

  url: string
  publicId: string

  sortOrder?: number
}


// 新增圖片
export async function insertImage(
  data: InsertRestaurantImageDto,
  client: DBClient = prisma
) {
  return client.restaurantImage.create({ 
    data
  })
}


// 新增圖片 (多張)
export async function insertImages(
  data: InsertRestaurantImageDto[],
  client: DBClient = prisma
) {
  const promises = data.map(item => insertImage(item, client));
  return Promise.all(promises);
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
