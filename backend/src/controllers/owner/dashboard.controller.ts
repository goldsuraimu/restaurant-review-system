import type { Request, Response, NextFunction } from 'express'

import * as ownerDashboardService from '#/services/dashboard/owner.service'

/**
 * GET /owner/dashboard
 * 取得業者餐廳儀表板資訊
 */
export async function getOwnerDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ownerUuid = req.auth.uuid
    const timezone =
      typeof req.query.timezone === 'string'
        ? req.query.timezone
        : undefined

    const days =
      typeof req.query.days === 'string'
        ? Number(req.query.days)
        : 7

    const ratingLimit =
      typeof req.query.ratingLimit === 'string'
        ? Number(req.query.ratingLimit)
        : 5

    const result = await ownerDashboardService.getOwnerDashboard({
      ownerUuid,
      ratingLimit,
      timezone,
      days
    })

    res.status(200).json({
      result
    })
  } catch (err) {
    next(err)
  }
}