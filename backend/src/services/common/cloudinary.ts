import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

import { ApiError } from '#/utils/api-error'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export { cloudinary }

// =========================
// Cloudinary 類型定義
// =========================

// Cloudinary 簽名參數
export type CloudinarySignParams = {
  timestamp: number
  folder: string
  public_id: string
  [key: string]: string | number
}


// =========================
// Cloudinary 相關服務
// =========================

// 上傳圖片
export function uploadImage(
  file: Express.Multer.File,
  folder: string,
  publicId: string,
): Promise<{ url: string; publicId: string }> {

  // =========================
  // 白名單 MIME 驗證
  // =========================
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
  ]

  // 禁止 SVG
  if (file.mimetype === 'image/svg+xml') {
    throw new ApiError('SVG 格式不允許上傳', {
      status: 400,
      code: 'INVALID_IMAGE_FORMAT',
    })
  }

  // 非法格式
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError('不支援的圖片格式', {
      status: 400,
      code: 'INVALID_IMAGE_FORMAT',
    })
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          {
            fetch_format: 'auto', // 自動 webp / avif
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error)

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )

    streamifier.createReadStream(file.buffer).pipe(stream)
  })
}

// 刪除圖片
export function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

// 刪除多張圖片
export function deleteImages(publicIds: string[]) {
  return cloudinary.api.delete_resources(publicIds)
}

// 刪除整個 folder prefix
export function deleteFolder(folderPath: string) {
  return cloudinary.api.delete_resources_by_prefix(folderPath)
}

// 刪除空 folder（先刪除資源，再刪除 folder）
export function deleteEmptyFolder(folderPath: string) {
  return cloudinary.api.delete_folder(folderPath)
}

// 產生簽名
export function signUpload(params: CloudinarySignParams, apiSecret: string) {
  return cloudinary.utils.api_sign_request(params, apiSecret)
}