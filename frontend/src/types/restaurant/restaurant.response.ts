import type { ApiResponse, ApiPageResponse } from '@/types';
import type { RestaurantDetail, RestaurantOwnerDetail, RestaurantOwnerListItem, RestaurantPublicListItem } from '@/types/restaurant';

export type RestaurantPublicListApiResponse =
  ApiPageResponse<RestaurantPublicListItem>;

export type RestaurantOwnerListApiResponse =
  ApiPageResponse<RestaurantOwnerListItem>;

export type RestaurantDetailApiResponse =
  ApiResponse<RestaurantDetail>;

export type RestaurantOwnerDetailApiResponse =
  ApiResponse<RestaurantOwnerDetail>;