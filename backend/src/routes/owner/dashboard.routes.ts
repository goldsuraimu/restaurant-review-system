import { Router } from 'express'

import { authenticateToken } from '#/middleware/authenticateToken'
import { authorizeRole } from '#/middleware/authorizeRoles'

import * as ownerDashboardController from '#/controllers/owner/dashboard.controller'

const router: Router = Router()

// 取得業者餐廳儀表板資訊
router.get(
  '/',
  authenticateToken(),
  authorizeRole('owner'),
  ownerDashboardController.getOwnerDashboard
)

export default router