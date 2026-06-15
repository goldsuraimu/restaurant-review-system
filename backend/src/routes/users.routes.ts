import { Router } from 'express';
import { authenticateToken } from '#/middleware/authenticateToken';
import * as userController from '#/controllers/users.controller';

const router: Router = Router();


// 取得使用者基本資料
router.get('/me', authenticateToken(), userController.getMe);

// 取得使用者個人資料
router.get('/me/profile', authenticateToken(), userController.getMyProfile);

// 更新使用者資料
router.put('/me', authenticateToken(), userController.updateMe);

// 成為餐廳業者
router.post(
  '/me/become-owner',
  authenticateToken(),
  userController.becomeOwner
);

export default router;
