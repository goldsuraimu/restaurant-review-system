import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Prisma } from '@prisma/client'

import { ApiError } from '#/utils/api-error'
import { withPrismaTransaction } from '#/utils/prisma-transaction'
import { validateCreateRestaurant } from '#/validators/restaurant.validator'
import { handleServiceError } from '#/utils/service-error'
import { buildMeta } from '#/utils/pagination-meta'
import { IMAGE_FOLDERS } from '#/constants/imageFolders'
import { deleteCloudFolder, deleteCloudinaryImages } from '../upload/upload.service'

import * as restaurantRepo from '#/repositories/restaurant/restaurant.repo'
import * as OwnerRestaurantRepo from '#/repositories/restaurant/owner-restaurant.repo'
import * as restaurantDraftRepo from '#/repositories/restaurant/restaurant-draft.repo'
import * as restaurantDraftImageRepo from '#/repositories/restaurant/restaurant-draft-image.repo'
import {
  formatRestaurantForClient,
  toRestaurantDetail,
  formatOwnerRestaurantRanking,
} from './restaurant.mapper'

import {
  toOwnerRestaurantListItem,
  toRestaurantDraftDetail,
  formatRestaurantDraftForClient
} from './owner-restaurant.mapper'

import type { CreateRestaurantDto, UpdateRestaurantDto } from '#/types/dto'
import {
  RestaurantImageType,
  RestaurantDraftImageSource,
  RestaurantOwnerStatus,
  RestaurantDraftStatus,
  isPublishedOwnerStatus
} from '#/types/domain'
import type { UploadedImage } from '#/types/common/uploaded-image'


interface CreateOwnerRestaurantParams {
  restaurantUuid: string
  ownerUuid: string
  body: CreateRestaurantDto
  images: {
    coverImage: UploadedImage[]
    galleryImages: UploadedImage[]
    menuImages: UploadedImage[]
  }
}

interface UpdateOwnerRestaurantParams {
  ownerUuid: string
  uuid: string
  body: UpdateRestaurantDto
  images: {
    coverImage: UploadedImage[]
    galleryImages: UploadedImage[]
    menuImages: UploadedImage[]
  }
  deletedImages: string[]
}

type OwnerRestaurantListQuery = {
  ownerUuid: string
  page?: number
  limit?: number
  displayStatus?: RestaurantOwnerStatus
}

type RestaurantImageInput = {
  type: RestaurantImageType
  image: UploadedImage
  sortOrder: number
}

type DraftLite = {
  uuid: string
  ownerUuid: string
}

type ImageDraftLite = {
  uuid: string
  type: RestaurantImageType
  url: string
  publicId: string
  sourceType: RestaurantDraftImageSource
  sortOrder: number
}

// #region 建立餐廳草稿（Owner）
export async function createOwnerRestaurant({
  restaurantUuid,
  ownerUuid,
  body,
  images,
}: CreateOwnerRestaurantParams) {
  validateCreateRestaurant(body)

  const coverCount = images?.coverImage?.length ?? 0
  const galleryCount = images?.galleryImages?.length ?? 0
  const menuCount = images?.menuImages?.length ?? 0

  if (coverCount === 0) {
    throw new ApiError('封面圖片必填', {
      status: 400,
      code: 'COVER_IMAGE_REQUIRED',
    })
  }

  if (menuCount === 0) {
    throw new ApiError('至少需上傳 1 張菜單圖片', {
      status: 400,
      code: 'MENU_IMAGE_REQUIRED',
    })
  }

  if (coverCount > 1) {
    throw new ApiError('封面圖片僅能上傳 1 張', {
      status: 400,
      code: 'COVER_IMAGE_LIMIT_EXCEEDED',
    })
  }

  if (galleryCount > 10) {
    throw new ApiError('展示圖片最多 10 張', {
      status: 400,
      code: 'GALLERY_IMAGE_LIMIT_EXCEEDED',
    })
  }

  if (menuCount > 10) {
    throw new ApiError('菜單圖片最多 10 張', {
      status: 400,
      code: 'MENU_IMAGE_LIMIT_EXCEEDED',
    })
  }

  // 圖片處理 
  const imageList: RestaurantImageInput[] = []

  if (images.coverImage[0]) {
    imageList.push({
      type: RestaurantImageType.COVER,
      image: images.coverImage[0],
      sortOrder: 0,
    })
  }

  images.galleryImages.forEach((image, index) => {
    imageList.push({ type: RestaurantImageType.GALLERY, image, sortOrder: index + 1 })
  })

  images.menuImages.forEach((image, index) => {
    imageList.push({ type: RestaurantImageType.MENU, image, sortOrder: index })
  })

  try {
    await withPrismaTransaction(async tx => {
      const {
        name,
        nameEn,
        category,
        location,
        phone,
        description,
      } = body

      const restaurantDraftUuid = uuidv4()
      // 先建立草稿，再由後續流程審核後轉正式餐廳
      await restaurantDraftRepo.createDraft(
        {
          uuid: restaurantDraftUuid,
          ownerUuid,

          // 初次建立時沒有正式餐廳，但是前端上傳雲端圖片需要對應餐廳的 uuid，所以前端先產生一個 uuid 傳給後端，後端再放到 draft 的 restaurantUuid 欄位，等正式餐廳建立後再使用這個 uuid
          restaurantUuid,

          name,
          nameEn,
          category,
          location,
          phone,
          description,

          submittedAt: new Date(),
        },
        tx
      )

      const imagesToCreate = imageList.map(img => ({
        uuid: uuidv4(),     // 新增每張圖片的 uuid

        restaurantDraftUuid,  // 對應到該草稿

        type: img.type,     // 圖片類型

        url: img.image.url,    // 圖片網址

        publicId: img.image.publicId,   // 圖片 public_id

        sourceType: RestaurantDraftImageSource.DRAFT_UPLOAD,   // 圖片來源（草稿上傳）

        sortOrder: img.sortOrder    // 圖片排序
      }))

      await restaurantDraftImageRepo.insertImages(imagesToCreate, tx)

      return 
    })
  } catch (err) {
    handleServiceError(err, '建立餐廳失敗')
  }
}
// #endregion


