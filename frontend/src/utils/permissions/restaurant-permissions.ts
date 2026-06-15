import type {
  RestaurantDisplayStatus
} from '@/types/restaurant'

// 是否可編輯餐廳
export function canEditRestaurant(
  status: RestaurantDisplayStatus
) {
  // 所有狀態皆可編輯
  return [
    'UNDER_REVIEW',

    'REVISION_UNDER_REVIEW',

    'REJECTED',

    'UPDATE_UNDER_REVIEW',

    'UPDATE_REVISION_UNDER_REVIEW',

    'UPDATE_REJECTED',

    'PUBLISHED',
  ].includes(status)
}

// 是否為已上線但正在修改中的餐廳
export function isPublishedWithDraft(
  status: RestaurantDisplayStatus
) {
  return [
    'UPDATE_UNDER_REVIEW',

    'UPDATE_REVISION_UNDER_REVIEW',

    'UPDATE_REJECTED',
  ].includes(status)
}

// 是否可管理評論
export function canManageReviews(
  status: RestaurantDisplayStatus
) {

  // 只要正式餐廳存在即可管理評論
  return [
    'PUBLISHED',

    'UPDATE_UNDER_REVIEW',

    'UPDATE_REVISION_UNDER_REVIEW',

    'UPDATE_REJECTED',
  ].includes(status)
}

// 取得刪除按鈕文字
export function getDeleteButtonText(
  status: RestaurantDisplayStatus
) {
  switch (status) {

    case 'UNDER_REVIEW':
    case 'REVISION_UNDER_REVIEW':
    case 'REJECTED':
      return '取消申請'

    case 'UPDATE_UNDER_REVIEW':
    case 'UPDATE_REVISION_UNDER_REVIEW':
    case 'UPDATE_REJECTED':
      return '取消修改'

    case 'PUBLISHED':
      return '下架餐廳'

    default:
      return '刪除'
  }
}

export function getDeleteConfirmMessage(
  status: RestaurantDisplayStatus
) {

  switch (status) {

    case 'UNDER_REVIEW':

    case 'REVISION_UNDER_REVIEW':

    case 'REJECTED':
      return '確定要取消此次餐廳申請嗎？此操作無法復原'

    case 'UPDATE_UNDER_REVIEW':

    case 'UPDATE_REVISION_UNDER_REVIEW':

    case 'UPDATE_REJECTED':
      return '確定要取消此次餐廳修改嗎？目前已上線的餐廳內容不會受到影響'

    case 'PUBLISHED':
      return '確定要下架這間餐廳嗎？此操作無法復原'

    default:
      return '確定要刪除這筆資料嗎？'
  }
}