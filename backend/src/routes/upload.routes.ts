import { Router } from 'express'
import { signUpload } from '#/controllers/upload.controller'

const router = Router()

// 取得 Cloudinary 簽名
router.get('/sign', signUpload)

export default router