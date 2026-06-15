type UuidParam<T extends string> =
  Record<T, string>

export type ReviewParams =
  UuidParam<'reviewUuid'>

export type RestaurantParams =
  UuidParam<'restaurantUuid'>

export type ReviewWithRestaurantParams = {
  restaurantUuid: string;
  reviewUuid: string;
}