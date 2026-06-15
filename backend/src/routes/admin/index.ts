import { Router } from 'express'

import adminRestaurantReviewRoutes from './restaurant-review.routes'
import adminDashboardRoutes from './dashboard.routes'

const router: Router = Router();

router.use(
  '/restaurants', 
  adminRestaurantReviewRoutes
)

router.use(
  '/dashboard',
  adminDashboardRoutes
)

export default router