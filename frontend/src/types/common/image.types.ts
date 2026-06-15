// 後端回傳的基礎圖片資源
export interface BaseImage {
  uuid: string
  url: string 
}

// UI 層使用的圖片型別
export type ImageUI =
  | {
    type: 'existing'
    uuid: string
    url: string
  }
  | {
    type: 'new'
    file: File
    previewUrl: string
  }
