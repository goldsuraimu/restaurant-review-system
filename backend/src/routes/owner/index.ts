import { Router } from 'express'

import dashboardRoutes from './dashboard.routes'
import reviewsRoutes from './reviews.routes'
import restaurantsRoutes from './restaurants.routes'

const router = Router()

router.use('/dashboard', dashboardRoutes)
router.use('/reviews', reviewsRoutes)
router.use('/restaurants', restaurantsRoutes)

export default router