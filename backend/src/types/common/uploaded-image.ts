// 共用圖片型別
export interface UploadedImage {
  url: string           // Cloudinary 圖片 URL
  publicId: string      // Cloudinary publicId，方便刪除
}