import { ApiError } from '#/utils/api-error'
import { IMAGE_FOLDERS } from '#/constants/imageFolders'


export const uploadFolderMap: Record<string, string> = {
  review: 'reviews',
  gallery: 'galleries',
  cover: 'covers',
  menu: 'menus',
  // 將來如果新增 type，直接加一行
}

/**
 * 根據 type 與 params 生成完整 folder
 * @param type 上傳類型
 * @param params uuid 物件（例如restaurantUuid, reviewUuid 可選）
 */
export function generateFolder(
  type: string,
  params: Record<string, string>
) {
  const folderName = uploadFolderMap[type]

  if (!folderName) {
    throw new ApiError('無效的上傳類型', {
      status: 400,
      code: 'INVALID_UPLOAD_TYPE',
      debugMessage: `Unknown upload type: ${type}`,
    })
  }

  switch (type) {
    case 'review': {
      const { restaurantUuid, reviewUuid } = params

      if (!restaurantUuid || !reviewUuid) {
        throw new ApiError('缺少必要參數', {
          status: 400,
          code: 'MISSING_UUID',
          debugMessage: `Missing restaurantUuid or reviewUuid`,
        })
      }

      return `uploads/${IMAGE_FOLDERS.RESTAURANT}/${restaurantUuid}/reviews/${reviewUuid}`
    }

    case 'gallery':
    case 'cover':
    case 'menu': {
      const { restaurantUuid } = params

      if (!restaurantUuid) {
        throw new ApiError('缺少餐廳識別碼', {
          status: 400,
          code: 'MISSING_RESTAURANT_UUID',
          debugMessage: `Missing restaurantUuid`,
        })
      }

      return `uploads/${IMAGE_FOLDERS.RESTAURANT}/${restaurantUuid}/${folderName}`
    }

    default:
      // 理論上不會進來（前面已擋）
      throw new ApiError('未處理的上傳類型', {
        status: 500,
        code: 'UNHANDLED_UPLOAD_TYPE',
        debugMessage: `Unhandled type: ${type}`,
      })
  }
}