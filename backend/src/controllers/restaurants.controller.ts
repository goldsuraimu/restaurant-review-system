import { listRestaurants, getRestaurantByUuid } from '#/services/restaurant/public.service'

import { parsePaginationQuery } from '#/utils/http/parse-pagination-query'

import type { Request, Response, NextFunction } from 'express'
import { RESTAURANT_SORT_FIELDS } from '#/types/http'
import type {
  RestaurantSortField
} from '#/types/http'


// GET /restaurants
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // q: string | string[] | undefined → normalize 成 string | undefined
    const qRaw =
      typeof req.query['q[]'] === 'string'
        ? req.query['q[]']
        : Array.isArray(req.query['q[]'])
          ? req.query['q[]'].join(' ')
          : undefined

    const { page, limit, order } = parsePaginationQuery(req.query)

    function isRestaurantSortField(v: unknown): v is RestaurantSortField {
      return typeof v === 'string' &&
        RESTAURANT_SORT_FIELDS.includes(v as RestaurantSortField)
    }


    const sort = isRestaurantSortField(req.query.sort)
      ? req.query.sort
      : undefined

    const result = await listRestaurants({
      qRaw,
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

// GET /restaurants/:restaurantUuid
export async function getByUuid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const restaurantUuid = req.params.restaurantUuid as string

    const restaurant = await getRestaurantByUuid(restaurantUuid)

    res.status(200).json({ result: restaurant })
  } catch (err) {
    next(err)
  }
}
