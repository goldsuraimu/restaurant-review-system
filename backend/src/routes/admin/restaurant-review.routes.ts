import { Router } from 'express'

import * as controller from '#/controllers/admin/restaurantReview.controller'

import { authenticateToken } from '#/middleware/authenticateToken'
import { authorizeRole } from '#/middleware/authorizeRoles'

const router: Router  = Router()

router.use(authenticateToken(), authorizeRole('admin'))

/**
 * 取得待審核餐廳
 */
router.get('/pending', controller.getPendingRestaurants)

/**
 * 取得待審核餐廳詳細資料
 */
router.get('/:uuid', controller.getRestaurantDetail)

/**
 * 通過
 */
router.patch('/:uuid/approve', controller.approveRestaurant)

/**
 * 拒絕
 */
router.patch('/:uuid/reject', controller.rejectRestaurant)

export default router