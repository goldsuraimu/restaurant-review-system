export enum RestaurantOwnerStatus {
  UNDER_REVIEW = 'UNDER_REVIEW',  // 初次建立第一次送審

  REVISION_UNDER_REVIEW = 'REVISION_UNDER_REVIEW',  // 初次建立被退件後重新送審

  REJECTED = 'REJECTED',  // 初次建立被退件

  UPDATE_UNDER_REVIEW = 'UPDATE_UNDER_REVIEW',  // 已上線餐廳修改審核中

  UPDATE_REVISION_UNDER_REVIEW =
  'UPDATE_REVISION_UNDER_REVIEW',  // 已上線餐廳修改被退件後重新送審

  UPDATE_REJECTED = 'UPDATE_REJECTED',  // 已上線餐廳修改被退件

  PUBLISHED = 'PUBLISHED',  // 正式上線

  ALL = 'ALL',  
}
const restaurantOwnerStatuses = new Set(
  Object.values(RestaurantOwnerStatus)
)

export function isRestaurantOwnerStatus(
  value: unknown
): value is RestaurantOwnerStatus {

  return (
    typeof value === 'string' &&
    restaurantOwnerStatuses.has(
      value as RestaurantOwnerStatus
    )
  )
}

/**
* 是否屬於「已上線中的餐廳」
* 包含：
* - 正式上線
* - 上線後修改審核中
* - 上線後修改被退件
* - 上線後修改被退件後重新送審
* 不包含：
* - 初次建立審核中
* - 初次建立被退件
* - 初次建立重新送審
* - 其他非正式上線的狀態
* 這個函式主要用在餐廳列表頁面，業者想要看到「已上線」的餐廳，不想被「審核中」的餐廳干擾視覺
* 其他需要區分「已上線」和「審核中」的地方也可以使用這個函式
* @param status 餐廳狀態
*/
export function isPublishedOwnerStatus(
  status: RestaurantOwnerStatus
) {

  return (
    status === RestaurantOwnerStatus.PUBLISHED ||

    status ===
    RestaurantOwnerStatus.UPDATE_UNDER_REVIEW ||

    status ===
    RestaurantOwnerStatus.UPDATE_REVISION_UNDER_REVIEW ||

    status ===
    RestaurantOwnerStatus.UPDATE_REJECTED
  )
}