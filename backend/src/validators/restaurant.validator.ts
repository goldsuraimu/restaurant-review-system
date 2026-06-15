import { CreateRestaurantDto, UpdateRestaurantDto } from '#/types/dto'
import { ApiError } from '#/utils/api-error'

export function validateCreateRestaurant(body: CreateRestaurantDto | UpdateRestaurantDto) {
  const {
    name,
    nameEn,
    category,
    location,
    phone,
    description,
  } = body;

  if (!name || name.length < 2 || name.length > 50) {
    throw new ApiError('餐廳名稱格式不正確', {
      status: 400,
      code: 'INVALID_RESTAURANT_NAME',
    });
  }

  if (nameEn && !/^[A-Za-z\s.'&-]{2,50}$/.test(nameEn)) {
    throw new ApiError('英文名稱格式不正確', {
      status: 400,
      code: 'INVALID_RESTAURANT_NAME_EN',
    });
  }

  if (!category || category.length > 30) {
    throw new ApiError('餐廳類別格式不正確', {
      status: 400,
      code: 'INVALID_RESTAURANT_CATEGORY',
    });
  }

  if (!location || location.length < 5 || location.length > 100) {
    throw new ApiError('地址格式不正確', {
      status: 400,
      code: 'INVALID_RESTAURANT_LOCATION',
    });
  }

  if (phone && !/^0[2-9]\d{7,8}(?:(?:\s*|#|[eE][xX][tT])\d{1,5})?$/.test(phone)) {
    throw new ApiError('電話格式不正確', {
      status: 400,
      code: 'INVALID_RESTAURANT_PHONE',
    });
  }

  if (description && description.length > 500) {
    throw new ApiError('介紹內容過長', {
      status: 400,
      code: 'INVALID_RESTAURANT_DESCRIPTION',
    });
  }
}
