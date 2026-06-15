import { Router } from 'express';

import { authenticateToken } from '#/middleware/authenticateToken';
import { authorizeRole } from '#/middleware/authorizeRoles';
import { validateParamUuid } from '#/middleware/validators/validateParamUuid'

import * as ownerRestaurantsController from '#/controllers/owner/restaurants.controller';

const router: Router = Router();

// 業者建立餐廳
router.post(
  '/',
  authenticateToken(),
  authorizeRole('owner'),
  ownerRestaurantsController.createOwnerRestaurant
);

// 取得業者餐廳列表
router.get(
  '/',
  authenticateToken(),
  authorizeRole('owner'),
  ownerRestaurantsController.getOwnerRestaurants
)

// 取得餐廳排名
router.get(
  '/rankings',
  authenticateToken(),
  authorizeRole('owner'),
  ownerRestaurantsController.getOwnerRestaurantRankings
)

// 取得單一餐廳
router.get(
  '/:restaurantUuid',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('restaurantUuid'),
  ownerRestaurantsController.getOwnerRestaurantDetail
)

// 更新餐廳
router.patch(
  '/:restaurantUuid',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('restaurantUuid'),
  ownerRestaurantsController.updateOwnerRestaurant
)

// 刪除餐廳
router.delete(
  '/:restaurantUuid',
  authenticateToken(),
  authorizeRole('owner'),
  validateParamUuid('restaurantUuid'),
  ownerRestaurantsController.deleteOwnerRestaurant
)


export default router;
