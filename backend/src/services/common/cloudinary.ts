import { v2 as cloudinary } from 'cloudinary'

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