import type { 
  ApiPageResponse,
  ApiResponse, 
} from '@/types';
import type { AdminRestaurantListItem } from '@/types/restaurant';



export interface AdminDashboardSummary {
  pendingRestaurantCount: number
}

// admin 後台資訊
export type AdminDashboardSummaryApiResponse =
  ApiResponse<AdminDashboardSummary>

// 後端回傳的待審核餐廳列表（包含分頁資訊） 
export type AdminRestaurantListApiResponse =
  ApiPageResponse<AdminRestaurantListItem>;