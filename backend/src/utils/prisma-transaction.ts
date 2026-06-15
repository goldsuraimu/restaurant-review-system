import { prisma } from '#/db/prisma'
import type { Prisma } from '@prisma/client'

/**
 * 這個工具函式用來執行 Prisma 交易，確保在交易中執行的所有操作要麼全部成功，要麼全部失敗，保持資料的一致性。
 * @param callback 
 * @returns 
 */
export async function withPrismaTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async tx => {
    return callback(tx)
  })
}