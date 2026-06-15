import { ref } from 'vue'

import { uploadToCloudinaryApi } from '@/api/upload/cloudinary.api'
import { getUploadSignApi } from '@/api/upload/upload.api'
import { normalizeAxiosError } from '@/api/error/normalizeError'

import type { ApiError } from '@/types'
import { createValidationError } from '@/api/error/factories/createValidationError'

type UploadResult =
  | {
    ok: true
    data: {
      url: string
      publicId: string
    }
  }
  | {
    ok: false
    error: ApiError
  }

type UploadType = 'gallery' | 'cover' | 'menu' | 'review'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const MAX_UPLOAD_COUNT: Record<UploadType, number> = {
  gallery: 10,
  cover: 1,
  menu: 10,
  review: 6,
}

interface UploadParamsMap {
  // 餐廳資料夾類型
  gallery: { restaurantUuid: string }
  cover: { restaurantUuid: string }
  menu: { restaurantUuid: string }
  // 評論類型，需要兩個 UUID
  review: { restaurantUuid: string; reviewUuid: string }
}

type ValidationResult =
  | { ok: true }
  | { ok: false; error: ApiError }

// 使用 WeakMap 保證每個 File 都有唯一 key（不污染物件）
const fileKeyMap = new WeakMap<File, string>()

// 產生唯一 key（只會生成一次）
function getFileKey(file: File) {
  let key = fileKeyMap.get(file)

  if (!key) {
    key = crypto.randomUUID()
    fileKeyMap.set(file, key)
  }

  return key
}

// 單純驗證檔案格式用，實際上傳前也會再驗證一次
export function validateFiles(
  files: File[],
  type?: UploadType
): ValidationResult {

  // =========================
  // 檔案格式白名單
  // =========================
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  // 數量驗證
  if (type) {
    const maxCount = MAX_UPLOAD_COUNT[type]

    if (files.length > maxCount) {
      return {
        ok: false,
        error: createValidationError(
          `最多只能上傳 ${maxCount} 張圖片`
        )
      }
    }
  }

  for (const file of files) {

    // 檔案大小驗證
    if (file.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        error: createValidationError(
          `圖片不可超過 5MB:${file.name}`
        )
      }
    }

    // 禁止 SVG
    if (file.type === 'image/svg+xml') {
      return {
        ok: false,
        error: createValidationError('SVG 不允許上傳')
      }
    }

    // 非法格式
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        ok: false,
        error: createValidationError('不支援的圖片格式')
      }
    }
  }

  return { ok: true }
}

// 單檔驗證入口
export function validateFile(
  file: File,
  type?: UploadType
): ValidationResult {
  return validateFiles([file], type)
}


export function useCloudinaryUpload() {
  const uploading = ref(false)

  // 用 key - based 管理每張圖片進度
  const progressMap = ref<Record<string, number>>({})

  /**
   * 單張上傳
   * @param file 檔案
   * @param type 類型（review / restaurant）
   * @param params 給雲端資料夾用的分支 uuid
   * @param uuid 給雲端資料夾用的終端 uuid（例如 reviewUuid）
   */
  async function uploadImage<T extends UploadType>(
    file: File,
    type: T,
    params: UploadParamsMap[T],
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {

    try {
      const signRes = await getUploadSignApi(type, {
        ...params,
      })

      if (!signRes.ok) {
        return { ok: false, error: signRes.error }
      }

      const {
        timestamp,
        signature,
        apiKey,
        cloudName,
        folder,
        publicId,
      } = signRes.data

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('public_id', publicId)

      const uploadRes = await uploadToCloudinaryApi(
        cloudName,
        formData,
        (p) => {
          const key = getFileKey(file)
          progressMap.value[key] = p

          if (onProgress) onProgress(p)
        }
      )

      if (!uploadRes.ok) {
        return { ok: false, error: uploadRes.error }
      }

      // 上傳完成後清掉 progress
      const key = getFileKey(file)

      setTimeout(() => {
        delete progressMap.value[key]
      }, 300)

      return {
        ok: true,
        data: {
          ...uploadRes.data,
        }
      }
    } catch (err: unknown) {
      return {
        ok: false,
        error: normalizeAxiosError(err)
      }
    }
  }

  /**
  * 單張上傳
  */
  async function uploadSingle<T extends UploadType>(
    file: File,
    type: T,
    params: UploadParamsMap[T],
  ): Promise<UploadResult> {

    const validation = validateFile(
      file,
      type
    )

    if (!validation.ok) {
      return {
        ok: false,
        error: validation.error
      }
    }

    return uploadImage(file, type, params)
  }

  /**
   * 多張上傳
   */
  async function uploadMultiple<T extends UploadType>(
    files: File[],
    type: T,
    params: UploadParamsMap[T],
  ): Promise<
    | { ok: true; data: { url: string; publicId: string }[] }
    | { ok: false; error: ApiError }
  > {
    uploading.value = true

    const validation = validateFiles(
      files,
      type
    )

    if (!validation.ok) {
      uploading.value = false
      return {
        ok: false,
        error: validation.error
      }
    }


    // 初始化 progress
    progressMap.value = {}

    files.forEach(file => {
      const key = getFileKey(file)
      progressMap.value[key] = 0
    })


    const results: { url: string; publicId: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const res = await uploadImage(
        file,
        type,
        params,
      )


      if (!res.ok) {
        uploading.value = false
        return { ok: false, error: res.error }
      }

      // 上傳成功後填寫 url & publicId
      results.push({
        url: res.data.url,
        publicId: res.data.publicId
      })
    }

    uploading.value = false
    return { ok: true, data: results }
  }

  return {
    uploading,
    progressMap, // 每張圖片的進度

    uploadImage,
    uploadSingle,
    uploadMultiple,

    getFileKey
  }
}