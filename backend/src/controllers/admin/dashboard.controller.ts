import * as dashboardService
  from '#/services/admin/dashboard.service'

import type {
  Request,
  Response,
  NextFunction,
} from 'express'

/**
 * GET /admin/dashboard/summary
 * 取得 dashboard 摘要資訊
 */
export async function getDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const result =
      await dashboardService.getDashboardSummary()

    res.status(200).json({
      result,
    })

  } catch (err) {
    next(err)
  }
}