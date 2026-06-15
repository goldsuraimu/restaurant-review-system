import { Router } from 'express';

import * as restaurantController from '#/controllers/restaurants.controller';
import * as reviewController from '#/controllers/reviews.controller';

import { authenticateToken } from '#/middleware/authenticateToken';
import { validateParamUuid } from '#/middleware/validators/validateParamUuid'

const router: Router = Router();

// 列表 + 搜尋 + 排序
router.get('/', restaurantController.list);

// 單筆餐廳
router.get(
  '/:restaurantUuid', 
  validateParamUuid('restaurantUuid'),
  restaurantController.getByUuid
);

// 該餐廳所有評論
router.get(
  '/:restaurantUuid/reviews',
  validateParamUuid('restaurantUuid'),
  reviewController.getByRestaurant
)

// 該餐廳我的評論 (如果有的話)
router.get(
  '/:restaurantUuid/my-review',
  authenticateToken(),
  validateParamUuid('restaurantUuid'),
  reviewController.getMyReview
)

// 新增評論到該餐廳
router.post(
  '/:restaurantUuid/reviews',
  authenticateToken(),
  validateParamUuid('restaurantUuid'),
  reviewController.create
)

// 更新該餐廳評論
router.put(
  '/:restaurantUuid/reviews/:reviewUuid',
  authenticateToken(),
  validateParamUuid('restaurantUuid'),
  validateParamUuid('reviewUuid'),
  reviewController.update
)

// 刪除該餐廳評論
router.delete(
  '/:restaurantUuid/reviews/:reviewUuid',
  authenticateToken(),
  validateParamUuid('restaurantUuid'),
  validateParamUuid('reviewUuid'),
  reviewController.remove
)

export default router;
