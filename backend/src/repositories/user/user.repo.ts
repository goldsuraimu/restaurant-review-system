import { prisma } from '#/db/prisma';

import type { DBClient } from '#/types/database'
import type {
  UpdateUserProfilePayload,
} from '#/types/dto';
import type {
  CreateUserData,
} from '#/repositories/types/user'
import type {
  UserRole,
} from '#/types/domain/user'

// 依 email 找使用者
export async function findByEmail(
  email: string, 
  client: DBClient = prisma
) {
  return client.user.findUnique({
    where: { email },
  });
}

// 檢查 email 是否存在
export async function existsByEmail(
  email: string, 
  client: DBClient = prisma
): Promise<boolean> 
{
  const user = await client.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
}

// 檢查 username 是否存在
export async function existsByUsername(
  username: string, 
  client: DBClient = prisma
): Promise<boolean> 
{
  const user = await client.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!user;
}

// 新增使用者
export async function insertUser(
  data: CreateUserData, 
  client: DBClient = prisma
) {
  return client.user.create({
    data,
  });
}

// 依 UUID 找使用者
export async function findByUUID(
  uuid: string, 
  client: DBClient = prisma
) {
  return client.user.findUnique({
    where: { uuid },
  });
}

// 更新使用者 profile
export async function updateProfileByUUID(
  uuid: string,
  payload: UpdateUserProfilePayload,
  client: DBClient = prisma
) {
  return client.user.update({
    where: { uuid },
    data: {
      ...payload,
    },
  });
}


// 更新使用者 role
export async function updateRoleByUUID(
  uuid: string,
  role: UserRole,
  client: DBClient = prisma
) {
  return client.user.update({
    where: {
      uuid,
    },

    data: {
      role,
    },
  })
}