import * as reviewService from '#/services/admin/restaurant-review.service'

import { assertValidUuid } from '#/utils/uuid'
import { parsePaginationQuery } from '#/utils/http/parse-pagination-query'

import {
  isAdminRestaurantSortField
} from '#/types/http'

import type { Request, Response, NextFunction } from 'express'

/**
 * GET /admin/restaurants/pending
 * 取得待審核餐廳
 */
export async function getPendingRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit, order } = parsePaginationQuery(req.query)

    const sort = isAdminRestaurantSortField(req.query.sort)
      ? req.query.sort
      : undefined

    const result = await reviewService.getPendingRestaurants({
      page,
      limit,
      sort,
      order,
    })
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /admin/restaurants/:uuid
 * 取得餐廳詳細資訊
 * 供審核使用
 */
export async function getRestaurantDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const uuid = assertValidUuid(req.params.uuid)

    const result = await reviewService.getRestaurantDetail(uuid)

    res.status(200).json({ result })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /admin/restaurants/:uuid/approve
 * 通過餐廳
 */
export async function approveRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const uuid = assertValidUuid(req.params.uuid)

    await reviewService.approveRestaurant(uuid)

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /admin/restaurants/:uuid/reject
 * 拒絕餐廳
 */
export async function rejectRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const uuid = assertValidUuid(req.params.uuid)
    const { reason } = req.body

    await reviewService.rejectRestaurant(uuid, reason)

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}