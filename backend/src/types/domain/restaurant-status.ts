export enum RestaurantDraftStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export function isRestaurantDraftStatus(value: string): value is RestaurantDraftStatus {
  return Object.values(RestaurantDraftStatus).includes(value as RestaurantDraftStatus)
}