import { Router } from 'express'

import * as dashboardController
  from '#/controllers/admin/dashboard.controller'

const router: Router = Router()

/**
 * GET /admin/dashboard/summary
 * 取得管理員 dashboard 摘要
 */
router.get(
  '/summary',
  dashboardController.getDashboardSummary
)

export default router