import { prisma } from '#/db/prisma';

import type { DBClient } from '#/types/database'


// 新增 refresh token
export async function insert({
  id,
  userUuid,
  expiresAt,
}: {
  id: string;
  userUuid: string;
  expiresAt: number;
},
  client: DBClient = prisma
) {
  return client.refreshToken.create({
    data: {
      id,
      userUuid,
      expiresAt,
    },
  });
}

// 以 id 查詢 refresh token
export async function findById(
  id: string,
  client: DBClient = prisma
) {
  return client.refreshToken.findUnique({
    where: { id },
  });
}

// 註銷 refresh token（更新 revokedAt 欄位）
export async function revoke(
  id: string,
  client: DBClient = prisma
) {
  return client.refreshToken.update({
    where: { id },
    data: {
      revokedAt: Math.floor(Date.now() / 1000),
    },
  });
}