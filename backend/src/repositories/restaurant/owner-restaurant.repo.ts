import { prisma } from '#/db/prisma'

import type { DBClient } from '#/types/database'



export async function findOwnerRestaurants(
  {
    ownerUuid,
  }: {
    ownerUuid: string
  },
  client: DBClient = prisma
) {

  const [
    restaurants,
    drafts,
  ] = await Promise.all([

    client.restaurant.findMany({
      where: {
        newOwner: { uuid: ownerUuid },
      },

      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],

      include: {
        images: {
          where: {
            type: 'cover',
          },

          take: 1,

          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    }),

    client.restaurantDraft.findMany({
      where: {
        newOwner: { uuid: ownerUuid },
      },

      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' },
      ],

      include: {
        images: {
          where: {
            type: 'cover',
          },

          take: 1,

          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    }),
  ])

  return {
    restaurants,
    drafts,
  }
}
