import { Router } from 'express';
import * as authController from '#/controllers/auth.controller';

const router: Router = Router();

// 註冊
router.post('/register', authController.register);

// 登入
router.post('/login', authController.login);

// 重新整理 Token
router.post('/refresh-token', authController.refresh);

// 登出
router.post('/logout', authController.logout);

export default router;