// #region 取得餐廳列表（Owner）
export async function getOwnerRestaurants(
  query: OwnerRestaurantListQuery
) {

  try {

    const {
      ownerUuid,
      page = 1,
      limit = 20,
      displayStatus,
    } = query

    const {
      restaurants,
      drafts,
    } =
      await OwnerRestaurantRepo.findOwnerRestaurants({
        ownerUuid,
      })

    const restaurantMap =
      new Map(
        restaurants.map(r => [r.uuid, r])
      )

    const mergedRows =
      drafts.map(draft => {

        const publishedRestaurant =
          draft.restaurantUuid
            ? restaurantMap.get(
              draft.restaurantUuid
            ) ?? null
            : null

        let finalDisplayStatus:
          RestaurantOwnerStatus

        // 使用 switch(true) 做狀態分類
        switch (true) {

          // 初次建立第一次送審
          case (
            !publishedRestaurant &&
            draft.status === RestaurantDraftStatus.PENDING &&
            !draft.rejectedAt
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus.UNDER_REVIEW

            break

          // 初次建立被拒後重新送審
          case (
            !publishedRestaurant &&
            draft.status === RestaurantDraftStatus.PENDING &&
            !!draft.rejectedAt
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus
                .REVISION_UNDER_REVIEW

            break

          // 初次建立被拒
          case (
            !publishedRestaurant &&
            draft.status === RestaurantDraftStatus.REJECTED
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus.REJECTED

            break

          // 已上線餐廳修改審核中
          case (
            !!publishedRestaurant &&
            draft.status === RestaurantDraftStatus.PENDING &&
            !draft.rejectedAt
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus
                .UPDATE_UNDER_REVIEW

            break

          // 已上線餐廳修改被拒後重新送審
          case (
            !!publishedRestaurant &&
            draft.status === RestaurantDraftStatus.PENDING &&
            !!draft.rejectedAt
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus
                .UPDATE_REVISION_UNDER_REVIEW

            break

          // 已上線餐廳修改被拒
          case (
            !!publishedRestaurant &&
            draft.status === RestaurantDraftStatus.REJECTED
          ):

            finalDisplayStatus =
              RestaurantOwnerStatus.UPDATE_REJECTED

            break

          // 防呆
          default:

            throw new ApiError('未知的草稿狀態', {
              status: 500,
              code: 'INVALID_DRAFT_STATUS',
            })
        }

        return {
          draft,
          publishedRestaurant,
          displayStatus: finalDisplayStatus,
        }
      })

    // 沒有 draft 的正式餐廳
    const publishedOnlyRows =
      restaurants

        .filter(restaurant => {

          const hasDraft =
            drafts.some(
              draft =>
                draft.restaurantUuid ===
                restaurant.uuid
            )

          return !hasDraft
        })

        .map(restaurant => ({
          draft: null,

          publishedRestaurant: restaurant,

          displayStatus:
            RestaurantOwnerStatus.PUBLISHED,
        }))

    // 合併所有資料
    let finalRows = [
      ...mergedRows,
      ...publishedOnlyRows,
    ]

    // displayStatus 篩選
    if (
      displayStatus &&
      displayStatus !== RestaurantOwnerStatus.ALL
    ) {

      finalRows =
        finalRows.filter(row => {

          if (
            displayStatus ===
            RestaurantOwnerStatus.PUBLISHED
          ) {

            return isPublishedOwnerStatus(
              row.displayStatus
            )
          }

          return (
            row.displayStatus === displayStatus
          )
        })
    }

    // 排序
    finalRows.sort((a, b) => {

      const aDate =
        a.draft?.submittedAt ??
        a.publishedRestaurant?.updatedAt ??
        a.publishedRestaurant?.createdAt

      const bDate =
        b.draft?.submittedAt ??
        b.publishedRestaurant?.updatedAt ??
        b.publishedRestaurant?.createdAt

      return (
        (bDate?.getTime() ?? 0) -
        (aDate?.getTime() ?? 0)
      )
    })

    // 頁碼計算
    const total = finalRows.length

    const paginatedRows =
      finalRows.slice(
        (page - 1) * limit,
        page * limit
      )

    return {

      results:
        paginatedRows.map(
          toOwnerRestaurantListItem
        ),

      meta:
        buildMeta(
          total,
          page,
          limit
        ),
    }

  } catch (err) {

    handleServiceError(
      err,
      '取得餐廳列表失敗'
    )
  }
}
// #endregion


// #region 取得單一餐廳（Owner）
export async function getOwnerRestaurantDetail({
  ownerUuid,
  restaurantUuid,
}: {
  ownerUuid: string
  restaurantUuid: string
}) {
  try {
    const draft =
      await restaurantDraftRepo.findByRestaurantUuid(restaurantUuid)

    if (draft) {

      if (draft.ownerUuid !== ownerUuid) {

        throw new ApiError('無權限', {
          status: 403,
          code: 'FORBIDDEN',
        })
      }

      return formatRestaurantDraftForClient(
        toRestaurantDraftDetail(draft)
      )
    }

    // 如果草稿不存在，則查正式餐廳
    const restaurant =
      await restaurantRepo.findByUUID(restaurantUuid)

    if (!restaurant) {

      throw new ApiError('找不到餐廳或草稿', {
        status: 404,
        code: 'RESTAURANT_NOT_FOUND',
      })
    }

    if (restaurant.ownerUuid !== ownerUuid) {

      throw new ApiError('無權限', {
        status: 403,
        code: 'FORBIDDEN',
      })
    }

    return formatRestaurantForClient(
      toRestaurantDetail(restaurant)
    )
  } catch (err) {
    handleServiceError(err, '取得餐廳詳情失敗')
  }
}
// #endregion

// #region 取得餐廳排名（Owner）
export async function getOwnerRestaurantRankings({
  ownerUuid,
  page = 1,
  limit = 10
}: {
  ownerUuid: string
  page?: number
  limit?: number
}) {
  try {
    const { total, rows } =
      await restaurantRepo.findOwnerRestaurantRankings({
        ownerUuid,
        page,
        limit
      })

    return {
      results: formatOwnerRestaurantRanking(rows),
      meta: buildMeta(total, page, limit)
    }

  } catch (err) {
    handleServiceError(err, '取得餐廳排名失敗')
  }
}
// #endregion



// #region 更新餐廳（Owner）
export async function updateOwnerRestaurant({
  ownerUuid,
  uuid,
  body,
  images,
  deletedImages,

}: UpdateOwnerRestaurantParams) {

  validateCreateRestaurant(body)

  try {

    const result = await withPrismaTransaction(async tx => {

      // 查正式餐廳
      const restaurant =
        await restaurantRepo.findByUUID(
          uuid,
          tx
        )

      let draft: DraftLite | null = null

      // 正式餐廳編輯
      if (restaurant) {

        if (restaurant.ownerUuid !== ownerUuid) {
          throw new ApiError('無權限', {
            status: 403,
            code: 'FORBIDDEN',
          })
        }

        draft =
          await restaurantDraftRepo.findByRestaurantUuid(
            restaurant.uuid,
            tx
          )

        // 第一次建立 draft
        if (!draft) {

          const restaurantDraftUuid = uuidv4()

          draft =
            await restaurantDraftRepo.createDraft(
              {
                uuid: restaurantDraftUuid,
                ownerUuid,
                restaurantUuid: restaurant.uuid,

                name: body.name,
                nameEn: body.nameEn,

                category: body.category,

                location: body.location,

                phone: body.phone,

                description: body.description,

                submittedAt: new Date(),
              },
              tx
            )

          const finalDraft = draft

          if (!finalDraft) {

            throw new ApiError('草稿建立失敗', {
              status: 500,
              code: 'DRAFT_CREATE_FAILED',
            })
          }

          // 複製正式圖片到 draft
          if (restaurant.images.length) {

            await restaurantDraftImageRepo.insertImages(

              restaurant.images.map(img => ({
                uuid: uuidv4(),

                restaurantDraftUuid: finalDraft.uuid,  // 對應到該草稿

                type: img.type as RestaurantImageType,

                url: img.url,

                publicId: img.publicId,

                sourceType: RestaurantDraftImageSource.PUBLISHED,   // 圖片來源（來自正式餐廳）

                sortOrder: img.sortOrder,
              })),

              tx
            )
          }
        }

        // draft 已存在
        else {

          await restaurantDraftRepo.updateDraft(
            {
              uuid: draft.uuid,
              data: {
                ...body,
                status: RestaurantDraftStatus.PENDING,
                submittedAt: new Date(),
              },
            },
            tx
          )
        }
      }

      // draft 編輯
      else {

        draft =
          await restaurantDraftRepo.findByRestaurantUuid(
            uuid,
            tx
          )

        if (!draft) {

          throw new ApiError('找不到餐廳或草稿', {
            status: 404,
            code: 'RESTAURANT_NOT_FOUND',
          })
        }

        if (draft.ownerUuid !== ownerUuid) {

          throw new ApiError('無權限', {
            status: 403,
            code: 'FORBIDDEN',
          })
        }

        await restaurantDraftRepo.updateDraft(
          {
            uuid: draft.uuid,
            data: {
              ...body,
              status: RestaurantDraftStatus.PENDING,
              submittedAt: new Date(),
            },
          },
          tx
        )
      }

      if (!draft) {

        throw new ApiError('草稿建立失敗', {
          status: 500,
          code: 'DRAFT_CREATE_FAILED',
        })
      }

      const existingImages: ImageDraftLite[] =
        await restaurantDraftImageRepo.findByDraftUuid(
          draft.uuid,
          tx
        )

      const newCover = images?.coverImage ?? []
      const newGallery = images?.galleryImages ?? []
      const newMenu = images?.menuImages ?? []

      const newImages: RestaurantImageInput[] = []

      if (newCover[0]) {

        newImages.push({
          type: RestaurantImageType.COVER,
          image: newCover[0],
          sortOrder: 0,
        })
      }

      newGallery.forEach((image, index) => {

        newImages.push({
          type: RestaurantImageType.GALLERY,
          image,
          sortOrder: index + 1,
        })
      })

      newMenu.forEach((image, index) => {

        newImages.push({
          type: RestaurantImageType.MENU,
          image,
          sortOrder: index,
        })
      })

      const deletedSet = new Set(deletedImages)

      const remainingImages =
        existingImages.filter(
          img => !deletedSet.has(img.uuid)
        )

      const remainingCover =
        remainingImages.filter(
          i => i.type === RestaurantImageType.COVER
        )

      const remainingGallery =
        remainingImages.filter(
          i => i.type === RestaurantImageType.GALLERY
        )

      const remainingMenu =
        remainingImages.filter(
          i => i.type === RestaurantImageType.MENU
        )

      const finalCoverCount =
        remainingCover.length + newCover.length

      const finalGalleryCount =
        remainingGallery.length + newGallery.length

      const finalMenuCount =
        remainingMenu.length + newMenu.length

      if (finalCoverCount === 0) {

        throw new ApiError('封面圖片必填', {
          status: 400,
          code: 'COVER_IMAGE_REQUIRED'
        })
      }

      if (finalCoverCount > 1) {

        throw new ApiError('封面圖片僅能上傳 1 張', {
          status: 400,
          code: 'COVER_IMAGE_LIMIT_EXCEEDED'
        })
      }

      if (finalGalleryCount > 10) {

        throw new ApiError('展示圖片最多 10 張', {
          status: 400,
          code: 'GALLERY_IMAGE_LIMIT_EXCEEDED'
        })
      }

      if (finalMenuCount === 0) {

        throw new ApiError('至少需上傳 1 張菜單圖片', {
          status: 400,
          code: 'MENU_IMAGE_REQUIRED'
        })
      }

      if (finalMenuCount > 10) {

        throw new ApiError('菜單圖片最多 10 張', {
          status: 400,
          code: 'MENU_IMAGE_LIMIT_EXCEEDED'
        })
      }

      // 刪除 draft 圖片
      let draftImagesToDelete: ImageDraftLite[] = []

      if (deletedImages.length) {

        draftImagesToDelete =
          existingImages.filter(
            img => deletedSet.has(img.uuid)
          )

        await restaurantDraftImageRepo.deleteImagesByUuid(
          draftImagesToDelete.map(img => img.uuid),
          tx
        )
      }

      // 新增 draft 圖片
      if (newImages.length) {

        await restaurantDraftImageRepo.insertImages(

          newImages.map(img => ({
            uuid: uuidv4(),

            restaurantDraftUuid: draft.uuid,

            type: img.type,

            url: img.image.url,

            publicId: img.image.publicId,

            sourceType: RestaurantDraftImageSource.DRAFT_UPLOAD,   // 圖片來源（草稿上傳）

            sortOrder: img.sortOrder,
          })),

          tx
        )
      }

      return {
        draftUuid: draft.uuid,

        draftImagesToDelete,
      }
    })

    // 只有 DRAFT_UPLOAD 才刪 Cloudinary
    const uploadedDraftImages =
      result.draftImagesToDelete.filter(
        img => img.sourceType === RestaurantDraftImageSource.DRAFT_UPLOAD
      )

    if (uploadedDraftImages.length) {

      deleteCloudinaryImages(
        uploadedDraftImages.map(
          img => img.publicId
        )
      )
    }

    return

  } catch (err) {

    if (err instanceof Prisma.PrismaClientKnownRequestError) {

      throw new ApiError('資料庫操作失敗', {
        status: 500,
        code: 'DB_ERROR',
        debugMessage: err.message,
        cause: err,
      })
    }

    handleServiceError(err, '更新餐廳失敗')
  }
}

// #endregion

// #region 刪除餐廳（Owner）
export async function deleteOwnerRestaurant({
  ownerUuid,
  restaurantUuid,
  displayStatus
}: {
  ownerUuid: string
  restaurantUuid: string
  displayStatus: RestaurantOwnerStatus
}) {

  try {

    const result = await withPrismaTransaction(async tx => {

      const restaurant =
        await restaurantRepo.findByUUID(
          restaurantUuid,
          tx
        )

      const draft =
        await restaurantDraftRepo.findByRestaurantUuid(
          restaurantUuid,
          tx
        )

      let shouldDeleteFolder = false

      // 已上線正式餐廳
      if (
        displayStatus === RestaurantOwnerStatus.PUBLISHED
      ) {

        if (!restaurant) {
          throw new ApiError('找不到餐廳', {
            status: 404,
            code: 'RESTAURANT_NOT_FOUND',
          })
        }

        if (restaurant.ownerUuid !== ownerUuid) {
          throw new ApiError('無權限', {
            status: 403,
            code: 'FORBIDDEN',
          })
        }

        await restaurantRepo.deleteRestaurant(
          restaurant.uuid,
          tx
        )

        shouldDeleteFolder = true

        return {
          folderUuid: restaurant.uuid,
          shouldDeleteFolder,

          deletedDraftImages: [],
        }
      }

      // draft 狀態
      if (!draft) {

        throw new ApiError('找不到草稿', {
          status: 404,
          code: 'DRAFT_NOT_FOUND',
        })
      }

      if (draft.ownerUuid !== ownerUuid) {

        throw new ApiError('無權限', {
          status: 403,
          code: 'FORBIDDEN',
        })
      }

      const draftImages =
        await restaurantDraftImageRepo.findByDraftUuid(
          draft.uuid,
          tx
        )

      await restaurantDraftRepo.deleteDraft(
        draft.uuid,
        tx
      )

      if (!restaurant) {
        shouldDeleteFolder = true
      }

      return {
        folderUuid:
          restaurantUuid,

        shouldDeleteFolder,

        deletedDraftImages: draftImages,
      }
    })

    // 刪除整個 folder
    if (result.shouldDeleteFolder) {

      const folderPath =
        `uploads/${IMAGE_FOLDERS.RESTAURANT}/${result.folderUuid}`

      deleteCloudFolder(folderPath)
    }

    // 只刪除 draft upload 圖片
    else {

      const uploadedDraftImages =
        result.deletedDraftImages.filter(
          img =>
            img.sourceType ===
            RestaurantDraftImageSource.DRAFT_UPLOAD
        )

      if (uploadedDraftImages.length) {

        deleteCloudinaryImages(
          uploadedDraftImages.map(
            img => img.publicId
          )
        )
      }
    }

    return

  } catch (err) {

    handleServiceError(err, '刪除餐廳失敗')
  }
}
// #endregion