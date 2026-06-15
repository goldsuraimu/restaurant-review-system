import { v4 as uuidv4 } from 'uuid'

import { ApiError } from '#/utils/api-error'
import { generateFolder } from './upload.mapper'
import { safeTask } from '#/utils/safe-task'
import { isNonEmptyString } from '#/utils/type-guards'

import {
  deleteFolder,
  deleteImages,
  deleteEmptyFolder,
  signUpload,
} from '#/services/common/cloudinary'

interface SignUploadParams {
  type: string
  params: Record<string, string>
}

/**
 * 產生 Cloudinary 上傳簽名的服務
 * @param type 上傳類型（例如 review, gallery, cover, menu）
 * @param params 生成 folder 所需的參數（例如 restaurantUuid, reviewUuid）
 * @returns 上傳簽名與相關資訊
 */
export function signUploadService({ type, params }: SignUploadParams) {
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!apiKey || !apiSecret || !cloudName) {
    throw new ApiError('伺服器設定錯誤', {
      status: 500,
      code: 'CLOUDINARY_CONFIG_ERROR',
      debugMessage: 'Missing Cloudinary env variables',
    })
  }

  const folder = generateFolder(type, params)

  const timestamp = Math.floor(Date.now() / 1000)

  const publicId = `${type}-${uuidv4()}`

  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
  }

  const signature = signUpload(paramsToSign, apiSecret)

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    publicId,
  }
}


/**
 * 安全刪除整個 Cloudinary 資料夾（背景執行用）
 * @param folderPath 完整資料夾路徑
 */
export function deleteCloudFolder(folderPath: string) {
  (async () => {
    // 刪除 folder 下的所有資源
    await safeTask(`Cloudinary 刪除資源 ${folderPath}`, async () => {
      return await deleteFolder(folderPath)
    })

    // 刪除 folder 本身（Cloudinary folder 是概念上的 prefix）
    await safeTask(`Cloudinary 刪除 folder ${folderPath}`, async () => {
      return await deleteEmptyFolder(folderPath)
    })
  })()
}


/**
 * 安全刪除 Cloudinary 多張圖片（背景執行）
 */
export function deleteCloudinaryImages(publicIds: (string | null | undefined)[]) {

  const filtered = publicIds.filter(isNonEmptyString)

  if (!filtered.length) return

  safeTask(
    `Cloudinary 刪除圖片`,
    async () => {
      return await deleteImages(filtered)
    }
  )
}