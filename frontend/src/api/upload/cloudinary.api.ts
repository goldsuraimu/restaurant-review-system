import axios from 'axios'
import type { ApiError } from '@/types'
import { normalizeAxiosError } from '@/api/error/normalizeError'

type CloudinaryUploadResponse = {
  url: string
  publicId: string
}

export async function uploadToCloudinaryApi(
  cloudName: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<
  | { ok: true; data: CloudinaryUploadResponse }
  | { ok: false; error: ApiError }
> {
  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        timeout: 30000,
        onUploadProgress: (event) => {
          if (event.total && onProgress) {
            const percent = Math.round(
              (event.loaded / event.total) * 100
            )
            onProgress(percent)
          }
        }
      }
    )

    return {
      ok: true,
      data: {
        url: res.data.secure_url,
        publicId: res.data.public_id,
      }
    }

  } catch (err) {
    return {
      ok: false,
      error: normalizeAxiosError(err),
    }
  }
}