import { Router } from 'express'

import { authenticateToken } from '#/middleware/authenticateToken'
import { authorizeRole } from '#/middleware/authorizeRoles'
import { validateParamUuid } from '#/middleware/validators/validateParamUuid'

import * as ownerReviewsController from '#/controllers/owner/reviews.controller'

const router = Router()


// 取得業者所有餐廳評論
router.get(
  '/',
  authenticateToken(),
  authorizeRole('owner'),
  ownerReviewsController.getOwnerReviews
)

// 取得業者單一餐廳評論
router.get(
  '/restaurants/:restaurantUuid',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('restaurantUuid'),
  ownerReviewsController.getRestaurantReviews
)


// 業者回覆評論
router.post(
  '/:reviewUuid/reply',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('reviewUuid'),
  ownerReviewsController.replyReview
)

// 業者編輯回覆
router.patch(
  '/:reviewUuid/reply',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('reviewUuid'),
  ownerReviewsController.editReply
)

// 業者刪除回覆
router.delete(
  '/:reviewUuid/reply',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('reviewUuid'),
  ownerReviewsController.deleteReply
)


export default router