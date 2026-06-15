import type { Request, Response, NextFunction } from 'express';

import * as ownerRestaurantService from '#/services//restaurant/owner.service';

import { parsePaginationQuery } from '#/utils/http/parse-pagination-query'

import {
  isRestaurantOwnerStatus,
  RestaurantOwnerStatus
} from '#/types/domain/restaurant-owner-status';

import type {
  RestaurantParams
} from '#/types/http'


/**
 * POST /owner/restaurants
 * 建立餐廳（Owner）
 */
export async function createOwnerRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      restaurantUuid,
      coverImage,
      galleryImages,
      menuImages,
      ...body
    } = req.body;

    const images = {
      coverImage,
      galleryImages,
      menuImages
    }

    await ownerRestaurantService.createOwnerRestaurant(
      {
        restaurantUuid,
        ownerUuid: req.auth.uuid,
        body,
        images
      }
    );

    res.sendStatus(201)
  } catch (err) {
    next(err);
  }
}

/**
 * GET /owner/restaurants
 * 取得餐廳列表（Owner）
 */
export async function getOwnerRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit } = parsePaginationQuery(req.query)


    const displayStatus = isRestaurantOwnerStatus(req.query.displayStatus)
      ? req.query.displayStatus
      : RestaurantOwnerStatus.ALL

    const result =
      await ownerRestaurantService.getOwnerRestaurants({
        ownerUuid: req.auth.uuid,
        page,
        limit,
        displayStatus,
      })

    res.status(200).json(result)

  } catch (err) {
    next(err)
  }
}

/**
 * GET /owner/restaurants/rankings
 * 取得餐廳排名（Owner）
 */
export async function getOwnerRestaurantRankings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit } = parsePaginationQuery(req.query)

    const result =
      await ownerRestaurantService.getOwnerRestaurantRankings({
        ownerUuid: req.auth.uuid,
        page,
        limit
      })

    res.status(200).json(result)

  } catch (err) {
    next(err)
  }
}


/**
 * GET /owner/restaurants/:restaurantUuid
 * 取得單一餐廳（Owner）
 */
export async function getOwnerRestaurantDetail(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await ownerRestaurantService.getOwnerRestaurantDetail({
      ownerUuid: req.auth.uuid,
      restaurantUuid: req.params.restaurantUuid,
    })

    res.status(200).json({ result })
  } catch (err) {
    next(err)
  }
}


/**
 * PATCH /owner/restaurants/:restaurantUuid
 * 更新餐廳（Owner）
 */
export async function updateOwnerRestaurant(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const restaurantUuid = req.params.restaurantUuid;
    const ownerUuid = req.auth.uuid;
    const {
      coverImage,
      galleryImages,
      menuImages,
      deletedImages,
      ...body
    } = req.body;

    const images = {
      coverImage,
      galleryImages,
      menuImages
    }


    await ownerRestaurantService.updateOwnerRestaurant({
      ownerUuid,
      uuid: restaurantUuid,
      body,
      images,
      deletedImages,
    })

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}



/**
 * DELETE /owner/restaurants/:restaurantUuid
 * 刪除餐廳（Owner）
 */
export async function deleteOwnerRestaurant(
  req: Request<RestaurantParams>,
  res: Response,
  next: NextFunction
) {
  try {
    await ownerRestaurantService.deleteOwnerRestaurant({
      ownerUuid: req.auth.uuid,
      restaurantUuid: req.params.restaurantUuid,
      displayStatus: req.body.displayStatus,
    })

      res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}